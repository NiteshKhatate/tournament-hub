import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

export async function getSports(page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from('sports')
    .select('*', { count: 'exact' })
    .order('created', { ascending: false })
    .range(from, to);

  return { data: data ?? [], count: count ?? 0 };
}

export async function createSport(name: string) {
  const { data, error } = await supabase
    .from('sports')
    .insert({ name })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}