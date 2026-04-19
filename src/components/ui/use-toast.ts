import { useToast as useToastRadix, toast as toastFunction } from "@/components/ui/toast";

export function useToast() {
  return useToastRadix();
}

export { toastFunction as toast };
