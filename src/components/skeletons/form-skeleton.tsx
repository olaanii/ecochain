"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface FormSkeletonProps {
  fields?: number;
  showHeader?: boolean;
  showSubmit?: boolean;
}

export function FormSkeleton({ 
  fields = 4, 
  showHeader = true, 
  showSubmit = true 
}: FormSkeletonProps) {
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      )}
      
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      
      {showSubmit && (
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      )}
    </div>
  );
}
