'use client';

import Button from '@/components/common/Button';
import type { TeamPlayer } from '@/services/team-players/queries';

interface ViewPlayersModalProps {
  teamName: string;
  players: TeamPlayer[];
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewPlayersModal({
  teamName,
  players,
  loading,
  isOpen,
  onClose,
}: ViewPlayersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-1 text-app-text font-semibold">Team Players</h2>
        <p className="mb-6 text-sm text-gray-500">{teamName}</p>

        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400">Loading players...</p>
          ) : players.length === 0 ? (
            <p className="text-sm text-gray-400">No players added yet.</p>
          ) : (
            players.map((player) => (
              <div
                key={player.id}
                className="rounded-lg border-2 border-input-border px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-app-text font-medium">{player.player_name}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      player.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : player.status === 'disqualified' || player.status === 'evicted'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {player.status}
                  </span>
                </div>
                {player.player_email && (
                  <p className="mt-1 text-sm text-gray-500">{player.player_email}</p>
                )}
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