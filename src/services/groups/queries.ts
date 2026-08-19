import { supabase } from '@/lib/supabase';

export interface GroupingOption {
  groupCount: number;
  teamsPerGroup: number;
}

// Given a team count, return all valid ways to split into groups of 3+
export function getGroupingOptions(teamCount: number): GroupingOption[] {
  const options: GroupingOption[] = [];

  for (let groupCount = 1; groupCount <= teamCount; groupCount++) {
    if (teamCount % groupCount !== 0) continue;
    const teamsPerGroup = teamCount / groupCount;
    if (teamsPerGroup >= 3) {
      options.push({ groupCount, teamsPerGroup });
    }
  }

  return options;
}

export interface TeamForGrouping {
  tournament_team_id: number;
  team_id: number;
  team_name: string;
}

export async function getTournamentTeamsForGrouping(
  tournamentId: number
): Promise<{ data: TeamForGrouping[]; error: unknown }> {
  const { data: entries, error } = await supabase
    .from('tournament_teams')
    .select('id, team_id')
    .eq('tournament_id', tournamentId)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching tournament teams:', error);
    return { data: [], error };
  }

  if (!entries || entries.length === 0) {
    return { data: [], error: null };
  }

  const teamIds = [...new Set(entries.map((e) => e.team_id))];

  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('id, name')
    .in('id', teamIds);

  if (teamsError) {
    console.error('Error fetching teams:', teamsError);
  }

  const teamsMap = new Map(teamsData?.map((t) => [t.id, t.name]) || []);

  const result: TeamForGrouping[] = entries.map((entry) => ({
    tournament_team_id: entry.id,
    team_id: entry.team_id,
    team_name: teamsMap.get(entry.team_id) ?? 'Unknown Team',
  }));

  return { data: result, error: null };
}

export interface GroupWithTeams {
  id: number;
  name: string | null;
  teams: { id: number; name: string }[];
}

export async function getTournamentGroups(
  tournamentId: number
): Promise<{ data: GroupWithTeams[]; error: unknown }> {
  const { data: groupsData, error: groupsError } = await supabase
    .from('groups')
    .select('id, name')
    .eq('tournament_id', tournamentId)
    .order('id', { ascending: true });

  if (groupsError) {
    console.error('Error fetching groups:', groupsError);
    return { data: [], error: groupsError };
  }

  if (!groupsData || groupsData.length === 0) {
    return { data: [], error: null };
  }

  const groupIds = groupsData.map((g) => g.id);

  const { data: groupTeamsData, error: groupTeamsError } = await supabase
    .from('group_teams')
    .select('id, group_id, tournament_team_id')
    .in('group_id', groupIds);

  if (groupTeamsError) {
    console.error('Error fetching group teams:', groupTeamsError);
  }

  const tournamentTeamIds = [...new Set((groupTeamsData ?? []).map((gt) => gt.tournament_team_id))];

  const { data: tournamentTeamsData } = await supabase
    .from('tournament_teams')
    .select('id, team_id')
    .in('id', tournamentTeamIds.length > 0 ? tournamentTeamIds : [0]);

  const teamIds = [...new Set((tournamentTeamsData ?? []).map((tt) => tt.team_id))];

  const { data: teamsData } = await supabase
    .from('teams')
    .select('id, name')
    .in('id', teamIds.length > 0 ? teamIds : [0]);

  const tournamentTeamToTeamId = new Map(
    tournamentTeamsData?.map((tt) => [tt.id, tt.team_id]) || []
  );
  const teamIdToName = new Map(teamsData?.map((t) => [t.id, t.name]) || []);

  const result: GroupWithTeams[] = groupsData.map((group) => {
    const teamsInGroup = (groupTeamsData ?? [])
      .filter((gt) => gt.group_id === group.id)
      .map((gt) => {
        const teamId = tournamentTeamToTeamId.get(gt.tournament_team_id);
        return {
          id: teamId ?? 0,
          name: teamId ? teamIdToName.get(teamId) ?? 'Unknown Team' : 'Unknown Team',
        };
      });

    return { id: group.id, name: group.name, teams: teamsInGroup };
  });

  return { data: result, error: null };
}

export async function getTournamentGroupsMap(tournamentIds: number[]) {
  if (tournamentIds.length === 0) return new Map<number, boolean>();

  const { data } = await supabase
    .from('groups')
    .select('tournament_id')
    .in('tournament_id', tournamentIds);

  const map = new Map<number, boolean>();
  data?.forEach((row: { tournament_id: number }) => {
    map.set(row.tournament_id, true);
  });

  return map;
}