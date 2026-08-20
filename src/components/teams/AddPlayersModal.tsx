'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import { getAvailablePlayersForTeam } from '@/services/team-players/queries';
import { addPlayersToTeam } from '@/services/team-players/mutations';
import type { AvailablePlayer } from '@/services/team-players/queries';

interface AddPlayersModalProps {
  teamId: number | null;
  teamName: string;
  sportId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPlayersModal({
  teamId,
  teamName,
  sportId,
  isOpen,
  onClose,
  onSuccess,
}: AddPlayersModalProps) {
  const [players, setPlayers] = useState<AvailablePlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isOpen || teamId == null || sportId == null) return;

    const fetchPlayers = async () => {
      setLoading(true);
      setError('');
      setSelectedIds(new Set());

      const { data } = await getAvailablePlayersForTeam(teamId, sportId);
      setPlayers(data);
      setLoading(false);
    };

    fetchPlayers();
  }, [isOpen, teamId, sportId]);

  if (!isOpen) return null;

  const toggleSelection = (playerId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (teamId == null || selectedIds.size === 0) return;

    setSubmitting(true);
    setError('');

    const result = await addPlayersToTeam({
      team_id: teamId,
      player_ids: Array.from(selectedIds),
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-1 text-app-text font-semibold">Add Players</h2>
        <p className="mb-6 text-sm text-gray-500">{teamName}</p>

        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400">Loading available players...</p>
          ) : players.length === 0 ? (
            <p className="text-sm text-gray-400">
              No available players found for this sport.
            </p>
          ) : (
            players.map((player) => (
              <label
                key={player.id}
                className="flex items-center gap-3 rounded-lg border-2 border-input-border px-4 py-3 cursor-pointer hover:bg-app-bg"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(player.id)}
                  onChange={() => toggleSelection(player.id)}
                />
                <div>
                  <p className="text-app-text font-medium">{player.name}</p>
                  <p className="text-xs text-gray-500">{player.email}</p>
                </div>
              </label>
            ))
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            loadingText="Adding..."
            disabled={selectedIds.size === 0 || players.length === 0}
          >
            Add Selected ({selectedIds.size})
          </Button>
        </div>
      </div>
    </div>
  );
}