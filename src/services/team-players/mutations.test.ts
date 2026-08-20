import { addPlayersToTeam } from './mutations';
import { supabaseAdmin } from '@/lib/supabase-admin';

jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

interface MockChain {
  select: jest.Mock;
  insert: jest.Mock;
  eq: jest.Mock;
  in: jest.Mock;
  then: (resolve: (value: { data: unknown; error?: unknown }) => void) => void;
}

function mockChain(finalResult: { data: unknown; error?: unknown }): MockChain {
  const chain: MockChain = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    in: jest.fn(() => chain),
    then: (resolve) => resolve(finalResult),
  };
  return chain;
}

describe('addPlayersToTeam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds all selected players when none already exist on the team', async () => {
    const existingChain = mockChain({ data: [], error: null });
    const insertChain = mockChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingChain)
      .mockReturnValueOnce(insertChain);

    const result = await addPlayersToTeam({ team_id: 1, player_ids: [10, 11, 12] });

    expect(result.error).toBeNull();
    expect(insertChain.insert).toHaveBeenCalledWith([
      { team_id: 1, player_id: 10, status: 'active' },
      { team_id: 1, player_id: 11, status: 'active' },
      { team_id: 1, player_id: 12, status: 'active' },
    ]);
  });

  it('returns an error when no player ids are provided', async () => {
    const result = await addPlayersToTeam({ team_id: 1, player_ids: [] });

    expect(result.error).toBe('Please select at least one player');
    expect(supabaseAdmin.from).not.toHaveBeenCalled();
  });

  it('filters out players already on the team before inserting', async () => {
    const existingChain = mockChain({ data: [{ player_id: 10 }], error: null });
    const insertChain = mockChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingChain)
      .mockReturnValueOnce(insertChain);

    const result = await addPlayersToTeam({ team_id: 1, player_ids: [10, 11] });

    expect(insertChain.insert).toHaveBeenCalledWith([
      { team_id: 1, player_id: 11, status: 'active' },
    ]);
    expect(result.error).toBeNull();
  });

  it('returns an error when all selected players are already on the team', async () => {
    const existingChain = mockChain({ data: [{ player_id: 10 }, { player_id: 11 }], error: null });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(existingChain);

    const result = await addPlayersToTeam({ team_id: 1, player_ids: [10, 11] });

    expect(result.error).toBe('Selected players are already part of this team');
  });

  it('returns an error when insert fails', async () => {
    const existingChain = mockChain({ data: [], error: null });
    const insertChain = mockChain({ data: null, error: { message: 'insert failed' } });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingChain)
      .mockReturnValueOnce(insertChain);

    const result = await addPlayersToTeam({ team_id: 1, player_ids: [10] });

    expect(result.error).toBe('insert failed');
  });

  it('checks existing players scoped to the given team only', async () => {
    const existingChain = mockChain({ data: [], error: null });
    const insertChain = mockChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingChain)
      .mockReturnValueOnce(insertChain);

    await addPlayersToTeam({ team_id: 5, player_ids: [10] });

    expect(existingChain.eq).toHaveBeenCalledWith('team_id', 5);
    expect(existingChain.in).toHaveBeenCalledWith('player_id', [10]);
  });
});