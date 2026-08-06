import { getDashboardCounts } from '@/services/dashboard';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';

export default async function DashboardPage() {
  const { sports, organisers } = await getDashboardCounts();

  return (
    <>
      <DashboardHeader />

      <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Sports" value={String(sports)} />
        <StatCard label="Organisers" value={String(organisers)} />
        <StatCard label="Active Tournaments" value="—" />
      </section>
    </>
  );
}