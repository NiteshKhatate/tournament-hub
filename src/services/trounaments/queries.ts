import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

export async function getTournaments(page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from('tournaments')
    .select('*, organisers(name), sports(name)', { count: 'exact' })
    .order('created', { ascending: false })
    .range(from, to);

  return { data: data ?? [], count: count ?? 0 };
}

export async function getTournamentById(id: number) {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*, organisers(name), sports(name)')
    .eq('id', id)
    .single();

  return { data, error };
}

export async function getTournamentCriteria(tournamentId: number) {
  const { data, error } = await supabase
    .from('tournament_players_criteria')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('created', { ascending: false });

  return { data: data ?? [], error };
}

export async function getActiveTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('id, name')
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error('Error fetching active tournaments:', error);
  }

  return { data: data ?? [], error };
}