# TopNavBar Component Test Documentation

## Task 2.1 Implementation Summary

This document describes the implementation of Task 2.1: Update TopNavBar to support 'landing' and 'app' variants.

## Changes Made

### 1. Added Variant Support
- Added `variant` prop with options: 'landing' | 'app' (defaults to 'app')
- Made `navItems` prop optional (uses default app navigation when not provided)

### 2. Default App Navigation Links
When variant is 'app' and no navItems are provided, displays:
- Dashboard (/dashboard)
- Discover (/discover)
- Merchants (/merchants)
- Verification (/verification)
- Bridge (/bridge)

### 3. Clerk UserButton Integration
- Displays Clerk UserButton when user is signed in
- Shows "Sign In" button when user is not signed in
- Custom appearance styling to match app theme

### 4. InterwovenKit Wallet Connection
- Displays wallet connection button for authenticated users in 'app' variant
- Shows connected wallet address (truncated) when wallet is connected
- Shows "Connect Wallet" button when wallet is not connected
- Includes InterwovenKit modal component for wallet management

### 5. Active Route Highlighting
- Uses `usePathname()` hook to detect current route
- Highlights active navigation link with border-bottom and color change
- Improved matching logic: exact match or starts with route path

### 6. Variant-Specific Behavior

#### 'app' variant:
- Shows full navigation links (Dashboard, Discover, Merchants, Verification, Bridge)
- Displays wallet connection button (for authenticated users)
- Shows UserButton or Sign In button

#### 'landing' variant:
- Shows simplified navigation (no default nav items)
- Displays "Go to Dashboard" button for authenticated users
- Shows "Sign In" button for unauthenticated users
- Includes UserButton for authenticated users

### 7. Responsive Design
- Navigation links hidden on mobile (< 768px) with `hidden md:flex`
- Wallet connection button hidden on mobile with `hidden md:block`
- Maintains consistent layout across screen sizes

## Requirements Validated

✅ **Requirement 1.1**: Navigation component displays links to Dashboard, Discover, Merchants, Verification, Bridge
✅ **Requirement 1.2**: Consistent navigation component on authenticated pages
✅ **Requirement 1.4**: Active route highlighting implemented
✅ **Requirement 1.5**: Simplified public navigation for landing page
✅ **Requirement 1.6**: Displays user authentication status
✅ **Requirement 1.7**: Provides sign-out action (via UserButton)

## Component Interface

```typescript
interface TopNavBarProps {
  variant?: "landing" | "app";
  navItems?: NavItem[];
  brandName?: string;
}

interface NavItem {
  label: string;
  href: string;
}
```

## Usage Examples

### App Variant (Default)
```tsx
<TopNavBar />
// or
<TopNavBar variant="app" />
```

### Landing Variant
```tsx
<TopNavBar variant="landing" />
```

### Custom Navigation Items
```tsx
<TopNavBar 
  variant="app"
  navItems={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Verification", href: "/verification" },
  ]}
/>
```

## Dependencies
- `@clerk/nextjs`: UserButton, SignInButton, useUser
- `@initia/interwovenkit-react`: InterwovenKit, useInterwovenKit
- `next/navigation`: usePathname
- `next/link`: Link component

## Backward Compatibility
- Existing usage in `app-shell.tsx` continues to work (navItems prop is now optional)
- No breaking changes to the component API
