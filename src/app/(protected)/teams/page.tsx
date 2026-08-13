import Link from 'next/link';
import { getTeams } from '@/services/teams';
import Button from '@/components/common/Button';
import DeleteTeamButton from '@/components/teams/DeleteTeamButton';

const PAGE_SIZE = 10;

interface Team {
  id: number;
  name: string;
  sports: { name: string }[] | null;
  email: string;
  contact: number;
  status: string;
  created: string;
  sport_id: number;
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

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-md">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Sport</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Created</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No teams found
                </td>
              </tr>
            ) : (
              (teams as Team[]).map((team) => (
                <tr key={team.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 text-app-text">{team.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {team.sports && team.sports.length > 0 ? team.sports[0].name : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{team.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{team.contact}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        team.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {team.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(team.created).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Button
                        href={`/teams/edit/${team.id}`}
                        variant="secondary"
                        className="!px-3 !py-1.5 text-sm"
                      >
                        Edit
                      </Button>
                      <DeleteTeamButton id={team.id} />
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