'use client';

import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  // The stage screen is a full-bleed kiosk display and must never scroll.
  if (pathname?.startsWith('/stage')) return null;

  return (
    <footer className="border-t border-crema/20 py-4 text-center text-xs text-white/40">
      <a
        href="https://www.flaticon.com/free-icons/coffee"
        title="coffee icons"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-crema transition-colors"
      >
        Coffee icons created by Chanut-is-Industries - Flaticon
      </a>
    </footer>
  );
}
