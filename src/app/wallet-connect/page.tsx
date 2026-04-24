"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";

export default function WalletConnectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect") || "/dashboard";
  
  const { address, isConnected, connect } = useWallet();
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState("");
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    // Check if wallet is already linked
    fetch("/api/user/wallet")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.hasWallet) {
          setLinked(true);
          setTimeout(() => router.push(redirect), 1000);
        }
      });
  }, [router, redirect]);

  const handleConnect = async () => {
    if (!isConnected || !address) {
      await connect();
      return;
    }

    setLinking(true);
    setError("");

    try {
      const res = await fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initiaAddress: address }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to link wallet");
      }

      setLinked(true);
      setTimeout(() => router.push(redirect), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLinking(false);
    }
  };

  if (linked) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-[#2d3435] mb-2">Wallet Connected</h1>
          <p className="text-sm text-[#5a6061]">
            Your wallet has been successfully linked to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-[#f2f4f4] rounded-xl flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-[#2d3435]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#2d3435] mb-2">Connect Your Wallet</h1>
          <p className="text-sm text-[#5a6061]">
            Link your Initia wallet to access sponsor features and manage campaigns.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 bg-[#f2f4f4] rounded-xl">
            <p className="text-xs font-medium text-[#5a6061] mb-1">Current Status</p>
            <p className="text-sm font-medium text-[#2d3435]">
              {isConnected ? `Connected: ${address?.slice(0, 8)}...${address?.slice(-6)}` : "Not connected"}
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={linking}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d3435] px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {linking ? (
              "Linking..."
            ) : isConnected ? (
              "Link Wallet to Account"
            ) : (
              "Connect Wallet"
            )}
          </button>

          <button
            onClick={() => router.back()}
            className="w-full text-sm text-[#5a6061] hover:text-[#2d3435] transition-colors"
          >
            Cancel
          </button>
        </div>

        <p className="mt-6 text-xs text-center text-[#5a6061]">
          Your wallet address will be used for sponsor transactions and campaign management.
        </p>
      </div>
    </div>
  );
}
