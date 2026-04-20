## Plan: Unify UI to Warm Clay-Morphism Light Mode

The current UI is inconsistent, mixing a light/warm landing page, a dark dashboard, and a beige trading interface. This plan aligns the entire application to the "Warm Clay-Morphism" light mode aesthetic using standardized Tailwind utility classes.

**Steps**
1. **Unify Global Theme (CSS & Tailwind Setup)**
   - Update src/app/globals.css and Tailwind configuration to establish the primary warm/cream background (`#f5f0e1`) and mint/emerald accents as the default palette.
   - Remove conflicting dark mode overrides (zinc/dark) and the separate celestial trading theme variables.
   
2. **Refactor Core UI Components (*parallel with step 3*)**
   - Update src/components/ui/button.tsx (if present, or equivalent) to include the clay-morphism/landing-style variants instead of hardcoded colors in individual sections.
   - Standardize `TopNavBar` components (e.g. mapping to dashboard and landing headers) to use the unified warm theme consistently.

3. **Redesign Dashboard & Trading Interfaces**
   - Refactor src/components/dashboard/dashboard-layout.tsx to switch from the dark/zinc theme to the user's preferred warm cream background.
   - Refactor src/components/dashboard/trading/trading-dashboard.tsx (or equivalent trading screens) to replace its isolated beige/navy theme with the standard warm theme.
   - Update component backgrounds, borders, and shadows to match the clay-morphism style.

4. **Typography & Accessibility Pass**
   - Apply the display font (Space Grotesk) consistently to all headers in the Dashboard and Trading interfaces.
   - Ensure descriptive `alt` tags and ARIA labels are added to decorative images (e.g., in src/components/landing/hero-section.tsx).

**Relevant files**
- src/app/globals.css — Configure Tailwind with the warm palette and typography.
- src/components/ui/button.tsx — Add warm/clay-morphism variants.
- src/components/dashboard/dashboard-layout.tsx — Apply warm theme, remove dark mode classes.
- Trading interfaces within `src/components/dashboard/trading/` — Remove custom celestial theme, apply warm theme.

**Verification**
1. Run the local development server (`pnpm dev`) and manually navigate smoothly between the Landing Page, Dashboard, and Trading interfaces without jarring theme changes.
2. Inspect the Dashboard and Trading screens to ensure they use the cream background, clay-morphism buttons, and Space Grotesk headers across the board.

**Decisions**
- Unified entirely around the "Warm Clay-Morphism" light mode.
- Standardized components to use Tailwind utility classes mapping to a unified configuration, removing heavily fragmented CSS variable overrides.
