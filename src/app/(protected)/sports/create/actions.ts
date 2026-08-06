'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function createSport(name: string) {
  const { data, error } = await supabaseAdmin
    .from('sports')
    .insert({ name })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath('/sports');
  return { data, error: null };
}

export async function deleteSport(id: number) {
  const { error } = await supabaseAdmin
    .from('sports')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/sports');
  return { error: null };
}