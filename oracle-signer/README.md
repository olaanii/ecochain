# EcoChain Oracle Signer

Off-chain oracle signer service for EIP-712 attestations. Deployed on Fly.io free tier.

## Setup

1. Install dependencies:
```bash
cd oracle-signer
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Run locally:
```bash
pnpm dev
```

## Deploy to Fly.io

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Login:
```bash
fly auth login
```

3. Set secrets:
```bash
fly secrets set ORACLE_SIGNER_PRIVATE_KEY=0x... --app ecochain-oracle-signer
fly secrets set NEXT_PUBLIC_ECO_VERIFIER_ADDRESS=0x... --app ecochain-oracle-signer
fly secrets set NEXT_PUBLIC_CHAIN_ID=1 --app ecochain-oracle-signer
```

4. Deploy:
```bash
fly deploy
```

## API Endpoints

### GET /health
Health check endpoint.

### POST /sign
Sign an EIP-712 attestation.

**Request:**
```json
{
  "user": "0x...",
  "taskId": "123"
}
```

**Response:**
```json
{
  "signature": "0x...",
  "timestamp": 1713920000,
  "expiry": 1713923600,
  "oracle": "0x..."
}
```
