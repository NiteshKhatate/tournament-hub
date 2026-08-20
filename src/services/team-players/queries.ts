import { supabase } from '@/lib/supabase';

export interface AvailablePlayer {
  id: number;
  name: string;
  email: string;
  contact: number;
}

export async function getAvailablePlayersForTeam(
  sportId: number
): Promise<{ data: AvailablePlayer[]; error: unknown }> {
  // Get all players who already have an ACTIVE team_players record,
  // regardless of which team — a player can only be actively on one team at a time
  const { data: activeTeamPlayers, error: activeError } = await supabase
    .from('team_players')
    .select('player_id')
    .eq('status', 'active');

  if (activeError) {
    console.error('Error fetching active team players:', activeError);
  }

  const excludedPlayerIds = [...new Set((activeTeamPlayers ?? []).map((tp) => tp.player_id))];

  // Get all active players of the same sport, excluding those already active on any team
  let query = supabase
    .from('players')
    .select('id, name, email, contact')
    .eq('sport_id', sportId)
    .eq('status', 'active')
    .order('name');

  if (excludedPlayerIds.length > 0) {
    query = query.not('id', 'in', `(${excludedPlayerIds.join(',')})`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching available players:', error);
    return { data: [], error };
  }

  return { data: data ?? [], error: null };
}

export interface TeamPlayer {
  id: number;
  status: string;
  player_id: number;
  player_name: string;
  player_email: string;
  player_contact: number;
}

export async function getTeamPlayers(
  teamId: number
): Promise<{ data: TeamPlayer[]; error: unknown }> {
  const { data: teamPlayersData, error } = await supabase
    .from('team_players')
    .select('id, status, player_id')
    .eq('team_id', teamId)
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching team players:', error);
    return { data: [], error };
  }

  if (!teamPlayersData || teamPlayersData.length === 0) {
    return { data: [], error: null };
  }

  const playerIds = [...new Set(teamPlayersData.map((tp) => tp.player_id))];

  const { data: playersData } = await supabase
    .from('players')
    .select('id, name, email, contact')
    .in('id', playerIds);

  const playersMap = new Map(playersData?.map((p) => [p.id, p]) || []);

  const result: TeamPlayer[] = teamPlayersData.map((tp) => {
    const player = playersMap.get(tp.player_id);
    return {
      id: tp.id,
      status: tp.status,
      player_id: tp.player_id,
      player_name: player?.name ?? 'Unknown Player',
      player_email: player?.email ?? '',
      player_contact: player?.contact ?? 0,
    };
  });

  return { data: result, error: null };
}