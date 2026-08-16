'use client';

import Button from '@/components/common/Button';
import type { Application } from '@/types/tournament-teams';

interface ViewApplicationsModalProps {
  teamName: string;
  applications: Application[];
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewApplicationsModal({
  teamName,
  applications,
  loading,
  isOpen,
  onClose,
}: ViewApplicationsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-1 text-app-text font-semibold">Tournament Applications</h2>
        <p className="mb-6 text-sm text-gray-500">{teamName}</p>

        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400">Loading applications...</p>
          ) : applications.length === 0 ? (
            <p className="text-sm text-gray-400">No applications found.</p>
          ) : (
            applications.map((application) => {
              const tournament =
                application.tournaments && application.tournaments.length > 0
                  ? application.tournaments[0]
                  : null;

              return (
                <div
                  key={application.id}
                  className="rounded-lg border-2 border-input-border px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-app-text font-medium">
                      {tournament?.name ?? 'Unknown Tournament'}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        application.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : application.status === 'disqualified' ||
                            application.status === 'suspended'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>
                  {tournament?.venue && (
                    <p className="mt-1 text-sm text-gray-500">Venue: {tournament.venue}</p>
                  )}
                  {(tournament?.start_date || tournament?.end_date) && (
                    <p className="mt-1 text-sm text-gray-500">
                      {tournament?.start_date &&
                        new Date(tournament.start_date).toLocaleDateString()}
                      {tournament?.end_date &&
                        ` - ${new Date(tournament.end_date).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}