import { getTournamentCriteria } from './queries';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

interface MockSupabaseChain {
  select: jest.Mock;
  order: jest.Mock;
  range?: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  then: (resolve: (value: { data: unknown; error?: unknown }) => void) => void;
}

describe('getTournamentCriteria', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns criteria for a tournament', async () => {
    const criteriaData = [
      {
        id: 1,
        tournament_id: 1,
        type: 'age',
        operator: 'min',
        value_min: 18,
      },
    ];

    const chain: MockSupabaseChain = {
      select: jest.fn(() => chain),
      order: jest.fn(() => chain),
      eq: jest.fn(() => chain),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      then: (resolve) => resolve({ data: criteriaData, error: null }),
    };

    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getTournamentCriteria(1);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].type).toBe('age');
  });

  it('returns empty array when no criteria exist', async () => {
    const chain: MockSupabaseChain = {
      select: jest.fn(() => chain),
      order: jest.fn(() => chain),
      eq: jest.fn(() => chain),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      then: (resolve) => resolve({ data: null, error: null }),
    };

    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getTournamentCriteria(1);

    expect(result.data).toEqual([]);
  });

  it('orders criteria by creation date descending', async () => {
    const chain: MockSupabaseChain = {
      select: jest.fn(() => chain),
      order: jest.fn(() => chain),
      eq: jest.fn(() => chain),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      then: (resolve) => resolve({ data: [], error: null }),
    };

    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    await getTournamentCriteria(1);

    expect(chain.order).toHaveBeenCalledWith('created', { ascending: false });
  });
});