'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import DeleteTeamButton from '@/components/teams/DeleteTeamButton';
import ViewApplicationsModal from '@/components/teams/ViewApplicationsModal';
import { getTeamApplications } from '@/services/tournament-teams/queries';
import type { Application } from '@/types/tournament-teams';

interface Team {
  id: number;
  name: string;
  sports: { id: number; name: string } | null;
  email: string;
  contact: number;
  status: string;
  created: string;
  sport_id: number;
  login_id: number;
  hasApplications: boolean;
}

interface TeamsTableProps {
  teams: Team[];
}

export default function TeamsTable({ teams }: TeamsTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);

  const handleViewClick = async (teamId: number, teamName: string) => {
    setSelectedTeamName(teamName);
    setModalLoading(true);
    setIsModalOpen(true);

    const { data } = await getTeamApplications(teamId);
    setApplications(data as Application[]);
    setModalLoading(false);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Sport</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Created</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No teams found
                </td>
              </tr>
            ) : (
              teams.map((team) => (
                <tr key={team.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 text-app-text">{team.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {team.sports?.name ?? 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{team.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{team.contact}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        team.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {team.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(team.created).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {team.hasApplications && (
                        <Button
                          variant="secondary"
                          onClick={() => handleViewClick(team.id, team.name)}
                          className="!px-3 !py-1.5 text-sm"
                        >
                          View
                        </Button>
                      )}
                      <Button
                        href={`/teams/apply/${team.id}`}
                        variant="secondary"
                        className="!px-3 !py-1.5 text-sm"
                      >
                        Apply
                      </Button>
                      <Button
                        href={`/teams/edit/${team.id}`}
                        variant="secondary"
                        className="!px-3 !py-1.5 text-sm"
                      >
                        Edit
                      </Button>
                      <DeleteTeamButton id={team.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ViewApplicationsModal
        teamName={selectedTeamName}
        applications={applications}
        loading={modalLoading}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}