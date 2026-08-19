'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import DeleteTournamentButton from '@/components/tournaments/DeleteTournamentButton';
import CriteriaButton from '@/components/tournaments/CriteriaButton';
import ViewGroupsModal from '@/components/tournaments/ViewGroupsModal';
import { getTournamentGroups } from '@/services/groups/queries';
import type { GroupWithTeams } from '@/services/groups/queries';

interface Tournament {
  id: number;
  name: string;
  organisers: { name: string };
  sports: { name: string };
  entry_fee: number;
  status: string;
  created: string;
  hasGroups: boolean;
}

interface TournamentsTableProps {
  tournaments: Tournament[];
  criteriaMap: Record<number, any>;
}

export default function TournamentsTable({ tournaments, criteriaMap }: TournamentsTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedTournamentName, setSelectedTournamentName] = useState('');
  const [groups, setGroups] = useState<GroupWithTeams[]>([]);

  const handleViewGroups = async (tournamentId: number, tournamentName: string) => {
    setSelectedTournamentName(tournamentName);
    setModalLoading(true);
    setIsModalOpen(true);

    const { data } = await getTournamentGroups(tournamentId);
    setGroups(data);
    setModalLoading(false);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Organiser</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Sport</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Entry Fee</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Created</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No tournaments found
                </td>
              </tr>
            ) : (
              tournaments.map((tournament) => (
                <tr key={tournament.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 text-app-text">{tournament.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tournament.organisers.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tournament.sports.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">₹{tournament.entry_fee}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        tournament.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tournament.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(tournament.created).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <CriteriaButton
                        tournamentId={tournament.id}
                        criteria={criteriaMap[tournament.id]}
                      />
                      {tournament.hasGroups ? (
                        <Button
                          variant="secondary"
                          onClick={() => handleViewGroups(tournament.id, tournament.name)}
                          className="!px-3 !py-1.5 text-sm"
                        >
                          View Groups
                        </Button>
                      ) : (
                        <Button
                          href={`/tournaments/groups/${tournament.id}`}
                          variant="secondary"
                          className="!px-3 !py-1.5 text-sm"
                        >
                          Create Groups
                        </Button>
                      )}
                      <Button
                        href={`/tournaments/edit/${tournament.id}`}
                        variant="secondary"
                        className="!px-3 !py-1.5 text-sm"
                      >
                        Edit
                      </Button>
                      <DeleteTournamentButton id={tournament.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ViewGroupsModal
        tournamentName={selectedTournamentName}
        groups={groups}
        loading={modalLoading}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}