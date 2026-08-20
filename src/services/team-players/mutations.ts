'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface AddPlayersToTeamInput {
  team_id: number;
  player_ids: number[];
}

export async function addPlayersToTeam(input: AddPlayersToTeamInput) {
  const { team_id, player_ids } = input;

  if (player_ids.length === 0) {
    return { error: 'Please select at least one player' };
  }

  // Prevent duplicate entries — check which of these players are already on the team
  const { data: existing } = await supabaseAdmin
    .from('team_players')
    .select('player_id')
    .eq('team_id', team_id)
    .in('player_id', player_ids);

  const alreadyAddedIds = new Set((existing ?? []).map((e) => e.player_id));
  const newPlayerIds = player_ids.filter((id) => !alreadyAddedIds.has(id));

  if (newPlayerIds.length === 0) {
    return { error: 'Selected players are already part of this team' };
  }

  const inserts = newPlayerIds.map((player_id) => ({
    team_id,
    player_id,
    status: 'active',
  }));

  const { error } = await supabaseAdmin.from('team_players').insert(inserts);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/teams');
  return { error: null };
}