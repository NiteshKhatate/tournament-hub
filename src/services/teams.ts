import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

export async function getTeams(page: number) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from('teams')
    .select('*', { count: 'exact' })
    .order('created', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching teams:', error);
    return { data: [], count: 0 };
  }

  // Fetch sports separately and map them
  if (data && data.length > 0) {
    const sportIds = [...new Set(data.map((team: any) => team.sport_id))];
    const { data: sportsData } = await supabase
      .from('sports')
      .select('id, name')
      .in('id', sportIds);

    const sportsMap = new Map(sportsData?.map((s: any) => [s.id, s]) || []);

    const enrichedData = data.map((team: any) => ({
      ...team,
      sports: sportsMap.get(team.sport_id) || null,
    }));

    return { data: enrichedData, count: count ?? 0 };
  }

  return { data: data ?? [], count: count ?? 0 };
}

export async function getTeamById(id: number) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching team:', error);
    return { data: null, error };
  }

  // Fetch sport separately
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