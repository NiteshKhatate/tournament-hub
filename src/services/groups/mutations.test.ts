import { createTournamentGroups } from './mutations';
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
  delete: jest.Mock;
  eq: jest.Mock;
  in: jest.Mock;
  then: (resolve: (value: { data: unknown; error?: unknown }) => void) => void;
}

function mockChain(finalResult: { data: unknown; error?: unknown }): MockChain {
  const chain: MockChain = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    in: jest.fn(() => chain),
    then: (resolve) => resolve(finalResult),
  };
  return chain;
}

describe('createTournamentGroups', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates groups and distributes all teams evenly', async () => {
    const existingGroupsChain = mockChain({ data: [], error: null });
    const entriesChain = mockChain({
      data: Array.from({ length: 12 }, (_, i) => ({ id: i + 1 })),
      error: null,
    });
    const insertGroupsChain = mockChain({
      data: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      error: null,
    });
    const insertGroupTeamsChain = mockChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingGroupsChain)
      .mockReturnValueOnce(entriesChain)
      .mockReturnValueOnce(insertGroupsChain)
      .mockReturnValueOnce(insertGroupTeamsChain);

    const result = await createTournamentGroups({ tournament_id: 1, group_count: 4 });

    expect(result.error).toBeNull();
    expect(insertGroupsChain.insert).toHaveBeenCalledWith([
      { name: 'Group 1', tournament_id: 1, status: 'active' },
      { name: 'Group 2', tournament_id: 1, status: 'active' },
      { name: 'Group 3', tournament_id: 1, status: 'active' },
      { name: 'Group 4', tournament_id: 1, status: 'active' },
    ]);

    // Verify exactly 12 team assignments were made (3 per group x 4 groups)
    const insertedGroupTeams = insertGroupTeamsChain.insert.mock.calls[0][0];
    expect(insertedGroupTeams).toHaveLength(12);
  });

  it('assigns exactly teamsPerGroup teams to each created group', async () => {
    const existingGroupsChain = mockChain({ data: [], error: null });
    const entriesChain = mockChain({
      data: Array.from({ length: 12 }, (_, i) => ({ id: i + 1 })),
      error: null,
    });
    const insertGroupsChain = mockChain({
      data: [{ id: 10 }, { id: 20 }, { id: 30 }, { id: 40 }],
      error: null,
    });
    const insertGroupTeamsChain = mockChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingGroupsChain)
      .mockReturnValueOnce(entriesChain)
      .mockReturnValueOnce(insertGroupsChain)
      .mockReturnValueOnce(insertGroupTeamsChain);

    await createTournamentGroups({ tournament_id: 1, group_count: 4 });

    const insertedGroupTeams: { group_id: number; tournament_team_id: number }[] =
      insertGroupTeamsChain.insert.mock.calls[0][0];

    const countByGroup = insertedGroupTeams.reduce((acc, gt) => {
      acc[gt.group_id] = (acc[gt.group_id] ?? 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    expect(countByGroup[10]).toBe(3);
    expect(countByGroup[20]).toBe(3);
    expect(countByGroup[30]).toBe(3);
    expect(countByGroup[40]).toBe(3);
  });

  it('assigns every registered team exactly once (no duplicates, none missing)', async () => {
    const existingGroupsChain = mockChain({ data: [], error: null });
    const teamIds = Array.from({ length: 12 }, (_, i) => i + 1);
    const entriesChain = mockChain({
      data: teamIds.map((id) => ({ id })),
      error: null,
    });
    const insertGroupsChain = mockChain({
      data: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      error: null,
    });
    const insertGroupTeamsChain = mockChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingGroupsChain)
      .mockReturnValueOnce(entriesChain)
      .mockReturnValueOnce(insertGroupsChain)
      .mockReturnValueOnce(insertGroupTeamsChain);

    await createTournamentGroups({ tournament_id: 1, group_count: 4 });

    const insertedGroupTeams: { group_id: number; tournament_team_id: number }[] =
      insertGroupTeamsChain.insert.mock.calls[0][0];

    const assignedTeamIds = insertedGroupTeams.map((gt) => gt.tournament_team_id).sort((a, b) => a - b);

    expect(assignedTeamIds).toEqual(teamIds);
  });

  it('returns an error when groups already exist for the tournament', async () => {
    const existingGroupsChain = mockChain({ data: [{ id: 1 }], error: null });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(existingGroupsChain);

    const result = await createTournamentGroups({ tournament_id: 1, group_count: 4 });

    expect(result.error).toBe('Groups have already been created for this tournament');
  });

  it('returns an error when no teams are registered', async () => {
    const existingGroupsChain = mockChain({ data: [], error: null });
    const entriesChain = mockChain({ data: [], error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingGroupsChain)
      .mockReturnValueOnce(entriesChain);

    const result = await createTournamentGroups({ tournament_id: 1, group_count: 4 });

    expect(result.error).toBe('No teams registered for this tournament');
  });

  it('returns an error when group count does not evenly divide team count', async () => {
    const existingGroupsChain = mockChain({ data: [], error: null });
    const entriesChain = mockChain({
      data: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
      error: null,
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingGroupsChain)
      .mockReturnValueOnce(entriesChain);

    const result = await createTournamentGroups({ tournament_id: 1, group_count: 3 });

    expect(result.error).toBe('Selected grouping does not evenly divide the number of teams');
  });

  it('returns an error when the resulting group size would be less than 3', async () => {
    const existingGroupsChain = mockChain({ data: [], error: null });
    const entriesChain = mockChain({
      data: Array.from({ length: 12 }, (_, i) => ({ id: i + 1 })),
      error: null,
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingGroupsChain)
      .mockReturnValueOnce(entriesChain);

    // 12 teams / 6 groups = 2 teams per group, which violates the minimum
    const result = await createTournamentGroups({ tournament_id: 1, group_count: 6 });

    expect(result.error).toBe('Each group must have at least 3 teams');
  });

  it('rolls back created groups if team assignment insert fails', async () => {
    const existingGroupsChain = mockChain({ data: [], error: null });
    const entriesChain = mockChain({
      data: Array.from({ length: 12 }, (_, i) => ({ id: i + 1 })),
      error: null,
    });
    const insertGroupsChain = mockChain({
      data: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
      error: null,
    });
    const insertGroupTeamsChain = mockChain({
      data: null,
      error: { message: 'insert failed' },
    });
    const rollbackChain = mockChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingGroupsChain)
      .mockReturnValueOnce(entriesChain)
      .mockReturnValueOnce(insertGroupsChain)
      .mockReturnValueOnce(insertGroupTeamsChain)
      .mockReturnValueOnce(rollbackChain);

    const result = await createTournamentGroups({ tournament_id: 1, group_count: 4 });

    expect(rollbackChain.delete).toHaveBeenCalled();
    expect(rollbackChain.in).toHaveBeenCalledWith('id', [1, 2, 3, 4]);
    expect(result.error).toBe('insert failed');
  });

  it('returns an error when group creation itself fails', async () => {
    const existingGroupsChain = mockChain({ data: [], error: null });
    const entriesChain = mockChain({
      data: Array.from({ length: 12 }, (_, i) => ({ id: i + 1 })),
      error: null,
    });
    const insertGroupsChain = mockChain({
      data: null,
      error: { message: 'failed to create groups' },
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingGroupsChain)
      .mockReturnValueOnce(entriesChain)
      .mockReturnValueOnce(insertGroupsChain);

    const result = await createTournamentGroups({ tournament_id: 1, group_count: 4 });

    expect(result.error).toBe('failed to create groups');
  });

  it('handles a single-group option (all teams in one group)', async () => {
    const existingGroupsChain = mockChain({ data: [], error: null });
    const entriesChain = mockChain({
      data: Array.from({ length: 5 }, (_, i) => ({ id: i + 1 })),
      error: null,
    });
    const insertGroupsChain = mockChain({ data: [{ id: 1 }], error: null });
    const insertGroupTeamsChain = mockChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(existingGroupsChain)
      .mockReturnValueOnce(entriesChain)
      .mockReturnValueOnce(insertGroupsChain)
      .mockReturnValueOnce(insertGroupTeamsChain);

    const result = await createTournamentGroups({ tournament_id: 1, group_count: 1 });

    expect(result.error).toBeNull();
    expect(insertGroupsChain.insert).toHaveBeenCalledWith([
      { name: 'Group 1', tournament_id: 1, status: 'active' },
    ]);

    const insertedGroupTeams = insertGroupTeamsChain.insert.mock.calls[0][0];
    expect(insertedGroupTeams).toHaveLength(5);
  });
});