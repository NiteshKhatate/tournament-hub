import { notFound } from 'next/navigation';
import { getTeamById } from '@/services/teams/queries';
import TeamForm from '@/components/teams/TeamForm';

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: team, error } = await getTeamById(Number(id));

  if (error || !team) {
    notFound();
  }

  return (
    <>
      <h1 className="text-app-text">Edit Team</h1>
      <p className="mt-1 text-sm text-gray-500">Update team details</p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-8 shadow-md">
        <TeamForm team={team} />
      </div>
    </>
  );
}