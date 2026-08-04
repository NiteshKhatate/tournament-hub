import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

export async function getSports(page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('sports')
    .select('*', { count: 'exact' })
    .order('created', { ascending: false })
    .range(from, to);

  if (error) {
    return { data: [], count: 0, error: error.message };
  }

  return { data, count: count ?? 0, error: null };
}