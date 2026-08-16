import { applyTeamToTournament } from './actions';
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
  single: jest.Mock;
  maybeSingle: jest.Mock;
}

function mockChain(finalResult: { data: unknown; error?: unknown }): MockChain {
  const chain: MockChain = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(finalResult)),
    maybeSingle: jest.fn(() => Promise.resolve(finalResult)),
  };
  return chain;
}

describe('applyTeamToTournament', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies a team to a tournament of the same sport successfully', async () => {
    const teamChain = mockChain({ data: { sport_id: 1 }, error: null });
    const tournamentChain = mockChain({ data: { sport_id: 1 }, error: null });
    const existingChain = mockChain({ data: null, error: null });
    const insertChain = mockChain({
      data: { id: 1, team_id: 1, tournament_id: 5, status: 'active' },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(teamChain)
      .mockReturnValueOnce(tournamentChain)
      .mockReturnValueOnce(existingChain)
      .mockReturnValueOnce(insertChain);

    const result = await applyTeamToTournament({ team_id: 1, tournament_id: 5 });

    expect(result.error).toBeNull();
    expect(result.data?.status).toBe('active');
  });

  it('returns an error when team is not found', async () => {
    const teamChain = mockChain({ data: null, error: { message: 'Not found' } });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(teamChain);

    const result = await applyTeamToTournament({ team_id: 999, tournament_id: 5 });

    expect(result.error).toBe('Team not found');
  });

  it('returns an error when tournament is not found', async () => {
    const teamChain = mockChain({ data: { sport_id: 1 }, error: null });
    const tournamentChain = mockChain({ data: null, error: { message: 'Not found' } });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(teamChain)
      .mockReturnValueOnce(tournamentChain);

    const result = await applyTeamToTournament({ team_id: 1, tournament_id: 999 });

    expect(result.error).toBe('Tournament not found');
  });

  it('returns an error when sports do not match', async () => {
    const teamChain = mockChain({ data: { sport_id: 1 }, error: null });
    const tournamentChain = mockChain({ data: { sport_id: 2 }, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(teamChain)
      .mockReturnValueOnce(tournamentChain);

    const result = await applyTeamToTournament({ team_id: 1, tournament_id: 5 });

    expect(result.error).toBe('This team can only apply to tournaments of the same sport');
  });

  it('returns an error when team has already applied to the tournament', async () => {
    const teamChain = mockChain({ data: { sport_id: 1 }, error: null });
    const tournamentChain = mockChain({ data: { sport_id: 1 }, error: null });
    const existingChain = mockChain({ data: { id: 1 }, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(teamChain)
      .mockReturnValueOnce(tournamentChain)
      .mockReturnValueOnce(existingChain);

    const result = await applyTeamToTournament({ team_id: 1, tournament_id: 5 });

    expect(result.error).toBe('This team is already registered for the selected tournament');
  });

  it('allows a team to apply to multiple different tournaments of the same sport', async () => {
    const teamChain = mockChain({ data: { sport_id: 1 }, error: null });
    const tournamentChain = mockChain({ data: { sport_id: 1 }, error: null });
    const existingChain = mockChain({ data: null, error: null });
    const insertChain = mockChain({
      data: { id: 2, team_id: 1, tournament_id: 6, status: 'active' },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(teamChain)
      .mockReturnValueOnce(tournamentChain)
      .mockReturnValueOnce(existingChain)
      .mockReturnValueOnce(insertChain);

    const result = await applyTeamToTournament({ team_id: 1, tournament_id: 6 });

    expect(result.data?.tournament_id).toBe(6);
    expect(result.error).toBeNull();
  });

  it('returns an error when insert fails', async () => {
    const teamChain = mockChain({ data: { sport_id: 1 }, error: null });
    const tournamentChain = mockChain({ data: { sport_id: 1 }, error: null });
    const existingChain = mockChain({ data: null, error: null });
    const insertChain = mockChain({
      data: null,
      error: { message: 'insert failed' },
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(teamChain)
      .mockReturnValueOnce(tournamentChain)
      .mockReturnValueOnce(existingChain)
      .mockReturnValueOnce(insertChain);

    const result = await applyTeamToTournament({ team_id: 1, tournament_id: 5 });

    expect(result.error).toBe('insert failed');
  });
});