interface StatCardProps {
  label: string;
  value: string;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-app-text" style={{ fontSize: '32px' }}>
        {value}
      </p>
    </div>
  );
}