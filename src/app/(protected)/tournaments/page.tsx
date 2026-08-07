import Link from 'next/link';
import { getTournaments, getTournamentCriteria } from '@/services/tournaments';
import Button from '@/components/common/Button';
import DeleteTournamentButton from '@/components/tournaments/DeleteTournamentButton';
import CriteriaButton from '@/components/tournaments/CriteriaButton';

const PAGE_SIZE = 10;

interface Tournament {
  id: number;
  name: string;
  organisers: { name: string };
  sports: { name: string };
  entry_fee: number;
  status: string;
  created: string;
}

interface Criteria {
  id: number;
  tournament_id: number;
  gender: string | null;
  type: string;
  operator: string;
  value_min: number;
  value_max: number | null;
  unit: string | null;
  max_players_count: number;
  min_players_count: number;
  status: 'active' | 'inactive';
}

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { data: tournaments, count } = await getTournaments(page);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  // Fetch criteria for all tournaments on this page
  const criteriaMap: Record<number, Criteria> = {};
  for (const tournament of tournaments) {
    const { data: criteria } = await getTournamentCriteria(tournament.id);
    if (criteria && criteria.length > 0) {
      criteriaMap[tournament.id] = criteria[0];
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-app-text">Tournaments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage sports tournaments</p>
        </div>
        <Button href="/tournaments/create" variant="primary">
          Create
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-md">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Organiser</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Sport</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Entry Fee</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Created</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No tournaments found
                </td>
              </tr>
            ) : (
              (tournaments as Tournament[]).map((tournament) => (
                <tr key={tournament.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 text-app-text">{tournament.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tournament.organisers.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tournament.sports.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">₹{tournament.entry_fee}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        tournament.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tournament.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(tournament.created).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <CriteriaButton
                        tournamentId={tournament.id}
                        criteria={criteriaMap[tournament.id]}
                      />
                      <Button
                        href={`/tournaments/edit/${tournament.id}`}
                        variant="secondary"
                        className="!px-3 !py-1.5 text-sm"
                      >
                        Edit
                      </Button>
                      <DeleteTournamentButton id={tournament.id} />
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
              href={`/tournaments?page=${Math.max(1, page - 1)}`}
              className={`rounded-lg border-2 border-input-border px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-bg ${
                page === 1 ? 'pointer-events-none opacity-40' : ''
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/tournaments?page=${Math.min(totalPages, page + 1)}`}
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