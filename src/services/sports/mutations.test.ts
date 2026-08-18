import { createSport, deleteSport } from './mutations';
import { supabaseAdmin } from '@/lib/supabase-admin';

jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

interface MockSupabaseChain {
  select: jest.Mock;
  insert: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  then: (resolve: (value: { data: unknown; error?: unknown }) => void) => void;
}

function mockSupabaseChain(
  finalResult: { data: unknown; error?: unknown }
): MockSupabaseChain {
  const chain: MockSupabaseChain = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(finalResult)),
    then: (resolve) => resolve(finalResult),
  };
  return chain;
}

describe('createSport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a sport successfully', async () => {
    const insertChain = mockSupabaseChain({
      data: { id: 1, name: 'Cricket' },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(insertChain);

    const result = await createSport('Cricket');

    expect(insertChain.insert).toHaveBeenCalledWith({ name: 'Cricket' });
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ id: 1, name: 'Cricket' });
  });

  it('returns an error when the name already exists', async () => {
    const insertChain = mockSupabaseChain({
      data: null,
      error: { message: 'duplicate key value violates unique constraint' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(insertChain);

    const result = await createSport('Cricket');

    expect(result.error).toBe('duplicate key value violates unique constraint');
    expect(result.data).toBeNull();
  });

  it('returns an error for an empty name', async () => {
    const insertChain = mockSupabaseChain({
      data: null,
      error: { message: 'null value in column "name" violates not-null constraint' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(insertChain);

    const result = await createSport('');

    expect(result.error).toBeTruthy();
  });
});

describe('deleteSport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes a sport successfully', async () => {
    const deleteChain = mockSupabaseChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(deleteChain);

    const result = await deleteSport(1);

    expect(deleteChain.delete).toHaveBeenCalled();
    expect(deleteChain.eq).toHaveBeenCalledWith('id', 1);
    expect(result.error).toBeNull();
  });

  it('returns an error when delete fails', async () => {
    const deleteChain = mockSupabaseChain({
      data: null,
      error: { message: 'permission denied for table sports' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(deleteChain);

    const result = await deleteSport(999);

    expect(result.error).toBe('permission denied for table sports');
  });
});