# Oracle Key Rotation Runbook

Rotate every **90 days** or immediately on suspected compromise.

## Prerequisites
- Access to Fly.io signer app secrets (`fly secrets set`)
- `DEFAULT_ADMIN_ROLE` on `EcoVerifier` contract
- Deployer private key

## Steps

### 1. Generate new keypair
```bash
# Using libsodium (Node.js)
node -e "
const sodium = require('libsodium-wrappers');
sodium.ready.then(() => {
  const kp = sodium.crypto_sign_keypair();
  console.log('PUBLIC:', Buffer.from(kp.publicKey).toString('hex'));
  console.log('SECRET:', Buffer.from(kp.privateKey).toString('hex'));
});
"
```
Store the secret key in a password manager immediately. Never log it.

### 2. Deploy new signer app with new key
```bash
fly secrets set ORACLE_PRIVATE_KEY=<new-hex-key> -a ecochain-oracle
fly deploy -a ecochain-oracle
```

### 3. Grant ORACLE_ROLE to new oracle address on-chain
```bash
# Derive address from new public key (EVM uses secp256k1 — use cast wallet)
NEW_ORACLE_ADDR=$(cast wallet address --private-key $NEW_PRIVATE_KEY)

cast send $ECO_VERIFIER_ADDR \
  "grantRole(bytes32,address)" \
  $(cast keccak "ORACLE_ROLE") \
  $NEW_ORACLE_ADDR \
  --private-key $ADMIN_KEY --rpc-url $RPC_URL
```

### 4. Update web app to point to new signer URL + HMAC secret
```bash
# Vercel: rotate ORACLE_SIGNER_URL and ORACLE_HMAC_SECRET env vars
vercel env add ORACLE_SIGNER_URL production
vercel env add ORACLE_HMAC_SECRET production
# Redeploy
vercel --prod
```

### 5. Revoke old ORACLE_ROLE
```bash
cast send $ECO_VERIFIER_ADDR \
  "revokeRole(bytes32,address)" \
  $(cast keccak "ORACLE_ROLE") \
  $OLD_ORACLE_ADDR \
  --private-key $ADMIN_KEY --rpc-url $RPC_URL
```

### 6. Decommission old signer app
```bash
fly scale count 0 -a ecochain-oracle-old
```

### 7. Verify
```bash
# Confirm old addr no longer has ORACLE_ROLE
cast call $ECO_VERIFIER_ADDR \
  "hasRole(bytes32,address)" \
  $(cast keccak "ORACLE_ROLE") $OLD_ORACLE_ADDR \
  --rpc-url $RPC_URL
# Must return 0x000...0 (false)
```

### 8. Write audit log entry
Record the rotation in `AuditLog` via the admin panel or:
```ts
await writeAuditLog({
  actorId: yourClerkId,
  action: AuditActions.CONTRACT_UPGRADED,
  resource: "EcoVerifier",
  resourceId: ECO_VERIFIER_ADDR,
  payload: { event: "oracle_key_rotation", oldOracle, newOracle: NEW_ORACLE_ADDR },
});
```
