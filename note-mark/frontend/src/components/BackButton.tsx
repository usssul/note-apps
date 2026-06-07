'use client';

import Link from 'next/link';

export function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-gray-500 hover:text-gray-700"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
