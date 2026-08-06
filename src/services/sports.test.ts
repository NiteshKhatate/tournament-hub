import { getSports } from './sports';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

interface MockSupabaseChain {
  select: jest.Mock;
  order: jest.Mock;
  range: jest.Mock;
}

function mockSupabaseChain(
  finalResult: { data: unknown; count?: number }
): MockSupabaseChain {
  const chain: MockSupabaseChain = {
    select: jest.fn(() => chain),
    order: jest.fn(() => chain),
    range: jest.fn(() => Promise.resolve(finalResult)),
  };
  return chain;
}

describe('getSports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns paginated sports with count', async () => {
    const chain = mockSupabaseChain({
      data: [
        { id: 1, name: 'Cricket', status: 'active' },
        { id: 2, name: 'Football', status: 'active' },
      ],
      count: 2,
    });

    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getSports(1);

    expect(result.data).toHaveLength(2);
    expect(result.count).toBe(2);
  });

  it('returns empty array when no sports exist', async () => {
    const chain = mockSupabaseChain({ data: null, count: 0 });

    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getSports(1);

    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
  });

  it('requests the correct range for page 2', async () => {
    const chain = mockSupabaseChain({ data: [], count: 0 });

    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    await getSports(2);

    // page 2 with PAGE_SIZE 10 → range(10, 19)
    expect(chain.range).toHaveBeenCalledWith(10, 19);
  });
});