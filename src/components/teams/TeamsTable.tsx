'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import DeleteTeamButton from '@/components/teams/DeleteTeamButton';
import ViewApplicationsModal from '@/components/teams/ViewApplicationsModal';
import AddPlayersModal from '@/components/teams/AddPlayersModal';
import ViewPlayersModal from '@/components/teams/ViewPlayersModal';
import { getTeamApplications } from '@/services/tournament-teams/queries';
import { getTeamPlayers } from '@/services/team-players/queries';
import type { Application } from '@/types/tournament-teams';
import type { TeamPlayer } from '@/services/team-players/queries';

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
  // View Applications modal state
  const [isAppsModalOpen, setIsAppsModalOpen] = useState(false);
  const [appsModalLoading, setAppsModalLoading] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);

  // Add Players modal state
  const [isAddPlayersModalOpen, setIsAddPlayersModalOpen] = useState(false);
  const [selectedTeamForPlayers, setSelectedTeamForPlayers] = useState<{
    id: number;
    name: string;
    sportId: number;
  } | null>(null);

  // View Players modal state
  const [isViewPlayersModalOpen, setIsViewPlayersModalOpen] = useState(false);
  const [viewPlayersModalLoading, setViewPlayersModalLoading] = useState(false);
  const [selectedTeamNameForView, setSelectedTeamNameForView] = useState('');
  const [teamPlayers, setTeamPlayers] = useState<TeamPlayer[]>([]);

  const handleViewClick = async (teamId: number, teamName: string) => {
    setSelectedTeamName(teamName);
    setAppsModalLoading(true);
    setIsAppsModalOpen(true);

    const { data } = await getTeamApplications(teamId);
    setApplications(data);
    setAppsModalLoading(false);
  };

  const handleAddPlayersClick = (teamId: number, teamName: string, sportId: number) => {
    setSelectedTeamForPlayers({ id: teamId, name: teamName, sportId });
    setIsAddPlayersModalOpen(true);
  };

  const handleViewPlayersClick = async (teamId: number, teamName: string) => {
    setSelectedTeamNameForView(teamName);
    setViewPlayersModalLoading(true);
    setIsViewPlayersModalOpen(true);

    const { data } = await getTeamPlayers(teamId);
    setTeamPlayers(data);
    setViewPlayersModalLoading(false);
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
                    <div className="flex flex-wrap items-center gap-3">
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
                        variant="secondary"
                        onClick={() => handleViewPlayersClick(team.id, team.name)}
                        className="!px-3 !py-1.5 text-sm"
                      >
                        View Players
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleAddPlayersClick(team.id, team.name, team.sport_id)}
                        className="!px-3 !py-1.5 text-sm"
                      >
                        Add Players
                      </Button>
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
        loading={appsModalLoading}
        isOpen={isAppsModalOpen}
        onClose={() => setIsAppsModalOpen(false)}
      />

      <AddPlayersModal
        teamId={selectedTeamForPlayers?.id ?? null}
        teamName={selectedTeamForPlayers?.name ?? ''}
        sportId={selectedTeamForPlayers?.sportId ?? null}
        isOpen={isAddPlayersModalOpen}
        onClose={() => setIsAddPlayersModalOpen(false)}
        onSuccess={() => {
          // If this team's roster is currently open in the View Players modal, refresh it
          if (isViewPlayersModalOpen && selectedTeamForPlayers) {
            handleViewPlayersClick(selectedTeamForPlayers.id, selectedTeamForPlayers.name);
          }
        }}
      />

      <ViewPlayersModal
        teamName={selectedTeamNameForView}
        players={teamPlayers}
        loading={viewPlayersModalLoading}
        isOpen={isViewPlayersModalOpen}
        onClose={() => setIsViewPlayersModalOpen(false)}
      />
    </>
  );
}