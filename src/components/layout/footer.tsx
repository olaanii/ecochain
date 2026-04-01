import Link from "next/link";

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "API Docs", href: "/docs" },
  { label: "System Status", href: "/status" },
];

/**
 * Shared footer component from the Figma design.
 * Displays copyright and legal/informational links.
 */
export function Footer() {
  return (
    <footer
      className="flex items-center justify-between border-t
                 border-[rgba(73,72,71,0.15)] bg-black px-8
                 py-12"
    >
      <span
        className="text-xs font-normal uppercase
                   tracking-[1.2px] text-[#adaaaa]"
      >
        © 2024 ECO_SYSTEM. The Neon Void Terminal.
      </span>

      <div className="flex gap-8">
        {footerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-normal uppercase
                       tracking-[1.2px] text-[#adaaaa]
                       transition-colors hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
