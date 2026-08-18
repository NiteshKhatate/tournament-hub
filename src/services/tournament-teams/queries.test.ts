import { getTeamTournamentEntry, getTeamApplications, getTeamApplicationsMap } from './queries';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

interface MockChain {
  select: jest.Mock;
  eq: jest.Mock;
  in: jest.Mock;
  order: jest.Mock;
  maybeSingle: jest.Mock;
}

function mockChain(finalResult: { data: unknown; error?: unknown }): MockChain {
  const chain: MockChain = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    in: jest.fn(() => Promise.resolve(finalResult)),
    order: jest.fn(() => Promise.resolve(finalResult)),
    maybeSingle: jest.fn(() => Promise.resolve(finalResult)),
  };
  return chain;
}

describe('getTeamTournamentEntry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the entry if team is registered', async () => {
    const chain = mockChain({ data: { id: 1, status: 'active' }, error: null });

    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getTeamTournamentEntry(1, 5);

    expect(result.data?.status).toBe('active');
  });

  it('returns null if team has not applied', async () => {
    const chain = mockChain({ data: null, error: null });

    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getTeamTournamentEntry(1, 5);

    expect(result.data).toBeNull();
  });
});

describe('getTeamApplications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns applications enriched with tournament details', async () => {
    const applicationsChain = mockChain({
      data: [{ id: 1, status: 'active', tournament_id: 5 }],
      error: null,
    });
    const tournamentsChain = mockChain({
      data: [{ id: 5, name: 'City Championship', start_date: null, end_date: null, venue: 'Ground A' }],
      error: null,
    });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(applicationsChain)
      .mockReturnValueOnce(tournamentsChain);

    const result = await getTeamApplications(1);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].tournaments?.[0].name).toBe('City Championship');
  });

  it('returns empty array when team has no applications', async () => {
    const applicationsChain = mockChain({ data: [], error: null });

    (supabase.from as jest.Mock).mockReturnValueOnce(applicationsChain);

    const result = await getTeamApplications(1);

    expect(result.data).toEqual([]);
  });

  it('sets tournaments to null if tournament lookup fails to match', async () => {
    const applicationsChain = mockChain({
      data: [{ id: 1, status: 'active', tournament_id: 5 }],
      error: null,
    });
    const tournamentsChain = mockChain({ data: [], error: null });

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(applicationsChain)
      .mockReturnValueOnce(tournamentsChain);

    const result = await getTeamApplications(1);

    expect(result.data[0].tournaments).toBeNull();
  });
});

describe('getTeamApplicationsMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a map of team ids with applications', async () => {
    const chain = mockChain({ data: [{ team_id: 1 }, { team_id: 2 }], error: null });

    (supabase.from as jest.Mock).mockReturnValueOnce(chain);

    const result = await getTeamApplicationsMap([1, 2, 3]);

    expect(result.get(1)).toBe(true);
    expect(result.get(2)).toBe(true);
    expect(result.get(3)).toBeUndefined();
  });

  it('returns an empty map when no team ids are passed', async () => {
    const result = await getTeamApplicationsMap([]);

    expect(result.size).toBe(0);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});