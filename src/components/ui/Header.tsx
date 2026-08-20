'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  title?: string;
  showNav?: boolean;
}

export function Header({ title, showNav = false }: HeaderProps) {
  return (
    <header className="bg-dark-charcoal border-b border-crema/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/latte-art.png" alt="" width={24} height={24} className="w-6 h-6" />
          <div className="flex flex-col">
            <h1 className="text-crema font-display font-bold text-lg leading-tight tracking-wide">
              NOURISH × EXPAT
            </h1>
            {title && (
              <span className="text-white/60 text-xs font-medium uppercase tracking-wider">
                {title}
              </span>
            )}
          </div>
        </div>

        {showNav && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-white/70 hover:text-crema transition-colors">Home</Link>
            <Link href="/register" className="text-white/70 hover:text-crema transition-colors">Register</Link>
            <Link href="/preselection" className="text-white/70 hover:text-crema transition-colors">Pre-Selection</Link>
            <Link href="/judge" className="text-white/70 hover:text-crema transition-colors">Judge</Link>
            <Link href="/stage" className="text-white/70 hover:text-crema transition-colors">Stage</Link>
            <Link href="/admin" className="text-white/70 hover:text-crema transition-colors">Admin</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
