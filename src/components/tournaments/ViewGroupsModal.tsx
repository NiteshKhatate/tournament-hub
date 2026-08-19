'use client';

import Button from '@/components/common/Button';
import type { GroupWithTeams } from '@/services/groups/queries';

interface ViewGroupsModalProps {
  tournamentName: string;
  groups: GroupWithTeams[];
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewGroupsModal({
  tournamentName,
  groups,
  loading,
  isOpen,
  onClose,
}: ViewGroupsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-1 text-app-text font-semibold">Groups</h2>
        <p className="mb-6 text-sm text-gray-500">{tournamentName}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400">Loading groups...</p>
          ) : groups.length === 0 ? (
            <p className="text-sm text-gray-400">No groups found.</p>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="rounded-lg border-2 border-input-border p-4">
                <p className="mb-2 text-app-text font-medium">{group.name ?? `Group ${group.id}`}</p>
                <ul className="flex flex-col gap-1">
                  {group.teams.map((team) => (
                    <li key={team.id} className="text-sm text-gray-600">
                      {team.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))
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