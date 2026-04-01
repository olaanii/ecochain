"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

export interface UserProfileProps {
  showDetails?: boolean;
  className?: string;
}

export function UserProfile({
  showDetails = true,
  className
}: UserProfileProps) {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div
        className={clsx(
          "flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 backdrop-blur-sm",
          className
        )}
      >
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-700" />
        {showDetails && (
          <div className="flex flex-col gap-1">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-700" />
            <div className="h-2 w-16 animate-pulse rounded bg-slate-700" />
          </div>
        )}
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className={clsx("flex items-center gap-2", className)}>
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </div>
    );
  }

  const displayName = user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "User";
  const avatarUrl = user.imageUrl;

  return (
    <div
      className={clsx(
        "flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 backdrop-blur-sm",
        className
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="h-8 w-8 rounded-full border border-emerald-400/30"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-sm font-semibold text-emerald-400">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      
      {showDetails && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-200">
            {displayName}
          </span>
          {user.primaryEmailAddress && (
            <span className="text-xs text-slate-400">
              {user.primaryEmailAddress.emailAddress}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
