import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

export async function getPlayers(page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from('players')
    .select('*', { count: 'exact' })
    .order('created', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching players:', error);
    return { data: [], count: 0 };
  }

  if (data && data.length > 0) {
    const sportIds = [...new Set(data.map((player) => player.sport_id).filter(Boolean))];

    const { data: sportsData } = await supabase
      .from('sports')
      .select('id, name')
      .in('id', sportIds.length > 0 ? sportIds : [0]);

    const sportsMap = new Map(sportsData?.map((s) => [s.id, s]) || []);

    const enrichedData = data.map((player) => ({
      ...player,
      sports: sportsMap.get(player.sport_id) || null,
    }));

    return { data: enrichedData, count: count ?? 0 };
  }

  return { data: data ?? [], count: count ?? 0 };
}

export async function getPlayerById(id: number) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching player:', error);
    return { data: null, error };
  }

  if (data && data.sport_id) {
    const { data: sportData } = await supabase
      .from('sports')
      .select('id, name')
      .eq('id', data.sport_id)
      .single();

    return {
      data: { ...data, sports: sportData },
      error: null,
    };
  }

  return { data, error: null };
}