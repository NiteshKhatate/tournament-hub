import { supabase } from '@/lib/supabase';
import type { Application } from '@/types/tournament-teams';

export async function getTeamTournamentEntry(teamId: number, tournamentId: number) {
  const { data, error } = await supabase
    .from('tournament_teams')
    .select('*')
    .eq('team_id', teamId)
    .eq('tournament_id', tournamentId)
    .maybeSingle();

  return { data, error };
}

export async function getTeamApplications(
  teamId: number
): Promise<{ data: Application[]; error: unknown }> {
  const { data: applicationsData, error } = await supabase
    .from('tournament_teams')
    .select('id, status, tournament_id')
    .eq('team_id', teamId)
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching team applications:', error);
    return { data: [], error };
  }

  if (!applicationsData || applicationsData.length === 0) {
    return { data: [], error: null };
  }

  // Manually fetch tournaments for these applications
  const tournamentIds = [...new Set(applicationsData.map((app) => app.tournament_id))];

  const { data: tournamentsData, error: tournamentsError } = await supabase
    .from('tournaments')
    .select('id, name, start_date, end_date, venue')
    .in('id', tournamentIds);

  if (tournamentsError) {
    console.error('Error fetching tournaments:', tournamentsError);
  }

  const tournamentsMap = new Map(
    tournamentsData?.map((t) => [t.id, t]) || []
  );

  const enrichedData: Application[] = applicationsData.map((app) => ({
    id: app.id,
    status: app.status,
    tournament_id: app.tournament_id,
    tournaments: tournamentsMap.has(app.tournament_id)
      ? [tournamentsMap.get(app.tournament_id)!]
      : null,
  }));

  return { data: enrichedData, error: null };
}

export async function getTeamApplicationsMap(teamIds: number[]) {
  if (teamIds.length === 0) return new Map<number, boolean>();

  const { data } = await supabase
    .from('tournament_teams')
    .select('team_id')
    .in('team_id', teamIds);

  const map = new Map<number, boolean>();
  data?.forEach((row: { team_id: number }) => {
    map.set(row.team_id, true);
  });

  return map;
}