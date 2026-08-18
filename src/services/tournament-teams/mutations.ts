'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface CreateTournamentInput {
  name: string;
  organiser_id: number;
  sport_id: number;
  entry_fee: number;
  start_date?: string;
  end_date?: string;
  venue?: string;
  geo_location?: string;
}

export async function createTournament(input: CreateTournamentInput) {
  const { data, error } = await supabaseAdmin
    .from('tournaments')
    .insert(input)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/tournaments');
  return { data, error: null };
}

interface UpdateTournamentInput {
  id: number;
  name: string;
  organiser_id: number;
  sport_id: number;
  entry_fee: number;
  start_date?: string;
  end_date?: string;
  venue?: string;
  geo_location?: string;
  status: 'active' | 'inactive';
}

export async function updateTournament(input: UpdateTournamentInput) {
  const { id, ...updateData } = input;

  const { data, error } = await supabaseAdmin
    .from('tournaments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/tournaments');
  return { data, error: null };
}

export async function deleteTournament(id: number) {
  const { error } = await supabaseAdmin
    .from('tournaments')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/tournaments');
  return { error: null };
}

interface CreateCriteriaInput {
  tournament_id: number;
  gender?: string;
  type: string;
  operator: string;
  value_min: number;
  value_max?: number;
  unit?: string;
  max_players_count: number;
  min_players_count: number;
}

export async function createTournamentCriteria(input: CreateCriteriaInput) {
  const { data, error } = await supabaseAdmin
    .from('tournament_players_criteria')
    .insert(input)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/tournaments');
  return { data, error: null };
}

interface UpdateCriteriaInput {
  id: number;
  gender?: string;
  type: string;
  operator: string;
  value_min: number;
  value_max?: number;
  unit?: string;
  max_players_count: number;
  min_players_count: number;
  status: 'active' | 'inactive';
}

export async function updateTournamentCriteria(input: UpdateCriteriaInput) {
  const { id, ...updateData } = input;

  const { data, error } = await supabaseAdmin
    .from('tournament_players_criteria')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/tournaments');
  return { data, error: null };
}

export async function deleteTournamentCriteria(id: number) {
  const { error } = await supabaseAdmin
    .from('tournament_players_criteria')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/tournaments');
  return { error: null };
}