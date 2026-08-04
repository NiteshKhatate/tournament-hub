'use client';

import { useEffect, useState } from 'react';
import { getSports } from '@/services/sports';

const PAGE_SIZE = 10;

interface Sport {
  id: number;
  name: string;
  status: string;
  created: string;
}

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSports(page).then(({ data, count }) => {
      setSports(data);
      setTotal(count);
      setLoading(false);
    });
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <h1 className="text-app-text">Sports</h1>
      <p className="mt-1 text-sm text-gray-500">Manage sports available on the platform</p>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-md">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : sports.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                  No sports found
                </td>
              </tr>
            ) : (
              sports.map((sport) => (
                <tr key={sport.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 text-app-text">{sport.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        sport.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {sport.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(sport.created).toLocaleDateString()}
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
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border-2 border-input-border px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border-2 border-input-border px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}