'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export async function createSport(name: string) {
  console.log('Key prefix:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 15));

  const { data, error } = await supabaseAdmin
    .from('sports')
    .insert({ name })
    .select()
    .single();

  console.log('Insert result:', JSON.stringify({ data, error }));

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}