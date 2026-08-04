'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SideNav from '@/components/common/Sidenav';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('session_user');

    if (!session) {
      router.replace('/login');
      return;
    }

    setChecked(true);
  }, [router]);

  // avoid flashing protected content before the check completes
  if (!checked) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-app-bg">
      <SideNav />
      <main className="flex-1 px-6 py-8 md:px-12">{children}</main>
    </div>
  );
}