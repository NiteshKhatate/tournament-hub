'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DashboardHeader() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('session_user', { path: '/' });
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-app-text">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your tournaments and activity
        </p>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg border-2 border-input-border px-5 py-2 font-medium text-app-text transition hover:bg-app-bg"
      >
        Logout
      </button>
    </div>
  );
}