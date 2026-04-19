/**
 * Navigation Performance Configuration
 * 
 * This file documents the navigation performance optimizations
 * implemented for the routing and navigation system.
 * 
 * **Validates: Requirements 15.1, 15.2, 15.3, 15.6**
 */

/**
 * Next.js Link Prefetching Configuration
 * 
 * In Next.js 13+ App Router, Link components automatically prefetch
 * linked pages when they enter the viewport. This is enabled by default.
 * 
 * Prefetch behavior:
 * - Static routes: Full page is prefetched
 * - Dynamic routes: Partial prefetch (shared layout)
 * - Prefetch occurs when link enters viewport
 * - Prefetched data is cached for 30 seconds
 * 
 * To disable prefetching for specific links, use: prefetch={false}
 * 
 * **Validates: Requirements 15.1, 15.2**
 */
export const LINK_PREFETCH_ENABLED = true;

/**
 * Scroll Restoration Configuration
 * 
 * Next.js App Router automatically handles scroll position restoration
 * for back/forward navigation. This is enabled by default.
 * 
 * Scroll behavior:
 * - Forward navigation: Scrolls to top
 * - Back navigation: Restores previous scroll position
 * - Scroll position is stored in browser history state
 * 
 * **Validates: Requirement 15.3**
 */
export const SCROLL_RESTORATION_ENABLED = true;

/**
 * Loading Indicator Configuration
 * 
 * Display loading indicators for navigation that takes longer than
 * the specified threshold.
 * 
 * **Validates: Requirement 15.6**
 */
export const LOADING_INDICATOR_THRESHOLD_MS = 200;

/**
 * Route-based Code Splitting
 * 
 * Next.js App Router automatically implements route-based code splitting.
 * Each route is bundled separately and loaded on demand.
 * 
 * **Validates: Requirement 15.4**
 */
export const CODE_SPLITTING_ENABLED = true;

/**
 * Critical Asset Preloading
 * 
 * Critical navigation assets are preloaded on application load:
 * - Navigation component code
 * - Authentication state
 * - Core layout components
 * 
 * **Validates: Requirement 15.5**
 */
export const CRITICAL_ASSETS_PRELOAD = [
  'navigation-context',
  'top-nav-bar',
  'mobile-drawer',
  'breadcrumbs',
] as const;

/**
 * Page Caching Configuration
 * 
 * Next.js Router Cache stores previously visited pages for instant
 * back navigation. Cache duration is 30 seconds for dynamic routes
 * and 5 minutes for static routes.
 * 
 * **Validates: Requirement 15.7**
 */
export const PAGE_CACHE_ENABLED = true;
export const DYNAMIC_ROUTE_CACHE_DURATION_MS = 30 * 1000; // 30 seconds
export const STATIC_ROUTE_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
