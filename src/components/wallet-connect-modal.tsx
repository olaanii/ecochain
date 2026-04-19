"use client";

import { useState } from "react";
import { X, Wallet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/wallet-context";
import { useToast } from "@/components/ui/use-toast";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connect, disconnect, isConnected, isConnecting, error, isCorrectChain } = useWallet();
  const { toast } = useToast();
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async () => {
    try {
      setIsConnectingWallet(true);
      await connect();
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected.",
        variant: "success",
      });
      onClose();
    } catch (err) {
      toast({
        title: "Connection Failed",
        description: err instanceof Error ? err.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
        variant: "default",
      });
      onClose();
    } catch (err) {
      toast({
        title: "Disconnect Failed",
        description: err instanceof Error ? err.message : "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to interact with the EcoChain protocol.
          </p>
        </div>

        {!isCorrectChain && isConnected && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Wrong Network
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Please switch to the EcoChain network.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-xs text-destructive/80">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {isConnected ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Wallet Connected
                </p>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                Your wallet is connected and ready to use.
              </p>
            </div>

            <button
              onClick={handleDisconnect}
              disabled={isConnectingWallet}
              className={cn(
                "w-full flex items-center justify-center gap-2 p-3 rounded-lg border",
                "hover:bg-secondary transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isConnectingWallet ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              <span>Disconnect Wallet</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnectingWallet || isConnecting}
            className={cn(
              "w-full flex items-center justify-center gap-2 p-4 rounded-lg",
              "bg-primary text-primary-foreground font-medium",
              "hover:opacity-90 transition-opacity",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isConnectingWallet || isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                <span>Connect Initia Wallet</span>
              </>
            )}
          </button>
        )}

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            By connecting, you agree to the EcoChain Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
