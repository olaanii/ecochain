import Link from "next/link";

export const metadata = { title: "Access Denied | EcoChain" };

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0e0e0e] px-4 text-center">
      <span className="text-6xl font-bold text-[#cafd00]">403</span>
      <h1 className="text-2xl font-semibold text-[#f3ffca]">Access Denied</h1>
      <p className="max-w-sm text-[#adaaaa]">
        You don&apos;t have permission to view this page. If you think this is a
        mistake, contact your administrator.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-[#cafd00] px-6 py-2.5 text-sm font-bold text-[#3a4a00] transition hover:opacity-90"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
