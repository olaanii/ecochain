/**
 * Asset configuration for images and media
 */
export interface AssetConfig {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
}

/**
 * Image optimization settings
 */
export interface ImageOptimization {
  formats: ('webp' | 'avif' | 'png' | 'jpg')[];
  quality: number;
  responsive: boolean;
}

/**
 * Asset reference with metadata
 */
export interface AssetReference {
  id: string;
  type: 'image' | 'icon' | 'video' | 'document';
  src: string;
  alt?: string;
  title?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  optimization: {
    lazy: boolean;
    priority: boolean;
    formats: string[];
    quality: number;
  };
}

/**
 * Screen configuration metadata
 */
export interface ScreenMetadata {
  figmaUrl?: string;
  lastUpdated: Date;
  version: string;
  responsive: boolean;
  accessibility: 'AA' | 'AAA';
}

/**
 * Responsive breakpoint configuration
 */
export interface ResponsiveBreakpoint {
  mobile: string;
  tablet: string;
  desktop: string;
}

/**
 * Component variant definition
 */
export interface ComponentVariant {
  name: string;
  props: Record<string, unknown>;
  description: string;
}

/**
 * Navigation item definition
 */
export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  children?: NavigationItem[];
  access: 'public' | 'authenticated' | 'admin';
}

/**
 * Breadcrumb configuration
 */
export interface BreadcrumbConfig {
  enabled: boolean;
  showHome: boolean;
  separator: string;
  maxItems: number;
}

/**
 * Transition configuration
 */
export interface TransitionConfig {
  type: 'fade' | 'slide' | 'none';
  duration: number;
  easing: string;
}

/**
 * Navigation structure for the application
 */
export interface NavigationStructure {
  screens: NavigationItem[];
  breadcrumbs: BreadcrumbConfig;
  transitions: TransitionConfig;
}
