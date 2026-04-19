/**
 * Web Vitals Monitoring
 * 
 * Tracks Core Web Vitals and custom performance metrics:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

type MetricRating = "good" | "needs-improvement" | "poor";

interface WebVitalMetric {
  name: string;
  value: number;
  rating: MetricRating;
  delta: number;
  id: string;
  navigationType?: string;
}

/**
 * Web Vitals thresholds
 */
const VITAL_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // in milliseconds
  FID: { good: 100, poor: 300 }, // in milliseconds
  CLS: { good: 0.1, poor: 0.25 }, // unitless
  FCP: { good: 1800, poor: 3000 }, // in milliseconds
  TTFB: { good: 800, poor: 1800 }, // in milliseconds
} as const;

/**
 * Get rating for a metric based on its value
 */
function getRating(
  name: keyof typeof VITAL_THRESHOLDS,
  value: number
): MetricRating {
  const thresholds = VITAL_THRESHOLDS[name];
  if (!thresholds) return "good";
  
  if (value <= thresholds.good) return "good";
  if (value <= thresholds.poor) return "needs-improvement";
  return "poor";
}

/**
 * Report metric to analytics
 */
function reportMetric(metric: WebVitalMetric): void {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Web Vitals]", metric);
  }

  // Send to Vercel Analytics
  if (typeof window !== "undefined" && (window as any).va) {
    (window as any).va("event", `web_vital_${metric.name.toLowerCase()}`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigation_type: metric.navigationType,
    });
  }

  // Send to custom analytics endpoint if configured
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "web_vital",
        properties: metric,
        timestamp: Date.now(),
      }),
    }).catch((error) => {
      console.error("[Web Vitals] Failed to send metric:", error);
    });
  }

  // Send to Sentry if configured
  if (typeof window !== "undefined" && (window as any).Sentry) {
    if (metric.rating === "poor") {
      (window as any).Sentry.captureMessage(
        `Poor Web Vital: ${metric.name} (${metric.value}ms)`,
        "warning"
      );
    }
  }
}

/**
 * Load web-vitals library dynamically
 */
async function loadWebVitals() {
  if (typeof window === "undefined") return null;

  try {
    const { onCLS, onFID, onLCP, onFCP, onTTFB } = await import("web-vitals");

    return {
      onCLS,
      onFID,
      onLCP,
      onFCP,
      onTTFB,
    };
  } catch (error) {
    console.error("[Web Vitals] Failed to load web-vitals:", error);
    return null;
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export async function initWebVitals(): Promise<void> {
  if (typeof window === "undefined") return;

  const webVitals = await loadWebVitals();
  if (!webVitals) return;

  // Track LCP (Largest Contentful Paint)
  webVitals.onLCP((metric) => {
    reportMetric({
      name: "LCP",
      value: metric.value,
      rating: getRating("LCP", metric.value),
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    });
  });

  // Track FID (First Input Delay)
  webVitals.onFID((metric) => {
    reportMetric({
      name: "FID",
      value: metric.value,
      rating: getRating("FID", metric.value),
      delta: metric.delta,
      id: metric.id,
    });
  });

  // Track CLS (Cumulative Layout Shift)
  webVitals.onCLS((metric) => {
    reportMetric({
      name: "CLS",
      value: metric.value,
      rating: getRating("CLS", metric.value),
      delta: metric.delta,
      id: metric.id,
    });
  });

  // Track FCP (First Contentful Paint)
  webVitals.onFCP((metric) => {
    reportMetric({
      name: "FCP",
      value: metric.value,
      rating: getRating("FCP", metric.value),
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    });
  });

  // Track TTFB (Time to First Byte)
  webVitals.onTTFB((metric) => {
    reportMetric({
      name: "TTFB",
      value: metric.value,
      rating: getRating("TTFB", metric.value),
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    });
  });
}

/**
 * Custom performance metrics
 */
export class CustomPerformanceMetrics {
  private static marks = new Map<string, number>();

  /**
   * Start measuring a custom metric
   */
  static startMark(name: string): void {
    if (typeof window === "undefined" || !window.performance) return;
    
    window.performance.mark(`${name}-start`);
    this.marks.set(name, Date.now());
  }

  /**
   * End measuring a custom metric
   */
  static endMark(name: string): number | null {
    if (typeof window === "undefined" || !window.performance) return null;
    
    const startTime = this.marks.get(name);
    if (!startTime) return null;

    window.performance.mark(`${name}-end`);
    
    try {
      window.performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = window.performance.getEntriesByName(name)[0];
      const duration = measure.duration;

      this.marks.delete(name);

      // Report the custom metric
      reportMetric({
        name: `custom_${name}`,
        value: duration,
        rating: duration < 1000 ? "good" : duration < 3000 ? "needs-improvement" : "poor",
        delta: duration,
        id: `${name}-${Date.now()}`,
      });

      return duration;
    } catch (error) {
      console.error("[Performance Metrics] Failed to measure:", error);
      return null;
    }
  }

  /**
   * Measure component render time
   */
  static measureComponentRender(componentName: string): void {
    const startMark = `component-${componentName}-start`;
    const endMark = `component-${componentName}-end`;

    if (typeof window !== "undefined" && window.performance) {
      window.performance.mark(startMark);
      
      requestAnimationFrame(() => {
        window.performance.mark(endMark);
        try {
          window.performance.measure(
            `component-${componentName}`,
            startMark,
            endMark
          );
          
          const measure = window.performance.getEntriesByName(
            `component-${componentName}`
          )[0];
          
          reportMetric({
            name: `component_render_${componentName}`,
            value: measure.duration,
            rating:
              measure.duration < 16
                ? "good"
                : measure.duration < 100
                ? "needs-improvement"
                : "poor",
            delta: measure.duration,
            id: `${componentName}-${Date.now()}`,
          });
        } catch (error) {
          console.error("[Performance Metrics] Failed to measure component:", error);
        }
      });
    }
  }

  /**
   * Get navigation timing metrics
   */
  static getNavigationTiming(): Record<string, number> | null {
    if (typeof window === "undefined" || !window.performance) return null;

    const timing = window.performance.timing;
    if (!timing) return null;

    return {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.navigationStart,
      download: timing.responseEnd - timing.responseStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      domComplete: timing.domComplete - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
    };
  }

  /**
   * Report navigation timing
   */
  static reportNavigationTiming(): void {
    const timing = this.getNavigationTiming();
    if (!timing) return;

    Object.entries(timing).forEach(([name, value]) => {
      reportMetric({
        name: `navigation_${name}`,
        value,
        rating: value < 1000 ? "good" : value < 3000 ? "needs-improvement" : "poor",
        delta: value,
        id: `nav-${name}-${Date.now()}`,
      });
    });
  }
}

/**
 * React Hook for Web Vitals
 */
export function useWebVitals() {
  return {
    init: initWebVitals,
    startMark: CustomPerformanceMetrics.startMark.bind(CustomPerformanceMetrics),
    endMark: CustomPerformanceMetrics.endMark.bind(CustomPerformanceMetrics),
    measureComponent: CustomPerformanceMetrics.measureComponentRender.bind(
      CustomPerformanceMetrics
    ),
    getNavigationTiming: CustomPerformanceMetrics.getNavigationTiming.bind(
      CustomPerformanceMetrics
    ),
    reportNavigationTiming: CustomPerformanceMetrics.reportNavigationTiming.bind(
      CustomPerformanceMetrics
    ),
  };
}
