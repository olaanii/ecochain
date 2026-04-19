"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageProps } from "next/image";
import clsx from "clsx";

export interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  fallbackSrc?: string;
  showLoadingState?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder.png",
  showLoadingState = true,
  className,
  ...rest
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <div className="relative">
      {showLoadingState && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={clsx(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "grayscale",
          className
        )}
        {...rest}
      />
    </div>
  );
}
