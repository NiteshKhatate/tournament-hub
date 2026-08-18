import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

export async function getOrganisers(page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from('organisers')
    .select('*', { count: 'exact' })
    .order('created', { ascending: false })
    .range(from, to);

  return { data: data ?? [], count: count ?? 0 };
}

export async function getOrganiserById(id: number) {
  const { data, error } = await supabase
    .from('organisers')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}