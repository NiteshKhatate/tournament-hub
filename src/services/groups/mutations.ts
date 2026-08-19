'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface CreateGroupsInput {
  tournament_id: number;
  group_count: number;
}

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function createTournamentGroups(input: CreateGroupsInput) {
  const { tournament_id, group_count } = input;

  // Prevent duplicate grouping
  const { data: existingGroups } = await supabaseAdmin
    .from('groups')
    .select('id')
    .eq('tournament_id', tournament_id);

  if (existingGroups && existingGroups.length > 0) {
    return { error: 'Groups have already been created for this tournament' };
  }

  // Fetch registered teams
  const { data: entries, error: entriesError } = await supabaseAdmin
    .from('tournament_teams')
    .select('id')
    .eq('tournament_id', tournament_id)
    .eq('status', 'active');

  if (entriesError) {
    return { error: entriesError.message };
  }

  if (!entries || entries.length === 0) {
    return { error: 'No teams registered for this tournament' };
  }

  const teamCount = entries.length;

  if (teamCount % group_count !== 0) {
    return { error: 'Selected grouping does not evenly divide the number of teams' };
  }

  const teamsPerGroup = teamCount / group_count;

  if (teamsPerGroup < 3) {
    return { error: 'Each group must have at least 3 teams' };
  }

  // Shuffle tournament_team ids randomly
  const shuffledEntries = shuffle(entries.map((e) => e.id));

  // Create group rows
  const groupInserts = Array.from({ length: group_count }, (_, i) => ({
    name: `Group ${i + 1}`,
    tournament_id,
    status: 'active',
  }));

  const { data: createdGroups, error: groupsError } = await supabaseAdmin
    .from('groups')
    .insert(groupInserts)
    .select('id');

  if (groupsError || !createdGroups) {
    return { error: groupsError?.message ?? 'Failed to create groups' };
  }

  // Assign shuffled teams into contiguous chunks per group
  const groupTeamInserts: { group_id: number; tournament_team_id: number }[] = [];

  createdGroups.forEach((group, index) => {
    const chunk = shuffledEntries.slice(index * teamsPerGroup, (index + 1) * teamsPerGroup);
    chunk.forEach((tournamentTeamId) => {
      groupTeamInserts.push({ group_id: group.id, tournament_team_id: tournamentTeamId });
    });
  });

  const { error: groupTeamsError } = await supabaseAdmin
    .from('group_teams')
    .insert(groupTeamInserts);

  if (groupTeamsError) {
    // Rollback created groups if team assignment fails
    await supabaseAdmin
      .from('groups')
      .delete()
      .in('id', createdGroups.map((g) => g.id));

    return { error: groupTeamsError.message };
  }

  revalidatePath('/tournaments');
  return { error: null };
}