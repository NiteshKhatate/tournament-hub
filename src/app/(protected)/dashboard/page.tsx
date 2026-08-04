import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active Tournaments" value="0" />
        <StatCard label="Total Organisers" value="0" />
        <StatCard label="Registered Teams" value="0" />
      </section>
    </>
  );
}