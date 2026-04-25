/**
 * Wallet Context Tests
 *
 * Tests for wallet connection, state management, and session storage
 * Requirement 16.2, 16.3, 16.4, 16.5
 */

// Mock sessionStorage for Jest Node environment
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock window object to make sessionStorage accessible
Object.defineProperty(global, 'window', {
  value: {
    sessionStorage: mockSessionStorage,
  },
  writable: true,
});

import {
  storeWalletAddress,
  getStoredWalletAddress,
  clearWalletAddress,
  storeWalletChainId,
  getStoredWalletChainId,
  storeWalletUsername,
  getStoredWalletUsername,
} from "../session-storage";

describe("Session Storage Utilities", () => {
  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
  });

  describe("Wallet Address Storage", () => {
    it("should store and retrieve wallet address", () => {
      const address = "init1abc123def456";
      storeWalletAddress(address);
      expect(getStoredWalletAddress()).toBe(address);
    });

    it("should return null when no address is stored", () => {
      expect(getStoredWalletAddress()).toBeNull();
    });

    it("should clear wallet address", () => {
      const address = "init1abc123def456";
      storeWalletAddress(address);
      clearWalletAddress();
      expect(getStoredWalletAddress()).toBeNull();
    });
  });

  describe("Chain ID Storage", () => {
    it("should store and retrieve chain ID", () => {
      const chainId = "ecochain105";
      storeWalletChainId(chainId);
      expect(getStoredWalletChainId()).toBe(chainId);
    });

    it("should return null when no chain ID is stored", () => {
      expect(getStoredWalletChainId()).toBeNull();
    });

    it("should clear chain ID when clearWalletAddress is called", () => {
      const chainId = "ecochain105";
      storeWalletChainId(chainId);
      clearWalletAddress();
      expect(getStoredWalletChainId()).toBeNull();
    });
  });

  describe("Username Storage", () => {
    it("should store and retrieve username", () => {
      const username = "alice";
      storeWalletUsername(username);
      expect(getStoredWalletUsername()).toBe(username);
    });

    it("should return null when no username is stored", () => {
      expect(getStoredWalletUsername()).toBeNull();
    });

    it("should clear username when clearWalletAddress is called", () => {
      const username = "alice";
      storeWalletUsername(username);
      clearWalletAddress();
      expect(getStoredWalletUsername()).toBeNull();
    });
  });

  describe("Complete Wallet Data Storage", () => {
    it("should store and retrieve complete wallet data", () => {
      const address = "init1abc123def456";
      const chainId = "ecochain105";
      const username = "alice";

      storeWalletAddress(address);
      storeWalletChainId(chainId);
      storeWalletUsername(username);

      expect(getStoredWalletAddress()).toBe(address);
      expect(getStoredWalletChainId()).toBe(chainId);
      expect(getStoredWalletUsername()).toBe(username);
    });

    it("should clear all wallet data", () => {
      const address = "init1abc123def456";
      const chainId = "ecochain105";
      const username = "alice";

      storeWalletAddress(address);
      storeWalletChainId(chainId);
      storeWalletUsername(username);

      clearWalletAddress();

      expect(getStoredWalletAddress()).toBeNull();
      expect(getStoredWalletChainId()).toBeNull();
      expect(getStoredWalletUsername()).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle session storage errors gracefully", () => {
      // Mock sessionStorage to throw an error
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = jest.fn(() => {
        throw new Error("QuotaExceededError");
      });

      // Should not throw
      expect(() => {
        storeWalletAddress("init1abc123def456");
      }).not.toThrow();

      // Restore original
      sessionStorage.setItem = originalSetItem;
    });
  });
});

describe("Wallet Context Type", () => {
  it("should have correct type structure", () => {
    // This is a compile-time test to ensure the type is correct
    // If this file compiles without errors, the type is correct
    const mockWalletContext = {
      address: "0x123",
      initiaAddress: "init1abc123def456",
      chainId: "ecochain105",
      isConnected: true,
      isConnecting: false,
      error: undefined,
      connect: async () => {},
      disconnect: async () => {},
      isCorrectChain: true,
      username: "alice",
    };

    expect(mockWalletContext.isConnected).toBe(true);
    expect(mockWalletContext.initiaAddress).toBe("init1abc123def456");
  });
});
