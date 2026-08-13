import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

export async function getTeams(page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from('teams')
    .select('id, name, email, contact, status, created, sport_id, sports(name)', { count: 'exact' })
    .order('created', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching teams:', error);
  }

  return { data: data ?? [], count: count ?? 0 };
}

export async function getTeamById(id: number) {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, sport_id, login_id, email, contact, status, sports(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching team:', error);
  }

  return { data, error };
}