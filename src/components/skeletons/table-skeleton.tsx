"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  showHeader = true 
}: TableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {showHeader && (
        <div className="flex gap-4 pb-4 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-6 flex-1" />
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 items-center py-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className="h-4 flex-1" 
                style={{ width: `${Math.random() * 30 + 70}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
