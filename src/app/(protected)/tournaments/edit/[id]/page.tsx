import { notFound } from 'next/navigation';
import { getTournamentById } from '@/services/trounaments/queries';
import TournamentForm from '@/components/tournaments/TournamentForm';

export default async function EditTournamentPage({
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
      <h1 className="text-app-text">Edit Tournament</h1>
      <p className="mt-1 text-sm text-gray-500">Update tournament details</p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-8 shadow-md">
        <TournamentForm tournament={tournament} />
      </div>
    </>
  );
}