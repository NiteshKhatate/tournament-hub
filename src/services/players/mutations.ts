'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface CreatePlayerInput {
  name: string;
  email: string;
  contact: number;
  sport_id: number;
  id_type: 'aadhar' | 'pan' | 'school_id' | 'college_id';
  id_proof: string;
  birthdate: string;
  height?: number;
  weight?: number;
}

export async function createPlayer(input: CreatePlayerInput) {
  const { data, error } = await supabaseAdmin
    .from('players')
    .insert(input)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/players');
  return { data, error: null };
}

interface UpdatePlayerInput {
  id: number;
  name: string;
  email: string;
  contact: number;
  sport_id: number;
  id_type: 'aadhar' | 'pan' | 'school_id' | 'college_id';
  id_proof: string;
  birthdate: string;
  height?: number;
  weight?: number;
  status: 'active' | 'inactive';
}

export async function updatePlayer(input: UpdatePlayerInput) {
  const { id, ...updateData } = input;

  const { data, error } = await supabaseAdmin
    .from('players')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/players');
  return { data, error: null };
}

export async function deletePlayer(id: number) {
  const { error } = await supabaseAdmin
    .from('players')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/players');
  return { error: null };
}