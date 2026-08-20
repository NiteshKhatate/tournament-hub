import { getAvailablePlayersForTeam, getTeamPlayers } from './queries';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

interface MockChain {
  select: jest.Mock;
  eq: jest.Mock;
  in: jest.Mock;
  not: jest.Mock;
  order: jest.Mock;
  then: (resolve: (value: { data: unknown; error?: unknown }) => void) => void;
}

function mockChain(finalResult: { data: unknown; error?: unknown }): MockChain {
  const chain: MockChain = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    in: jest.fn(() => chain),
    not: jest.fn(() => chain),
    order: jest.fn(() => chain),
    then: (resolve) => resolve(finalResult),
  };
  return chain;
}

describe('getAvailablePlayersForTeam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns active players of the given sport, excluding players active on any team', async () => {
    const activeTeamPlayersChain = mockChain({
      data: [{ player_id: 1 }, { player_id: 2 }],
      error: null,
    });
    const playersChain = mockChain({
      data: [{ id: 3, name: 'City Player', email: 'p3@example.com', contact: 9999999999 }],
      error: null,
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(activeTeamPlayersChain)
      .mockReturnValueOnce(playersChain);

    const result = await getAvailablePlayersForTeam(10);

    expect(playersChain.not).toHaveBeenCalledWith('id', 'in', '(1,2)');
    expect(result.data).toEqual([
      { id: 3, name: 'City Player', email: 'p3@example.com', contact: 9999999999 },
    ]);
  });

  it('excludes a player active on ANY team, not just the current team', async () => {
    // Player 1 is active on some other team entirely
    const activeTeamPlayersChain = mockChain({
      data: [{ player_id: 1 }],
      error: null,
    });
    const playersChain = mockChain({ data: [], error: null });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(activeTeamPlayersChain)
      .mockReturnValueOnce(playersChain);

    await getAvailablePlayersForTeam(10);

    expect(playersChain.not).toHaveBeenCalledWith('id', 'in', '(1)');
  });

  it('does not apply a not-in filter when there are no active team players at all', async () => {
    const activeTeamPlayersChain = mockChain({ data: [], error: null });
    const playersChain = mockChain({
      data: [{ id: 1, name: 'Player A', email: 'a@example.com', contact: 1111111111 }],
      error: null,
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(activeTeamPlayersChain)
      .mockReturnValueOnce(playersChain);

    const result = await getAvailablePlayersForTeam(10);

    expect(playersChain.not).not.toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
  });

  it('only queries players with active status and matching sport', async () => {
    const activeTeamPlayersChain = mockChain({ data: [], error: null });
    const playersChain = mockChain({ data: [], error: null });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(activeTeamPlayersChain)
      .mockReturnValueOnce(playersChain);

    await getAvailablePlayersForTeam(10);

    expect(playersChain.eq).toHaveBeenCalledWith('sport_id', 10);
    expect(playersChain.eq).toHaveBeenCalledWith('status', 'active');
  });

  it('deduplicates excluded player ids', async () => {
    const activeTeamPlayersChain = mockChain({
      data: [{ player_id: 5 }, { player_id: 5 }, { player_id: 5 }],
      error: null,
    });
    const playersChain = mockChain({ data: [], error: null });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(activeTeamPlayersChain)
      .mockReturnValueOnce(playersChain);

    await getAvailablePlayersForTeam(10);

    expect(playersChain.not).toHaveBeenCalledWith('id', 'in', '(5)');
  });

  it('returns empty array and error on query failure', async () => {
    const activeTeamPlayersChain = mockChain({ data: [], error: null });
    const playersChain = mockChain({ data: null, error: { message: 'db error' } });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(activeTeamPlayersChain)
      .mockReturnValueOnce(playersChain);

    const result = await getAvailablePlayersForTeam(10);

    expect(result.data).toEqual([]);
    expect(result.error).toBeTruthy();
  });
});

describe('getTeamPlayers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns team players enriched with player details', async () => {
    const teamPlayersChain = mockChain({
      data: [{ id: 1, status: 'active', player_id: 100 }],
      error: null,
    });
    const playersChain = mockChain({
      data: [{ id: 100, name: 'Rohit Sharma', email: 'rohit@example.com', contact: 9999999999 }],
      error: null,
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(teamPlayersChain)
      .mockReturnValueOnce(playersChain);

    const result = await getTeamPlayers(1);

    expect(result.data).toEqual([
      {
        id: 1,
        status: 'active',
        player_id: 100,
        player_name: 'Rohit Sharma',
        player_email: 'rohit@example.com',
        player_contact: 9999999999,
      },
    ]);
  });

  it('returns empty array when team has no players', async () => {
    const teamPlayersChain = mockChain({ data: [], error: null });

    (supabase.from as jest.Mock).mockReturnValueOnce(teamPlayersChain);

    const result = await getTeamPlayers(1);

    expect(result.data).toEqual([]);
  });

  it('falls back to defaults when a player record is missing', async () => {
    const teamPlayersChain = mockChain({
      data: [{ id: 1, status: 'active', player_id: 999 }],
      error: null,
    });
    const playersChain = mockChain({ data: [], error: null });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(teamPlayersChain)
      .mockReturnValueOnce(playersChain);

    const result = await getTeamPlayers(1);

    expect(result.data[0]).toEqual({
      id: 1,
      status: 'active',
      player_id: 999,
      player_name: 'Unknown Player',
      player_email: '',
      player_contact: 0,
    });
  });

  it('returns error on query failure', async () => {
    const teamPlayersChain = mockChain({ data: null, error: { message: 'db error' } });

    (supabase.from as jest.Mock).mockReturnValueOnce(teamPlayersChain);

    const result = await getTeamPlayers(1);

    expect(result.data).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it('orders team players by most recently added first', async () => {
    const teamPlayersChain = mockChain({ data: [], error: null });

    (supabase.from as jest.Mock).mockReturnValueOnce(teamPlayersChain);

    await getTeamPlayers(1);

    expect(teamPlayersChain.order).toHaveBeenCalledWith('id', { ascending: false });
  });
});