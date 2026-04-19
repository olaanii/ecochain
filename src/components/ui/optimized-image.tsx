import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

/**
 * Optimized Image Component
 * 
 * Wraps Next.js Image with:
 * - Loading state
 * - Error handling
 * - Performance optimizations
 * - Responsive sizing
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 75,
  placeholder = "empty",
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle missing/empty src
  if (!src || src === "") {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className || ""}`}
        style={fill ? { position: "absolute", inset: 0 } : { width, height }}
      >
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className || ""}`}
        style={fill ? { position: "absolute", inset: 0 } : { width, height }}
      >
        <span className="text-gray-400 text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ""}`} style={!fill ? { width, height } : undefined}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={{ zIndex: 0 }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        style={{ zIndex: 1 }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}

/**
 * Predefined image configurations for common use cases
 */
export const ImageConfigs = {
  // Avatar images
  avatar: {
    sizes: "(max-width: 768px) 100vw, 64px",
    quality: 80,
    placeholder: "blur" as const,
  },
  
  // Hero/banner images
  hero: {
    sizes: "100vw",
    quality: 85,
    priority: true,
  },
  
  // Card images
  card: {
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    quality: 75,
  },
  
  // Thumbnail images
  thumbnail: {
    sizes: "(max-width: 768px) 100vw, 200px",
    quality: 70,
  },
  
  // Logo images
  logo: {
    sizes: "200px",
    quality: 90,
    priority: true,
  },
} as const;
