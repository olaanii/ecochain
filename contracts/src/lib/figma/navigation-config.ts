import type { NavigationStructure } from "./types";

/**
 * Navigation configuration for all Figma screens
 */
export const figmaNavigationConfig: NavigationStructure = {
  screens: [
    {
      id: "screen-1",
      label: "Screen 1",
      route: "/figma-screens/screen-1",
      access: "public"
    },
    {
      id: "screen-2",
      label: "Screen 2",
      route: "/figma-screens/screen-2",
      access: "public"
    },
    {
      id: "screen-3",
      label: "Screen 3",
      route: "/figma-screens/screen-3",
      access: "public"
    },
    {
      id: "screen-4",
      label: "Screen 4",
      route: "/figma-screens/screen-4",
      access: "public"
    },
    {
      id: "screen-5",
      label: "Screen 5",
      route: "/figma-screens/screen-5",
      access: "public"
    },
    {
      id: "screen-6",
      label: "Screen 6",
      route: "/figma-screens/screen-6",
      access: "public"
    },
    {
      id: "screen-7",
      label: "Screen 7",
      route: "/figma-screens/screen-7",
      access: "public"
    },
    {
      id: "screen-8",
      label: "Screen 8",
      route: "/figma-screens/screen-8",
      access: "public"
    },
    {
      id: "screen-9",
      label: "Screen 9",
      route: "/figma-screens/screen-9",
      access: "public"
    },
    {
      id: "screen-10",
      label: "Screen 10",
      route: "/figma-screens/screen-10",
      access: "public"
    }
  ],
  breadcrumbs: {
    enabled: true,
    showHome: true,
    separator: "/",
    maxItems: 4
  },
  transitions: {
    type: "fade",
    duration: 300,
    easing: "ease-in-out"
  }
};
