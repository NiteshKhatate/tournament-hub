import { getTeams, getTeamById } from './teams';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('./tournament-teams', () => ({
  getTeamApplicationsMap: jest.fn(),
}));

import { getTeamApplicationsMap } from './tournament-teams';

// Suppress console.error noise from intentional error-case tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

interface MockChain {
  select: jest.Mock;
  order: jest.Mock;
  range: jest.Mock;
  eq: jest.Mock;
  in: jest.Mock;
  single: jest.Mock;
}

function mockChain(finalResult: { data: unknown; count?: number | null; error?: unknown }): MockChain {
  const chain: MockChain = {
    select: jest.fn(() => chain),
    order: jest.fn(() => chain),
    range: jest.fn(() => Promise.resolve(finalResult)),
    eq: jest.fn(() => chain),
    in: jest.fn(() => Promise.resolve(finalResult)),
    single: jest.fn(() => Promise.resolve(finalResult)),
  };
  return chain;
}

describe('getTeams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns paginated teams enriched with sport and application flag', async () => {
    const teamsChain = mockChain({
      data: [
        { id: 1, name: 'City Warriors', sport_id: 10, email: 'a@a.com', contact: 9999999999, status: 'active', created: '2025-01-01' },
      ],
      count: 1,
    });
    const sportsChain = mockChain({ data: [{ id: 10, name: 'Cricket' }] });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(teamsChain)
      .mockReturnValueOnce(sportsChain);

    (getTeamApplicationsMap as jest.Mock).mockResolvedValue(new Map([[1, true]]));

    const result = await getTeams(1);

    expect(result.count).toBe(1);
    expect(result.data[0].sports).toEqual({ id: 10, name: 'Cricket' });
    expect(result.data[0].hasApplications).toBe(true);
  });

  it('returns empty array when no teams exist', async () => {
    const teamsChain = mockChain({ data: [], count: 0 });

    (supabase.from as jest.Mock).mockReturnValueOnce(teamsChain);

    const result = await getTeams(1);

    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
  });

  it('returns empty array on query error', async () => {
    const teamsChain = mockChain({ data: null, count: null, error: { message: 'db error' } });

    (supabase.from as jest.Mock).mockReturnValueOnce(teamsChain);

    const result = await getTeams(1);

    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
  });

  it('sets hasApplications to false for teams with no applications', async () => {
    const teamsChain = mockChain({
      data: [{ id: 2, name: 'City Ballers', sport_id: 11, status: 'active' }],
      count: 1,
    });
    const sportsChain = mockChain({ data: [{ id: 11, name: 'Basketball' }] });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(teamsChain)
      .mockReturnValueOnce(sportsChain);

    (getTeamApplicationsMap as jest.Mock).mockResolvedValue(new Map());

    const result = await getTeams(1);

    expect(result.data[0].hasApplications).toBe(false);
  });

  it('requests the correct range for page 2', async () => {
    const teamsChain = mockChain({ data: [], count: 0 });

    (supabase.from as jest.Mock).mockReturnValueOnce(teamsChain);

    await getTeams(2);

    expect(teamsChain.range).toHaveBeenCalledWith(10, 19);
  });
});

describe('getTeamById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a team enriched with sport details', async () => {
    const teamChain = mockChain({
      data: { id: 1, name: 'City Warriors', sport_id: 10 },
      error: null,
    });
    const sportChain = mockChain({ data: { id: 10, name: 'Cricket' }, error: null });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(teamChain)
      .mockReturnValueOnce(sportChain);

    const result = await getTeamById(1);

    expect(result.data?.name).toBe('City Warriors');
    expect(result.data?.sports).toEqual({ id: 10, name: 'Cricket' });
  });

  it('returns an error when team is not found', async () => {
    const teamChain = mockChain({ data: null, error: { message: 'Not found' } });

    (supabase.from as jest.Mock).mockReturnValueOnce(teamChain);

    const result = await getTeamById(999);

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });
});