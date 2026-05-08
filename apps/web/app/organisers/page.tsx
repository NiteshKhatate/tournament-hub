import Link from "next/link";
import { redirect } from "next/navigation";
import OrganisersTable from "../../components/OrganisersTable";

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

async function deleteOrganiser(id: string) {
  "use server";

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000";

  const response = await fetch(`${API_BASE}/organisers/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete organiser: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to delete organiser");
  }

  // Redirect back to the current page to refresh data
  redirect("/organisers");
}

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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageParam = Array.isArray(params?.page)
    ? params.page[0]
    : params?.page;
  const pageSizeParam = Array.isArray(params?.pageSize)
    ? params.pageSize[0]
    : params?.pageSize;

  const page = Math.max(Number(pageParam) || 1, 1);
  const pageSize = Math.max(Number(pageSizeParam) || DEFAULT_PAGE_SIZE, 1);

  const { data: organisers, total, totalPages } = await fetchOrganisers(
    page,
    pageSize
  );

  console.log(organisers);

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
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <Link
                href="/organisers/new"
                className="inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Add organiser
              </Link>
              <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-950 p-4 text-sm text-zinc-700 dark:text-zinc-200">
                Page {page} of {totalPages} · {total} organiser{total === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <OrganisersTable
            organisers={organisers}
            page={page}
            pageSize={pageSize}
            total={total}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onDelete={deleteOrganiser}
          />
        </div>
      </div>
    </div>
  );
}
