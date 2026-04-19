"use client";

import { useState } from "react";
import { Lock, Unlock, Calculator, TrendingUp, Clock, History, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/contexts/wallet-context";
import { useToast } from "@/components/ui/use-toast";
import { GasEstimator, GasSpeed } from "@/components/gas-estimator";

interface StakingDashboardProps {
  className?: string;
}

interface StakingHistory {
  id: string;
  type: "stake" | "unstake" | "claim";
  amount: string;
  duration?: number;
  timestamp: number;
  status: "completed" | "pending";
}

export function StakingDashboard({ className }: StakingDashboardProps) {
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [selectedGas, setSelectedGas] = useState<GasSpeed>("average");
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);

  const stakedAmount = "1000.00";
  const rewards = "45.50";
  const apy = "18.5";

  // Mock staking history - replace with API data
  const stakingHistory: StakingHistory[] = [
    {
      id: "1",
      type: "stake",
      amount: "500.00",
      duration: 90,
      timestamp: Date.now() - 86400000 * 30,
      status: "completed",
    },
    {
      id: "2",
      type: "stake",
      amount: "500.00",
      duration: 30,
      timestamp: Date.now() - 86400000 * 15,
      status: "completed",
    },
    {
      id: "3",
      type: "claim",
      amount: "45.50",
      timestamp: Date.now() - 86400000 * 7,
      status: "completed",
    },
  ];

  const handleStake = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to stake tokens.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to stake.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsStaking(true);
      // Mock staking - replace with actual contract call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast({
        title: "Staking Successful",
        description: `You have staked ${amount} INIT for ${duration} days.`,
        variant: "success",
      });
      
      setAmount("");
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: error instanceof Error ? error.message : "Failed to stake tokens",
        variant: "destructive",
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to unstake tokens.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUnstaking(true);
      // Mock unstaking - replace with actual contract call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast({
        title: "Unstaking Successful",
        description: "Your tokens have been unstaked.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Unstaking Failed",
        description: error instanceof Error ? error.message : "Failed to unstake tokens",
        variant: "destructive",
      });
    } finally {
      setIsUnstaking(false);
    }
  };

  const calculateRewards = () => {
    if (!amount) return "0.00";
    const principal = parseFloat(amount);
    const rate = parseFloat(apy) / 100;
    const estimatedRewards = principal * rate * (duration / 365);
    return estimatedRewards.toFixed(2);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Staked Amount</span>
          </div>
          <div className="text-2xl font-bold">{stakedAmount} INIT</div>
        </div>
        
        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Total Rewards</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {rewards} INIT
          </div>
        </div>
        
        <div className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calculator className="h-4 w-4" />
            <span className="text-sm">APY</span>
          </div>
          <div className="text-2xl font-bold">{apy}%</div>
        </div>
      </div>

      {/* Stake Form */}
      <div className="p-4 border rounded-lg space-y-4">
        <h3 className="font-semibold">Stake Tokens</h3>
        
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Amount (INIT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={!isConnected}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Duration</label>
          <div className="flex gap-2">
            {[30, 60, 90, 180].map((days) => (
              <button
                key={days}
                onClick={() => setDuration(days)}
                className={cn(
                  "flex-1 px-3 py-2 border rounded-md text-sm transition-colors",
                  duration === days
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary",
                  !isConnected && "opacity-50 cursor-not-allowed"
                )}
                disabled={!isConnected}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {amount && (
          <div className="p-3 bg-secondary rounded-md space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Estimated Rewards</span>
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              +{calculateRewards()} INIT
            </div>
          </div>
        )}

        <GasEstimator onGasSelect={setSelectedGas} />

        <button
          onClick={handleStake}
          disabled={!isConnected || isStaking || !amount}
          className={cn(
            "w-full py-3 rounded-md font-medium transition-colors",
            "bg-primary text-primary-foreground hover:opacity-90",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isStaking ? "Staking..." : isConnected ? "Stake Tokens" : "Connect Wallet"}
        </button>
      </div>

      {/* Unstake Section */}
      {parseFloat(stakedAmount) > 0 && (
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold">Unstake Tokens</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Staked Amount</div>
              <div className="text-lg font-bold">{stakedAmount} INIT</div>
            </div>
            
            <button
              onClick={handleUnstake}
              disabled={!isConnected || isUnstaking}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors",
                "border hover:bg-secondary",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isUnstaking ? (
                "Unstaking..."
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Unstake
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Staking History */}
      <div className="p-4 border rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <History className="h-4 w-4" />
            Staking History
          </h3>
          <button className="text-xs text-primary hover:underline">
            View All
          </button>
        </div>
        
        <div className="space-y-2">
          {stakingHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    item.type === "stake" ? "bg-green-500/10" : 
                    item.type === "unstake" ? "bg-yellow-500/10" : 
                    "bg-blue-500/10"
                  )}
                >
                  {item.type === "stake" && <Lock className="h-4 w-4 text-green-600" />}
                  {item.type === "unstake" && <Unlock className="h-4 w-4 text-yellow-600" />}
                  {item.type === "claim" && <TrendingUp className="h-4 w-4 text-blue-600" />}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    {item.duration && ` (${item.duration} days)`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "font-medium text-sm",
                  item.type === "stake" ? "text-[var(--color-text-muted)]" :
                  item.type === "unstake" ? "text-[var(--color-text-muted)]" :
                  "text-[var(--color-primary)]"
                )}>
                  {item.type === "stake" ? "-" : item.type === "unstake" ? "+" : "+"}{item.amount} INIT
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
