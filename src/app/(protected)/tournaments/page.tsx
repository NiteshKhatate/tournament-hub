import Link from 'next/link';
import { getTournaments, getTournamentCriteria } from '@/services/trounaments/queries';
import { getTournamentGroupsMap } from '@/services/groups/queries';
import Button from '@/components/common/Button';
import TournamentsTable from '@/components/tournaments/TournamentsTable';

const PAGE_SIZE = 10;

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { data: tournaments, count } = await getTournaments(page);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  const criteriaMap: Record<number, any> = {};
  for (const tournament of tournaments) {
    const { data: criteria } = await getTournamentCriteria(tournament.id);
    if (criteria && criteria.length > 0) {
      criteriaMap[tournament.id] = criteria[0];
    }
  }

  const tournamentIds = tournaments.map((t: any) => t.id);
  const groupsMap = await getTournamentGroupsMap(tournamentIds);

  const enrichedTournaments = tournaments.map((t: any) => ({
    ...t,
    hasGroups: groupsMap.get(t.id) ?? false,
  }));

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

      <div className="mt-8">
        <TournamentsTable tournaments={enrichedTournaments} criteriaMap={criteriaMap} />
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