"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  rows?: number;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function CardSkeleton({ 
  rows = 3, 
  showHeader = true, 
  showFooter = false 
}: CardSkeletonProps) {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      {showHeader && (
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      
      {showFooter && (
        <div className="pt-4 border-t flex justify-end gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}
    </div>
  );
}
