'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Sports', href: '/sports' },
  { label: 'Organisers', href: '/organisers' },
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'Teams', href: '/teams' },
  { label: 'Players', href: '/players' },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-white px-4 py-8 shadow-md">
      <h2 className="mb-8 px-3 text-app-text">Tournify</h2>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-app-text text-app-bg'
                  : 'text-app-text hover:bg-app-bg'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}