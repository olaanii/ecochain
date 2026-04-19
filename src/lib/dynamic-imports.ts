/**
 * Dynamic Import Utility for Heavy Libraries
 * 
 * Dynamically imports heavy libraries to reduce initial bundle size.
 * Libraries are loaded only when needed.
 */

/**
 * Dynamically import charting libraries
 */
export async function loadChartLibrary() {
  if (typeof window === "undefined") return null;

  try {
    const recharts = await import("recharts");
    return recharts;
  } catch (error) {
    console.error("[Dynamic Imports] Failed to load chart library:", error);
    return null;
  }
}

/**
 * Dynamically import InterwovenKit
 */
export async function loadInterwovenKit() {
  if (typeof window === "undefined") return null;

  try {
    const interwovenKit = await import("@initia/interwovenkit-react");
    return interwovenKit;
  } catch (error) {
    console.error("[Dynamic Imports] Failed to load InterwovenKit:", error);
    return null;
  }
}

/**
 * Dynamically import date-fns
 */
export async function loadDateFns() {
  if (typeof window === "undefined") return null;

  try {
    const dateFns = await import("date-fns");
    return dateFns;
  } catch (error) {
    console.error("[Dynamic Imports] Failed to load date-fns:", error);
    return null;
  }
}

/**
 * Dynamically import lodash
 */
export async function loadLodash() {
  if (typeof window === "undefined") return null;

  try {
    const lodash = await import("lodash");
    return lodash;
  } catch (error) {
    console.error("[Dynamic Imports] Failed to load lodash:", error);
    return null;
  }
}

/**
 * Preload libraries
 * Call this during idle time or before user interaction
 */
export async function preloadLibraries() {
  const promises = [
    loadChartLibrary(),
    loadDateFns(),
    loadLodash(),
  ];

  await Promise.allSettled(promises);
}
