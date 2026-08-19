'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { getTournamentTeamsForGrouping, getGroupingOptions } from '@/services/groups/queries';
import type { TeamForGrouping, GroupingOption } from '@/services/groups/queries';
import { createTournamentGroups } from '@/services/groups/mutations';

interface CreateGroupsFormProps {
  tournamentId: number;
  tournamentName: string;
}

const COLUMN_COUNTS = [2, 3, 4] as const;

export default function CreateGroupsForm({ tournamentId, tournamentName }: CreateGroupsFormProps) {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamForGrouping[]>([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<2 | 3 | 4>(3);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await getTournamentTeamsForGrouping(tournamentId);
      setTeams(data);
      setLoading(false);
    };

    fetchTeams();
  }, [tournamentId]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading teams...</div>;
  }

  if (teams.length === 0) {
    return (
      <div className="text-center text-gray-400">
        No teams have registered for this tournament yet.
      </div>
    );
  }

  const options: GroupingOption[] = getGroupingOptions(teams.length);

  const handleSubmit = async () => {
    if (selectedOption === null) {
      setError('Please select a grouping option');
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await createTournamentGroups({
      tournament_id: tournamentId,
      group_count: selectedOption,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push('/tournaments');
  };

  // Split teams into rows based on selected column count
  const rows: TeamForGrouping[][] = [];
  for (let i = 0; i < teams.length; i += columns) {
    rows.push(teams.slice(i, i + columns));
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-gray-500">Tournament</p>
        <p className="text-app-text font-medium">{tournamentName}</p>
        <p className="mt-1 text-sm text-gray-500">{teams.length} teams registered</p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-app-text">Registered Teams</h3>
          <div className="flex gap-2">
            {COLUMN_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setColumns(count)}
                className={`rounded-lg border-2 px-3 py-1 text-sm font-medium transition ${
                  columns === count
                    ? 'border-input-border bg-app-text text-white'
                    : 'border-input-border text-app-text hover:bg-app-bg'
                }`}
              >
                {count} cols
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          <table className="w-full text-left">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100 last:border-0">
                  {row.map((team) => (
                    <td key={team.tournament_team_id} className="px-6 py-3 text-app-text">
                      {team.team_name}
                    </td>
                  ))}
                  {/* Fill empty cells if row isn't full */}
                  {row.length < columns &&
                    Array.from({ length: columns - row.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="px-6 py-3" />
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-app-text">Grouping Options</h3>

        {options.length === 0 ? (
          <p className="text-sm text-gray-400">
            No valid grouping is possible — each group needs at least 3 teams.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {options.map((option) => (
              <label
                key={option.groupCount}
                className="flex items-center gap-3 rounded-lg border-2 border-input-border px-4 py-3 cursor-pointer hover:bg-app-bg"
              >
                <input
                  type="radio"
                  name="grouping"
                  checked={selectedOption === option.groupCount}
                  onChange={() => setSelectedOption(option.groupCount)}
                />
                <span className="text-app-text">
                  {option.groupCount} {option.groupCount === 1 ? 'group' : 'groups'},{' '}
                  {option.teamsPerGroup} teams in each
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          loading={submitting}
          loadingText="Creating..."
          disabled={options.length === 0}
        >
          Create Groups
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push('/tournaments')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}