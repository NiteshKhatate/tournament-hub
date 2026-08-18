import { supabase } from '@/lib/supabase';

export async function getDashboardCounts() {
  const [sportsResult, organisersResult] = await Promise.all([
    supabase.from('sports').select('*', { count: 'exact', head: true }),
    supabase.from('organisers').select('*', { count: 'exact', head: true }),
  ]);

  return {
    sports: sportsResult.count ?? 0,
    organisers: organisersResult.count ?? 0,
  };
}