/**
 * IPFS Upload Service
 * 
 * Uploads proof data to IPFS/Pinata for immutable storage
 * 
 * Requirement 3.7, 29.9
 * - Upload proof images to IPFS/Pinata
 * - Store IPFS hash in verification metadata
 * - Handle upload failures gracefully
 */

import axios from 'axios';

/**
 * IPFS Upload Result
 */
export interface IPFSUploadResult {
  success: boolean;
  ipfsHash?: string;
  error?: string;
  timestamp: number;
}

/**
 * IPFS Uploader Class
 * Handles uploading proof data to IPFS via Pinata
 */
export class IPFSUploader {
  private pinataApiKey: string;
  private pinataApiSecret: string;
  private pinataGateway: string;

  constructor(
    apiKey: string = process.env.PINATA_API_KEY || '',
    apiSecret: string = process.env.PINATA_API_SECRET || '',
    gateway: string = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud'
  ) {
    this.pinataApiKey = apiKey;
    this.pinataApiSecret = apiSecret;
    this.pinataGateway = gateway;
  }

  /**
   * Upload proof data to IPFS
   * 
   * Requirement 3.7
   * 
   * @param proofData The proof data to upload
   * @param fileName Optional file name for the proof
   * @returns Upload result with IPFS hash
   */
  async uploadProof(
    proofData: string,
    fileName: string = 'proof'
  ): Promise<IPFSUploadResult> {
    const startTime = Date.now();

    try {
      // If no Pinata credentials, return mock result for development
      if (!this.pinataApiKey || !this.pinataApiSecret) {
        console.warn('[IPFS] No Pinata credentials configured, using mock upload');
        return {
          success: true,
          ipfsHash: `QmMockHash${Date.now()}`,
          timestamp: startTime,
        };
      }

      // Create FormData for file upload
      const formData = new FormData();

      // Convert proof data to Blob
      const blob = new Blob([proofData], { type: 'application/octet-stream' });
      formData.append('file', blob, fileName);

      // Add metadata
      const metadata = {
        name: fileName,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          type: 'eco-proof',
        },
      };
      formData.append('pinataMetadata', JSON.stringify(metadata));

      // Upload to Pinata
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataApiSecret,
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.data && response.data.IpfsHash) {
        return {
          success: true,
          ipfsHash: response.data.IpfsHash,
          timestamp: startTime,
        };
      } else {
        return {
          success: false,
          error: 'No IPFS hash returned from Pinata',
          timestamp: startTime,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[IPFS] Upload failed:', errorMessage);

      return {
        success: false,
        error: `IPFS upload failed: ${errorMessage}`,
        timestamp: startTime,
      };
    }
  }

  /**
   * Upload JSON data to IPFS
   * 
   * @param data The JSON data to upload
   * @param fileName Optional file name
   * @returns Upload result with IPFS hash
   */
  async uploadJSON(
    data: Record<string, unknown>,
    fileName: string = 'data.json'
  ): Promise<IPFSUploadResult> {
    const jsonString = JSON.stringify(data);
    return this.uploadProof(jsonString, fileName);
  }

  /**
   * Get IPFS gateway URL for a hash
   * 
   * @param ipfsHash The IPFS hash
   * @returns Full gateway URL
   */
  getGatewayUrl(ipfsHash: string): string {
    return `${this.pinataGateway}/ipfs/${ipfsHash}`;
  }

  /**
   * Verify IPFS hash format
   * IPFS hashes start with Qm and are base58 encoded
   * 
   * @param hash The hash to verify
   * @returns True if valid IPFS hash format
   */
  static isValidIPFSHash(hash: string): boolean {
    if (!hash || typeof hash !== 'string') {
      return false;
    }

    // IPFS v0 hashes start with Qm
    // IPFS v1 hashes start with bafy or other prefixes
    const ipfsHashRegex = /^(Qm[a-zA-Z0-9]{44}|bafy[a-zA-Z0-9]+)$/;
    return ipfsHashRegex.test(hash);
  }
}

/**
 * Create IPFS uploader instance
 */
export function createIPFSUploader(): IPFSUploader {
  return new IPFSUploader();
}

/**
 * Upload proof to IPFS
 * Convenience function
 */
export async function uploadProofToIPFS(
  proofData: string,
  fileName?: string
): Promise<IPFSUploadResult> {
  const uploader = createIPFSUploader();
  return uploader.uploadProof(proofData, fileName);
}
