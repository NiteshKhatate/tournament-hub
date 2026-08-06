import { getOrganisers, getOrganiserById } from './organisers';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

function mockSupabaseChain(finalResult: any) {
  const chain: any = {
    select: jest.fn(() => chain),
    order: jest.fn(() => chain),
    range: jest.fn(() => Promise.resolve(finalResult)),
    eq: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(finalResult)),
  };
  return chain;
}

describe('getOrganisers', () => {
  it('returns paginated organisers with count', async () => {
    const chain = mockSupabaseChain({
      data: [{ id: 1, name: 'Organiser A' }],
      count: 1,
    });
    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getOrganisers(1);

    expect(result.data).toHaveLength(1);
    expect(result.count).toBe(1);
  });

  it('returns empty array when no organisers exist', async () => {
    const chain = mockSupabaseChain({ data: null, count: 0 });
    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getOrganisers(1);

    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
  });
});

describe('getOrganiserById', () => {
  it('returns a single organiser by id', async () => {
    const chain = mockSupabaseChain({
      data: { id: 10, name: 'Test Organiser' },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getOrganiserById(10);

    expect(result.data?.name).toBe('Test Organiser');
    expect(result.error).toBeNull();
  });

  it('returns an error when the organiser is not found', async () => {
    const chain = mockSupabaseChain({
      data: null,
      error: { message: 'Not found' },
    });
    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getOrganiserById(999);

    expect(result.error?.message).toBe('Not found');
  });
});