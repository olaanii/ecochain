import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TopNavBar } from "@/components/layout/top-nav-bar";

export default function VerificationCameraPage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e]">
      <TopNavBar variant="app" />
      <Breadcrumbs />
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-[#f3ffca] mb-4">
          Camera Verification
        </h1>
        <p className="text-[#adaaaa]">
          This is a nested route demonstrating breadcrumb navigation.
        </p>
        <p className="text-[#adaaaa] mt-2">
          The breadcrumbs above show: Verification → Camera
        </p>
      </div>
    </div>
  );
}
