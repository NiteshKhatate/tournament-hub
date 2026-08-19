import { notFound } from 'next/navigation';
import { getTournamentById } from '@/services/trounaments/queries';
import CreateGroupsForm from '@/components/tournaments/CreateGroupsForm';

export default async function CreateGroupsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: tournament, error } = await getTournamentById(Number(id));

  if (error || !tournament) {
    notFound();
  }

  return (
    <>
      <h1 className="text-app-text">Create Groups</h1>
      <p className="mt-1 text-sm text-gray-500">Divide registered teams into groups</p>

      <div className="mt-8 max-w-2xl rounded-2xl bg-white p-8 shadow-md">
        <CreateGroupsForm tournamentId={tournament.id} tournamentName={tournament.name} />
      </div>
    </>
  );
}