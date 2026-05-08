'use client';

import { useState } from 'react';
import Link from 'next/link';

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

interface OrganisersTableProps {
  organisers: Organiser[];
  page: number;
  pageSize: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onDelete: (id: string) => Promise<void>;
}

export default function OrganisersTable({
  organisers,
  page,
  pageSize,
  total,
  hasPrevious,
  hasNext,
  onDelete,
}: OrganisersTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [organiserToDelete, setOrganiserToDelete] = useState<Organiser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (organiser: Organiser) => {
    setOrganiserToDelete(organiser);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!organiserToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(organiserToDelete.id);
      setDeleteModalOpen(false);
      setOrganiserToDelete(null);
    } catch (error) {
      console.error('Failed to delete organiser:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setOrganiserToDelete(null);
  };

  return (
    <>
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
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organisers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
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
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteClick(organiser)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Delete organiser"
                    >
                      🗑️
                    </button>
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && organiserToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
              Delete organiser
            </h3>
            <p className="text-zinc-600 dark:text-zinc-300 mb-6">
              Are you sure you want to delete <strong>{organiserToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}