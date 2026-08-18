'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import bcrypt from 'bcryptjs';

interface CreateTeamInput {
  name: string;
  sport_id: number;
  username: string;
  password: string;
  email: string;
  contact: number;
}

export async function createTeam(input: CreateTeamInput) {
  const { name, sport_id, username, password, email, contact } = input;

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Start transaction: create login first
  const { data: loginData, error: loginError } = await supabaseAdmin
    .from('login')
    .insert({
      username,
      password: hashedPassword,
      role: 'team_manager',
      status: 'active',
    })
    .select()
    .single();

  if (loginError) {
    return { data: null, error: loginError.message };
  }

  // Create team with login_id
  const { data: teamData, error: teamError } = await supabaseAdmin
    .from('teams')
    .insert({
      name,
      sport_id,
      login_id: loginData.id,
      email,
      contact,
      status: 'active',
    })
    .select()
    .single();

  if (teamError) {
    // Rollback: delete the login record if team creation fails
    await supabaseAdmin.from('login').delete().eq('id', loginData.id);
    return { data: null, error: teamError.message };
  }

  revalidatePath('/teams');
  return { data: teamData, error: null };
}

interface UpdateTeamInput {
  id: number;
  name: string;
  sport_id: number;
  email: string;
  contact: number;
  status: 'active' | 'inactive';
}

export async function updateTeam(input: UpdateTeamInput) {
  const { id, ...updateData } = input;

  const { data, error } = await supabaseAdmin
    .from('teams')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/teams');
  return { data, error: null };
}

export async function deleteTeam(id: number) {
  // Fetch the team to get login_id
  const { data: team, error: fetchError } = await supabaseAdmin
    .from('teams')
    .select('login_id')
    .eq('id', id)
    .single();

  if (fetchError || !team) {
    return { error: 'Team not found' };
  }

  // Delete team
  const { error: deleteTeamError } = await supabaseAdmin
    .from('teams')
    .delete()
    .eq('id', id);

  if (deleteTeamError) {
    return { error: deleteTeamError.message };
  }

  // Delete corresponding login record
  const { error: deleteLoginError } = await supabaseAdmin
    .from('login')
    .delete()
    .eq('id', team.login_id);

  if (deleteLoginError) {
    return { error: deleteLoginError.message };
  }

  revalidatePath('/teams');
  return { error: null };
}

interface UpdateTeamLoginInput {
  id: number;
  status: 'active' | 'inactive';
}

export async function updateTeamStatus(input: UpdateTeamLoginInput) {
  const { id, status } = input;

  // Fetch team to get login_id
  const { data: team, error: fetchError } = await supabaseAdmin
    .from('teams')
    .select('login_id')
    .eq('id', id)
    .single();

  if (fetchError || !team) {
    return { error: 'Team not found' };
  }

  // Update team status
  const { data: teamData, error: teamError } = await supabaseAdmin
    .from('teams')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (teamError) {
    return { data: null, error: teamError.message };
  }

  // Update corresponding login status
  const { error: loginError } = await supabaseAdmin
    .from('login')
    .update({ status })
    .eq('id', team.login_id);

  if (loginError) {
    return { data: null, error: loginError.message };
  }

  revalidatePath('/teams');
  return { data: teamData, error: null };
}

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