import { notFound } from 'next/navigation';
import { getPlayerById } from '@/services/players/queries';
import PlayerForm from '@/components/players/PlayerForm';

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: player, error } = await getPlayerById(Number(id));

  if (error || !player) {
    notFound();
  }

  return (
    <>
      <h1 className="text-app-text">Edit Player</h1>
      <p className="mt-1 text-sm text-gray-500">Update player details</p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-8 shadow-md">
        <PlayerForm player={player} />
      </div>
    </>
  );
}