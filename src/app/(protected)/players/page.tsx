import Link from 'next/link';
import { getPlayers } from '@/services/players/queries';
import Button from '@/components/common/Button';
import DeletePlayerButton from '@/components/players/DeletePlayerButton';

const PAGE_SIZE = 10;

interface Player {
  id: number;
  name: string;
  email: string;
  contact: number;
  sports: { id: number; name: string } | null;
  id_type: string;
  birthdate: string;
  status: string;
  created: string;
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { data: players, count } = await getPlayers(page);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-app-text">Players</h1>
          <p className="mt-1 text-sm text-gray-500">Manage registered players</p>
        </div>
        <Button href="/players/create" variant="primary">
          Create
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-md">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Sport</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">ID Type</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Birthdate</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                  No players found
                </td>
              </tr>
            ) : (
              (players as Player[]).map((player) => (
                <tr key={player.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 text-app-text">{player.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {player.sports?.name ?? 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{player.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{player.contact}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                    {player.id_type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(player.birthdate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        player.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {player.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Button
                        href={`/players/edit/${player.id}`}
                        variant="secondary"
                        className="!px-3 !py-1.5 text-sm"
                      >
                        Edit
                      </Button>
                      <DeletePlayerButton id={player.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/players?page=${Math.max(1, page - 1)}`}
              className={`rounded-lg border-2 border-input-border px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-bg ${
                page === 1 ? 'pointer-events-none opacity-40' : ''
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/players?page=${Math.min(totalPages, page + 1)}`}
              className={`rounded-lg border-2 border-input-border px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-bg ${
                page === totalPages ? 'pointer-events-none opacity-40' : ''
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </>
  );
}