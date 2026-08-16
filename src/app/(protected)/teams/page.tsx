import Link from 'next/link';
import { getTeams } from '@/services/teams';
import Button from '@/components/common/Button';
import TeamsTable from '@/components/teams/TeamsTable';

const PAGE_SIZE = 10;

interface Team {
  id: number;
  name: string;
  sports: { id: number; name: string } | null;
  email: string;
  contact: number;
  status: string;
  created: string;
  sport_id: number;
  login_id: number;
  hasApplications: boolean;
}

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { data: teams, count } = await getTeams(page);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-app-text">Teams</h1>
          <p className="mt-1 text-sm text-gray-500">Manage sports teams</p>
        </div>
        <Button href="/teams/create" variant="primary">
          Create
        </Button>
      </div>

      <div className="mt-8">
        <TeamsTable teams={teams as Team[]} />
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/teams?page=${Math.max(1, page - 1)}`}
              className={`rounded-lg border-2 border-input-border px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-bg ${
                page === 1 ? 'pointer-events-none opacity-40' : ''
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/teams?page=${Math.min(totalPages, page + 1)}`}
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