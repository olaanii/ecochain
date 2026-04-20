## Plan: Final UI Polish & Initia Appchain Release

The UI needs a final responsive polish (fixing overlaps, introducing container queries) and the project must be fully verified for deployment to the Initia testnet.

**Steps**
1. **Responsive UI Polish (Container Queries & Overlaps)**
   - Add `overflow-x-hidden` to `src/app/page.tsx` and main layout wrappers to prevent horizontal scrolling caused by absolute positioned elements (like the hero leaves).
   - Implement Tailwind `@container` queries for card grids (`src/components/landing/ecosystem-section.tsx` & `grow-section.tsx`) so internal padding and typography scale relative to the container width, not just the viewport.
   - Adjust breakpoints in `src/components/landing/*` to smooth the transition between `sm` and `lg` screens, preventing awkward mid-sized tablet layouts.

2. **Appchain Integration Finishing (Initia Testnet)**
   - Audit `src/components/providers.tsx` (or where `InterwovenKitProvider` is setup) to ensure the `customChain` config correctly targets the Initia testnet (e.g., `network_type: 'testnet'`, `bech32_prefix: 'init'`).
   - Ensure the JSON-RPC endpoints for the EVM appchain are correctly defined and that native assets are configured (e.g., `GAS` with 18 decimals).
   - Verify polyfills (`Buffer`, `process`) are present in the app's root to prevent EVM wallet connection errors (as required by the Initia SDK).

3. **Final Verification & Build**
   - Run `npm run build` to ensure all TypeScript and layout changes compile perfectly.
   - Boot up the UI to ensure no horizontal scrollbars appear and verify the wallet modal successfully attempts connection to the Initia network.

**Relevant files**
- `src/app/page.tsx` — Apply `overflow-x-hidden`.
- `src/components/landing/ecosystem-section.tsx` — Update grid layouts to utilize `@container` classes.
- `src/components/providers.tsx` — Finalize the `InterwovenKitProvider` payload for EVM testnet settings.

**Verification**
1. Resize the browser window from 320px to 1440px on the landing page — ensure no horizontal scrollbars appear and cards scale smoothly via container queries.
2. Confirm the connect wallet flow utilizes the appropriate Chain ID for the Initia testnet.

**Decisions**
- Using native Tailwind `@container` queries instead of standard media queries for component-level, fluid responsiveness.
- Setting explicit EVM/Initia variables exactly per the `initia-appchain-dev` specifications to avoid cross-chain wallet failures.
