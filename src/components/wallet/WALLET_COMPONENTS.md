# Wallet Components Documentation

## Overview

The wallet components provide a complete solution for wallet connection, management, and disconnection in the Eco Rewards Platform.

## Component Hierarchy

```
WalletPanel (Main Container)
├── WalletConnectButton
│   └── Shows when disconnected
│   └── Shows when connected (address display)
├── WalletStatus
│   └── Shows when connected
│   └── Displays connection and chain status
├── AutosignToggle
│   └── Shows when connected
│   └── Manages transaction signing preferences
└── WalletDisconnectButton
    └── Shows when connected
    └── Provides disconnect functionality
```

## Component Details

### WalletConnectButton

**Purpose:** Primary wallet connection interface

**Props:** None (uses WalletContext)

**States:**
- Disconnected: Shows "Connect Wallet" button
- Connecting: Shows spinner and "Connecting..." text
- Connected: Shows shortened wallet address with copy button
- Error: Shows error message below button

**Usage:**
```tsx
import { WalletConnectButton } from "@/components/wallet";

export function Header() {
  return <WalletConnectButton />;
}
```

**Features:**
- Automatic address shortening (first 8 + last 4 characters)
- Copy-to-clipboard with visual feedback
- Green connection indicator dot
- Loading state with spinner
- Error message display
- Responsive design

---

### WalletStatus

**Purpose:** Display wallet connection and chain information

**Props:** None (uses WalletContext)

**States:**
- Disconnected: Hidden
- Connected to correct chain: Shows green checkmark
- Connected to wrong chain: Shows yellow alert

**Usage:**
```tsx
import { WalletStatus } from "@/components/wallet";

export function Dashboard() {
  return <WalletStatus />;
}
```

**Features:**
- Connection status indicator
- Chain validation status
- Wallet address display
- Username display
- Chain ID display
- Wrong chain warning message

---

### WalletDisconnectButton

**Purpose:** Safely disconnect wallet with confirmation

**Props:** None (uses WalletContext)

**States:**
- Disconnected: Hidden
- Connected: Shows red "Disconnect" button
- Confirming: Shows confirmation dialog
- Disconnecting: Shows spinner and "Disconnecting..." text

**Usage:**
```tsx
import { WalletDisconnectButton } from "@/components/wallet";

export function Settings() {
  return <WalletDisconnectButton />;
}
```

**Features:**
- Confirmation dialog prevents accidental disconnection
- Loading state during disconnection
- Error handling with user-friendly messages
- Session data cleanup
- Destructive action styling (red button)
- Cancel option in confirmation dialog

---

### AutosignToggle

**Purpose:** Manage auto-sign session for transaction signing

**Props:** None (uses AutosignContext)

**States:**
- Disconnected: Hidden
- Connected, auto-sign disabled: Shows "Enable Auto-sign" button
- Connected, auto-sign enabled: Shows "Auto-sign Enabled" with checkmark
- Session expiring: Shows countdown timer
- Session expired: Shows fallback to manual signing message

**Usage:**
```tsx
import { AutosignToggle } from "@/components/wallet";

export function TransactionSettings() {
  return <AutosignToggle />;
}
```

**Features:**
- Enable/disable auto-sign toggle
- Session expiry countdown
- Session refresh button
- Expiring soon warning (5 minutes before expiry)
- Fallback to manual signing indicator
- Error handling

---

### WalletPanel

**Purpose:** Comprehensive wallet management interface

**Props:** 
- `className?: string` - Additional CSS classes

**States:**
- Disconnected: Shows connect button and description
- Connected: Shows status, auto-sign settings, and disconnect button

**Usage:**
```tsx
import { WalletPanel } from "@/components/wallet";

export function Sidebar() {
  return <WalletPanel />;
}
```

**Features:**
- Combines all wallet components
- Responsive card layout
- Contextual display based on connection state
- Clear visual hierarchy
- Organized sections with labels
- Proper spacing and styling

---

## Context Integration

All components use the `WalletContext` for state management:

```tsx
interface WalletContextType {
  address?: string;              // EVM address
  initiaAddress?: string;        // Initia wallet address
  chainId?: string;              // Current chain ID
  isConnected: boolean;          // Connection status
  isConnecting: boolean;         // Loading state
  error?: Error;                 // Error object
  connect: () => Promise<void>;  // Connect function
  disconnect: () => Promise<void>; // Disconnect function
  isCorrectChain: boolean;       // Chain validation
  username?: string;             // Wallet username
}
```

Access the context:
```tsx
import { useWallet } from "@/contexts/wallet-context";

export function MyComponent() {
  const { isConnected, initiaAddress } = useWallet();
  // ...
}
```

---

## Styling

All components use Tailwind CSS and follow the project's design system:

- **Colors:** Emerald/teal for primary, red for destructive
- **Spacing:** Consistent padding and margins
- **Typography:** Semantic font sizes and weights
- **Borders:** Subtle borders with appropriate colors
- **Shadows:** Minimal shadows for depth
- **Transitions:** Smooth transitions for interactions

### Customization

Override default styles:
```tsx
<WalletPanel className="bg-blue-50 border-blue-200" />
```

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- **Semantic HTML:** Proper use of buttons, divs, and text elements
- **ARIA Labels:** Descriptive labels for screen readers
- **Keyboard Navigation:** Full keyboard support
- **Color Contrast:** Minimum 4.5:1 ratio for text
- **Focus Indicators:** Visible focus states for keyboard users
- **Loading States:** Announced to screen readers

---

## Error Handling

Components handle errors gracefully:

1. **Connection Errors:** Displayed below connect button
2. **Disconnection Errors:** Displayed in confirmation dialog
3. **Session Errors:** Displayed in auto-sign toggle
4. **Network Errors:** Handled with retry capability

Users can retry failed operations by clicking the button again.

---

## Performance Optimization

- **Minimal Re-renders:** Uses React hooks efficiently
- **Context Optimization:** Only re-renders when context changes
- **Lazy Loading:** Wallet data loaded on demand
- **Session Caching:** Uses browser session storage
- **No Polling:** Event-driven updates

---

## Testing

### Unit Tests
```tsx
import { render, screen } from "@testing-library/react";
import { WalletConnectButton } from "@/components/wallet";
import { WalletProvider } from "@/contexts/wallet-context";

test("renders connect button when disconnected", () => {
  render(
    <WalletProvider>
      <WalletConnectButton />
    </WalletProvider>
  );
  
  expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
});
```

### Integration Tests
- Test wallet connection flow
- Test disconnect with confirmation
- Test auto-sign session management
- Test error recovery

---

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

---

## Dependencies

- React 19.2.4+
- @initia/interwovenkit-react
- wagmi
- lucide-react (icons)
- Tailwind CSS

---

## Related Files

- `src/contexts/wallet-context.tsx` - Wallet state management
- `src/contexts/autosign-context.tsx` - Auto-sign state management
- `src/lib/wallet/session-storage.ts` - Session storage utilities
- `src/lib/wallet/auto-sign-manager.ts` - Auto-sign logic

---

## Troubleshooting

### Components not rendering
1. Ensure `WalletProvider` wraps your app
2. Check that components are imported correctly
3. Verify CSS is loaded (Tailwind)

### Wallet not connecting
1. Ensure Initia wallet extension is installed
2. Check browser console for errors
3. Verify chain ID matches environment

### Session expiring too quickly
1. Adjust session duration in `AutosignToggle`
2. Check browser's session storage settings
3. Verify system clock is correct

---

## Future Enhancements

- [ ] Multi-wallet support
- [ ] Wallet balance display in panel
- [ ] Transaction history in panel
- [ ] Staking status in panel
- [ ] Notification badges
- [ ] Dark mode support
- [ ] Internationalization (i18n)

---

## Support

For issues or questions:
1. Check component source code
2. Review context implementations
3. Check browser console for errors
4. Refer to Initia documentation
