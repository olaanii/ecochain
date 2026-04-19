"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { WalletConnectModal } from "@/components/wallet-connect-modal";

export function WalletConnectButton() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsWalletModalOpen(true)}
        className="btn-primary inline-flex items-center gap-2"
      >
        Connect Wallet
        <ArrowRight className="h-4 w-4" />
      </button>
      <WalletConnectModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </>
  );
}
