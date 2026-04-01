import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import Link from "next/link";

export default function MerchantsPage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e]">
      <TopNavBar variant="app" />
      {/* Breadcrumbs will NOT display here (top-level route) */}
      <Breadcrumbs />
      
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-[#f3ffca] mb-4">
          Merchants
        </h1>
        <p className="text-[#adaaaa] mb-6">
          This is a top-level route. Notice that breadcrumbs are NOT displayed here
          (Requirement 11.5).
        </p>
        
        <div className="space-y-4">
          <div className="border border-[rgba(73,72,71,0.3)] rounded-lg p-4">
            <h2 className="text-xl font-semibold text-[#f3ffca] mb-2">
              Hub Main
            </h2>
            <p className="text-[#adaaaa] mb-3">
              Navigate to a nested route to see breadcrumbs in action.
            </p>
            <Link
              href="/merchants/hub-main"
              className="inline-block rounded-lg px-4 py-2 text-sm font-medium bg-[#cafd00] text-[#0e0e0e] transition-colors hover:bg-[#b8e600]"
            >
              Go to Hub Main →
            </Link>
          </div>
          
          <div className="border border-[rgba(73,72,71,0.3)] rounded-lg p-4">
            <h2 className="text-xl font-semibold text-[#f3ffca] mb-2">
              Redemption
            </h2>
            <p className="text-[#adaaaa] mb-3">
              Another nested route with breadcrumb navigation.
            </p>
            <Link
              href="/merchants/redemption"
              className="inline-block rounded-lg px-4 py-2 text-sm font-medium bg-[#cafd00] text-[#0e0e0e] transition-colors hover:bg-[#b8e600]"
            >
              Go to Redemption →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
