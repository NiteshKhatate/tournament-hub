import Link from "next/link";

export const dynamic = "force-dynamic";

interface Organiser {
  id: string;
  login_id: string;
  name: string;
  email: string;
  contact?: string;
  sport?: string;
  username: string;
  created?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Organiser[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000";
const DEFAULT_PAGE_SIZE = 10;

async function fetchOrganisers(page: number, pageSize: number) {
  const url = `${API_BASE}/organisers?page=${page}&pageSize=${pageSize}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to load organisers: ${response.statusText}`);
  }

  const data = (await response.json()) as ApiResponse;

  if (!data.success) {
    throw new Error(data.message || "Failed to load organisers");
  }

  return data;
}

export default async function OrganisersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const pageParam = Array.isArray(searchParams?.page)
    ? searchParams.page[0]
    : searchParams?.page;
  const pageSizeParam = Array.isArray(searchParams?.pageSize)
    ? searchParams.pageSize[0]
    : searchParams?.pageSize;

  const page = Math.max(Number(pageParam) || 1, 1);
  const pageSize = Math.max(Number(pageSizeParam) || DEFAULT_PAGE_SIZE, 1);

  const { data: organisers, total, totalPages } = await fetchOrganisers(
    page,
    pageSize
  );

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
                Organisers
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                Browse and manage tournament organisers. Use the pagination controls to navigate through the list.
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-950 p-4 text-sm text-zinc-700 dark:text-zinc-200">
              Page {page} of {totalPages} · {total} organiser{total === 1 ? "" : "s"}
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-zinc-700 dark:text-zinc-200">
              <thead className="bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Sport</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {organisers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                      No organisers found.
                    </td>
                  </tr>
                ) : (
                  organisers.map((organiser) => (
                    <tr
                      key={organiser.id}
                      className="border-t border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                        {organiser.name}
                      </td>
                      <td className="px-6 py-4">{organiser.email}</td>
                      <td className="px-6 py-4">{organiser.username}</td>
                      <td className="px-6 py-4">{organiser.contact || "—"}</td>
                      <td className="px-6 py-4">{organiser.sport || "General"}</td>
                      <td className="px-6 py-4">
                        {organiser.created ? new Date(organiser.created).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/organisers?page=${page - 1}&pageSize=${pageSize}`}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  hasPrevious
                    ? "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                    : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-700"
                }`}
                aria-disabled={!hasPrevious}
              >
                Previous
              </Link>

              <Link
                href={`/organisers?page=${page + 1}&pageSize=${pageSize}`}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  hasNext
                    ? "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                    : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-700"
                }`}
                aria-disabled={!hasNext}
              >
                Next
              </Link>
            </div>

            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Showing {organisers.length} of {total} organiser{total === 1 ? "" : "s"}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
