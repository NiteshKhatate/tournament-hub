import SideNav from '@/components/common/Sidenav';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session_user');

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full bg-app-bg">
      <SideNav />
      <main className="flex-1 px-6 py-8 md:px-12">{children}</main>
    </div>
  );
}