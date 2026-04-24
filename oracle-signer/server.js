import 'dotenv/config';
import express from 'express';
import { ethers } from 'ethers';

const app = express();
app.use(express.json());

// Environment variables
const ORACLE_SIGNER_PRIVATE_KEY = process.env.ORACLE_SIGNER_PRIVATE_KEY;
const VERIFIER_ADDRESS = process.env.NEXT_PUBLIC_ECO_VERIFIER_ADDRESS;
const ORACLE_SIGNATURE_TTL_SECONDS = parseInt(process.env.ORACLE_SIGNATURE_TTL_SECONDS || '3600');

if (!ORACLE_SIGNER_PRIVATE_KEY) {
  throw new Error('ORACLE_SIGNER_PRIVATE_KEY is required');
}

if (!VERIFIER_ADDRESS) {
  throw new Error('NEXT_PUBLIC_ECO_VERIFIER_ADDRESS is required');
}

// Create wallet from private key
const wallet = new ethers.Wallet(ORACLE_SIGNER_PRIVATE_KEY);

// EIP-712 Domain
const domain = {
  name: 'EcoVerifier',
  version: '1',
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1'),
  verifyingContract: VERIFIER_ADDRESS,
};

// EIP-712 Types
const types = {
  Attestation: [
    { name: 'user', type: 'address' },
    { name: 'taskId', type: 'uint256' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
  ],
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', oracle: wallet.address });
});

// Sign attestation endpoint
app.post('/sign', async (req, res) => {
  try {
    const { user, taskId } = req.body;

    if (!ethers.isAddress(user)) {
      return res.status(400).json({ error: 'Invalid user address' });
    }

    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({ error: 'Invalid taskId' });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const expiry = timestamp + ORACLE_SIGNATURE_TTL_SECONDS;

    const value = {
      user,
      taskId: ethers.toBigInt(taskId),
      timestamp: BigInt(timestamp),
      expiry: BigInt(expiry),
    };

    const signature = await wallet.signTypedData(domain, types, value);

    res.json({
      signature,
      timestamp,
      expiry,
      oracle: wallet.address,
    });
  } catch (error) {
    console.error('Signing error:', error);
    res.status(500).json({ error: 'Failed to sign attestation' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Oracle signer running on port ${PORT}`);
  console.log(`Oracle address: ${wallet.address}`);
});
