"use client";

import dynamic from "next/dynamic";
import { ComponentType, ReactNode } from "react";

interface LazyLoadOptions {
  loading?: ComponentType;
  ssr?: boolean;
}

/**
 * Create a lazy-loaded component with a loading skeleton
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: LazyLoadOptions
) {
  return dynamic(importFn, {
    loading: options?.loading || (() => <div>Loading...</div>),
    ssr: options?.ssr ?? false,
  });
}

/**
 * Predefined loading skeletons for common component types
 */
export const LoadingSkeletons = {
  // Chart skeleton
  Chart: () => (
    <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full" />
  ),
  
  // Form skeleton
  Form: () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded" />
      <div className="h-12 bg-gray-200 rounded" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
  ),
  
  // Table skeleton
  Table: () => (
    <div className="space-y-2 animate-pulse">
      <div className="h-8 bg-gray-200 rounded" />
      <div className="h-8 bg-gray-200 rounded" />
      <div className="h-8 bg-gray-200 rounded" />
      <div className="h-8 bg-gray-200 rounded" />
    </div>
  ),
  
  // Card skeleton
  Card: () => (
    <div className="animate-pulse bg-gray-200 rounded-lg h-48 w-full" />
  ),
  
  // Dashboard skeleton
  Dashboard: () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 bg-gray-200 rounded-lg" />
        <div className="h-24 bg-gray-200 rounded-lg" />
        <div className="h-24 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-64 bg-gray-200 rounded-lg" />
    </div>
  ),
};
