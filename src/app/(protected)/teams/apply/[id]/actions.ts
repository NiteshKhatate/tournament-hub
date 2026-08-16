'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface ApplyTeamInput {
  team_id: number;
  tournament_id: number;
}

export async function applyTeamToTournament(input: ApplyTeamInput) {
  // Fetch team to verify sport
  const { data: team, error: teamError } = await supabaseAdmin
    .from('teams')
    .select('sport_id')
    .eq('id', input.team_id)
    .single();

  if (teamError || !team) {
    return { data: null, error: 'Team not found' };
  }

  // Fetch tournament to verify sport matches
  const { data: tournament, error: tournamentError } = await supabaseAdmin
    .from('tournaments')
    .select('sport_id')
    .eq('id', input.tournament_id)
    .single();

  if (tournamentError || !tournament) {
    return { data: null, error: 'Tournament not found' };
  }

  if (team.sport_id !== tournament.sport_id) {
    return { data: null, error: 'This team can only apply to tournaments of the same sport' };
  }

  // Check if the team is already registered for this tournament
  const { data: existing } = await supabaseAdmin
    .from('tournament_teams')
    .select('id')
    .eq('team_id', input.team_id)
    .eq('tournament_id', input.tournament_id)
    .maybeSingle();

  if (existing) {
    return { data: null, error: 'This team is already registered for the selected tournament' };
  }

  const { data, error } = await supabaseAdmin
    .from('tournament_teams')
    .insert({
      team_id: input.team_id,
      tournament_id: input.tournament_id,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/teams');
  return { data, error: null };
}