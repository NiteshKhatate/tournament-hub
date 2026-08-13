import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

export async function getTeams(page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from('teams')
    .select('*, sports(name)', { count: 'exact' })
    .order('created', { ascending: false })
    .range(from, to);

  return { data: data ?? [], count: count ?? 0 };
}

export async function getTeamById(id: number) {
  const { data, error } = await supabase
    .from('teams')
    .select('*, sports(name)')
    .eq('id', id)
    .single();

  return { data, error };
}