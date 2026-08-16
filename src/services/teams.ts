import { supabase } from '@/lib/supabase';
import { getTeamApplicationsMap } from './tournament-teams';

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

  if (data && data.length > 0) {
    const sportIds = [...new Set(data.map((team) => team.sport_id))];
    const teamIds = data.map((team) => team.id);

    const [sportsResult, applicationsMap] = await Promise.all([
      supabase.from('sports').select('id, name').in('id', sportIds),
      getTeamApplicationsMap(teamIds),
    ]);

    const sportsMap = new Map(sportsResult.data?.map((s) => [s.id, s]) || []);

    const enrichedData = data.map((team) => ({
      ...team,
      sports: sportsMap.get(team.sport_id) || null,
      hasApplications: applicationsMap.get(team.id) || false,
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