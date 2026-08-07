import Link from 'next/link';
import { getSports } from '@/services/sports';
import DeleteSportButton from '@/components/sports/DeleteSportButton';

const PAGE_SIZE = 10;

export default async function SportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { data: sports, count } = await getSports(page);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-app-text">Sports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage sports available on the platform
          </p>
        </div>

        <Link
          href="/sports/create"
          className="rounded-lg bg-app-text px-5 py-2.5 font-medium text-app-bg transition hover:opacity-90"
        >
          Create
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-md">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Created</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sports.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No sports found
                </td>
              </tr>
            ) : (
              sports.map((sport) => (
                <tr key={sport.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 text-app-text">{sport.name}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        sport.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>{sport.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(sport.created).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <DeleteSportButton id={sport.id} />
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
              href={`/sports?page=${Math.max(1, page - 1)}`}
              className={`rounded-lg border-2 border-input-border px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-bg ${
                page === 1 ? 'pointer-events-none opacity-40' : ''
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/sports?page=${Math.min(totalPages, page + 1)}`}
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