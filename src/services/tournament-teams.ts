import { supabase } from '@/lib/supabase';

export async function getTeamTournamentEntry(teamId: number, tournamentId: number) {
  const { data, error } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('team_id', teamId)
    .eq('tournament_id', tournamentId)
    .maybeSingle();

  return { data, error };
}