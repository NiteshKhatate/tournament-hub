import { getDashboardCounts } from './queries';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

function mockCountChain(count: number | null) {
  return {
    select: jest.fn().mockResolvedValue({ count, data: null, error: null }),
  };
}

describe('getDashboardCounts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns counts for sports and organisers', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'sports') return mockCountChain(5);
      if (table === 'organisers') return mockCountChain(3);
      return mockCountChain(0);
    });

    const result = await getDashboardCounts();

    expect(result).toEqual({ sports: 5, organisers: 3 });
  });

  it('defaults to 0 when count comes back null', async () => {
    (supabase.from as jest.Mock).mockImplementation(() => mockCountChain(null));

    const result = await getDashboardCounts();

    expect(result).toEqual({ sports: 0, organisers: 0 });
  });

  it('queries both tables independently and in parallel', async () => {
    const sportsChain = mockCountChain(10);
    const organisersChain = mockCountChain(7);

    (supabase.from as jest.Mock).mockImplementation((table: string) =>
      table === 'sports' ? sportsChain : organisersChain
    );

    await getDashboardCounts();

    expect(supabase.from).toHaveBeenCalledWith('sports');
    expect(supabase.from).toHaveBeenCalledWith('organisers');
    expect(sportsChain.select).toHaveBeenCalledWith('*', { count: 'exact', head: true });
  });
});