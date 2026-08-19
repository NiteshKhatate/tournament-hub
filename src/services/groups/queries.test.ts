import {
  getGroupingOptions,
  getTournamentTeamsForGrouping,
  getTournamentGroups,
  getTournamentGroupsMap,
} from './queries';
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
  order: jest.Mock;
  then: (resolve: (value: { data: unknown; error?: unknown }) => void) => void;
}

function mockChain(finalResult: { data: unknown; error?: unknown }): MockChain {
  const chain: MockChain = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    in: jest.fn(() => chain),
    order: jest.fn(() => chain),
    then: (resolve) => resolve(finalResult),
  };
  return chain;
}

describe('getGroupingOptions', () => {
  it('returns all valid divisors with at least 3 teams per group for 12 teams', () => {
    const options = getGroupingOptions(12);

    expect(options).toEqual([
      { groupCount: 1, teamsPerGroup: 12 },
      { groupCount: 2, teamsPerGroup: 6 },
      { groupCount: 3, teamsPerGroup: 4 },
      { groupCount: 4, teamsPerGroup: 3 },
    ]);
  });

  it('excludes options where teams per group would be less than 3', () => {
    const options = getGroupingOptions(12);

    // 6 groups of 2, 12 groups of 1 should NOT be included
    expect(options.find((o) => o.groupCount === 6)).toBeUndefined();
    expect(options.find((o) => o.groupCount === 12)).toBeUndefined();
  });

  it('returns only the single-group option when team count is prime and >= 3', () => {
    const options = getGroupingOptions(7);

    expect(options).toEqual([{ groupCount: 1, teamsPerGroup: 7 }]);
  });

  it('returns empty array when team count is less than 3', () => {
    const options = getGroupingOptions(2);

    expect(options).toEqual([]);
  });

  it('returns a single group option for exactly 3 teams', () => {
    const options = getGroupingOptions(3);

    expect(options).toEqual([{ groupCount: 1, teamsPerGroup: 3 }]);
  });

  it('handles a large evenly-divisible team count', () => {
    const options = getGroupingOptions(24);

    expect(options).toContainEqual({ groupCount: 1, teamsPerGroup: 24 });
    expect(options).toContainEqual({ groupCount: 2, teamsPerGroup: 12 });
    expect(options).toContainEqual({ groupCount: 3, teamsPerGroup: 8 });
    expect(options).toContainEqual({ groupCount: 4, teamsPerGroup: 6 });
    expect(options).toContainEqual({ groupCount: 6, teamsPerGroup: 4 });
    expect(options).toContainEqual({ groupCount: 8, teamsPerGroup: 3 });
    // 12 groups of 2 and 24 groups of 1 should be excluded
    expect(options.find((o) => o.groupCount === 12)).toBeUndefined();
    expect(options.find((o) => o.groupCount === 24)).toBeUndefined();
  });
});

describe('getTournamentTeamsForGrouping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns active tournament teams with team names resolved', async () => {
    const entriesChain = mockChain({
      data: [
        { id: 101, team_id: 1 },
        { id: 102, team_id: 2 },
      ],
      error: null,
    });
    const teamsChain = mockChain({
      data: [
        { id: 1, name: 'City Warriors' },
        { id: 2, name: 'City Ballers' },
      ],
      error: null,
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(entriesChain)
      .mockReturnValueOnce(teamsChain);

    const result = await getTournamentTeamsForGrouping(1);

    expect(result.data).toEqual([
      { tournament_team_id: 101, team_id: 1, team_name: 'City Warriors' },
      { tournament_team_id: 102, team_id: 2, team_name: 'City Ballers' },
    ]);
  });

  it('returns empty array when no teams are registered', async () => {
    const entriesChain = mockChain({ data: [], error: null });

    (supabase.from as jest.Mock).mockReturnValueOnce(entriesChain);

    const result = await getTournamentTeamsForGrouping(1);

    expect(result.data).toEqual([]);
  });

  it('only fetches teams with active status', async () => {
    const entriesChain = mockChain({ data: [], error: null });

    (supabase.from as jest.Mock).mockReturnValueOnce(entriesChain);

    await getTournamentTeamsForGrouping(1);

    expect(entriesChain.eq).toHaveBeenCalledWith('status', 'active');
  });

  it('returns empty array on query error', async () => {
    const entriesChain = mockChain({ data: null, error: { message: 'db error' } });

    (supabase.from as jest.Mock).mockReturnValueOnce(entriesChain);

    const result = await getTournamentTeamsForGrouping(1);

    expect(result.data).toEqual([]);
    expect(result.error).toBeTruthy();
  });
});

describe('getTournamentGroups', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns groups with their assigned teams resolved', async () => {
    const groupsChain = mockChain({
      data: [
        { id: 1, name: 'Group 1' },
        { id: 2, name: 'Group 2' },
      ],
      error: null,
    });
    const groupTeamsChain = mockChain({
      data: [
        { id: 1, group_id: 1, tournament_team_id: 101 },
        { id: 2, group_id: 2, tournament_team_id: 102 },
      ],
      error: null,
    });
    const tournamentTeamsChain = mockChain({
      data: [
        { id: 101, team_id: 1 },
        { id: 102, team_id: 2 },
      ],
    });
    const teamsChain = mockChain({
      data: [
        { id: 1, name: 'City Warriors' },
        { id: 2, name: 'City Ballers' },
      ],
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(groupsChain)
      .mockReturnValueOnce(groupTeamsChain)
      .mockReturnValueOnce(tournamentTeamsChain)
      .mockReturnValueOnce(teamsChain);

    const result = await getTournamentGroups(1);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({
      id: 1,
      name: 'Group 1',
      teams: [{ id: 1, name: 'City Warriors' }],
    });
    expect(result.data[1]).toEqual({
      id: 2,
      name: 'Group 2',
      teams: [{ id: 2, name: 'City Ballers' }],
    });
  });

  it('returns empty array when no groups exist for the tournament', async () => {
    const groupsChain = mockChain({ data: [], error: null });

    (supabase.from as jest.Mock).mockReturnValueOnce(groupsChain);

    const result = await getTournamentGroups(1);

    expect(result.data).toEqual([]);
  });

  it('groups multiple teams under the same group correctly', async () => {
    const groupsChain = mockChain({ data: [{ id: 1, name: 'Group 1' }], error: null });
    const groupTeamsChain = mockChain({
      data: [
        { id: 1, group_id: 1, tournament_team_id: 101 },
        { id: 2, group_id: 1, tournament_team_id: 102 },
        { id: 3, group_id: 1, tournament_team_id: 103 },
      ],
      error: null,
    });
    const tournamentTeamsChain = mockChain({
      data: [
        { id: 101, team_id: 1 },
        { id: 102, team_id: 2 },
        { id: 103, team_id: 3 },
      ],
    });
    const teamsChain = mockChain({
      data: [
        { id: 1, name: 'Team A' },
        { id: 2, name: 'Team B' },
        { id: 3, name: 'Team C' },
      ],
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(groupsChain)
      .mockReturnValueOnce(groupTeamsChain)
      .mockReturnValueOnce(tournamentTeamsChain)
      .mockReturnValueOnce(teamsChain);

    const result = await getTournamentGroups(1);

    expect(result.data[0].teams).toHaveLength(3);
    expect(result.data[0].teams.map((t) => t.name)).toEqual(['Team A', 'Team B', 'Team C']);
  });
});

describe('getTournamentGroupsMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a map of tournament ids that have groups', async () => {
    const chain = mockChain({
      data: [{ tournament_id: 1 }, { tournament_id: 3 }],
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getTournamentGroupsMap([1, 2, 3]);

    expect(result.get(1)).toBe(true);
    expect(result.get(2)).toBeUndefined();
    expect(result.get(3)).toBe(true);
  });

  it('returns an empty map when no tournament ids are passed', async () => {
    const result = await getTournamentGroupsMap([]);

    expect(result.size).toBe(0);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});