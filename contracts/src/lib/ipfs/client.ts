/**
 * IPFS/Pinata Client
 * 
 * Handles proof data upload to IPFS via Pinata
 * Stores IPFS hash in verification metadata
 * 
 * Requirements: 3.7, 29.9
 */

/**
 * Upload proof data to IPFS via Pinata
 * 
 * Requirements: 3.7, 29.9
 * 
 * @param proofData The proof data to upload (base64 or raw data)
 * @param fileName Optional file name for the proof
 * @returns IPFS hash or null if upload fails
 */
export async function uploadProofToIPFS(
  proofData: string,
  fileName: string = 'proof'
): Promise<string | null> {
  try {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataApiSecret = process.env.PINATA_API_SECRET;

    if (!pinataApiKey || !pinataApiSecret) {
      console.error('[IPFS] Pinata credentials not configured');
      return null;
    }

    // Convert proof data to blob
    const blob = new Blob([proofData], { type: 'application/octet-stream' });
    const formData = new FormData();
    formData.append('file', blob, fileName);

    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataApiSecret,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[IPFS] Pinata upload failed:', error);
      return null;
    }

    const result = await response.json() as { IpfsHash: string };
    return result.IpfsHash;
  } catch (error) {
    console.error('[IPFS] Error uploading to IPFS:', error);
    return null;
  }
}

/**
 * Get IPFS gateway URL for a hash
 * 
 * @param ipfsHash The IPFS hash
 * @returns Full IPFS gateway URL
 */
export function getIPFSGatewayUrl(ipfsHash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}

/**
 * Validate IPFS hash format
 * IPFS hashes (CIDv0) are 46 characters starting with "Qm"
 * 
 * @param hash The hash to validate
 * @returns True if valid IPFS hash format
 */
export function validateIPFSHash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') {
    return false;
  }

  // CIDv0 format: Qm followed by 44 base58 characters
  const ipfsHashRegex = /^Qm[a-zA-Z0-9]{44}$/;
  return ipfsHashRegex.test(hash);
}
