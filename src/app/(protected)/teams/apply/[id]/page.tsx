import { notFound } from 'next/navigation';
import { getTeamById } from '@/services/teams';
import ApplyTeamForm from '@/components/teams/ApplyTeamForm';

export default async function ApplyTeamPage({
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
      <h1 className="text-app-text">Apply to Tournament</h1>
      <p className="mt-1 text-sm text-gray-500">Register this team for a tournament</p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-8 shadow-md">
        <ApplyTeamForm
          teamId={team.id}
          teamName={team.name}
          sportId={team.sport_id}
          sportName={team.sports?.name ?? 'Unknown'}
        />
      </div>
    </>
  );
}