import {
  createTournament,
  updateTournament,
  deleteTournament,
  createTournamentCriteria,
  updateTournamentCriteria,
  deleteTournamentCriteria,
} from './mutations';
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
  update: jest.Mock;
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
    update: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(finalResult)),
    then: (resolve) => resolve(finalResult),
  };
  return chain;
}

describe('createTournament', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a tournament successfully', async () => {
    const insertChain = mockSupabaseChain({
      data: { id: 1, name: 'City Championship', entry_fee: 5000 },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(insertChain);

    const result = await createTournament({
      name: 'City Championship',
      organiser_id: 1,
      sport_id: 1,
      entry_fee: 5000,
    });

    expect(result.error).toBeNull();
    expect(result.data?.name).toBe('City Championship');
  });

  it('returns an error when required fields are missing', async () => {
    const insertChain = mockSupabaseChain({
      data: null,
      error: { message: 'null value in column "name" violates not-null constraint' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(insertChain);

    const result = await createTournament({
      name: '',
      organiser_id: 1,
      sport_id: 1,
      entry_fee: 5000,
    });

    expect(result.error).toBeTruthy();
    expect(result.data).toBeNull();
  });

  it('accepts optional fields', async () => {
    const insertChain = mockSupabaseChain({
      data: {
        id: 1,
        name: 'City Championship',
        start_date: '2025-01-01',
        end_date: '2025-01-10',
        venue: 'Central Ground',
      },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(insertChain);

    const result = await createTournament({
      name: 'City Championship',
      organiser_id: 1,
      sport_id: 1,
      entry_fee: 5000,
      start_date: '2025-01-01',
      end_date: '2025-01-10',
      venue: 'Central Ground',
    });

    expect(result.error).toBeNull();
  });
});

describe('updateTournament', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates a tournament successfully', async () => {
    const updateChain = mockSupabaseChain({
      data: { id: 1, name: 'Updated Championship', status: 'active' },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(updateChain);

    const result = await updateTournament({
      id: 1,
      name: 'Updated Championship',
      organiser_id: 1,
      sport_id: 1,
      entry_fee: 5000,
      status: 'active',
    });

    expect(result.error).toBeNull();
    expect(result.data?.name).toBe('Updated Championship');
  });

  it('can change status to inactive', async () => {
    const updateChain = mockSupabaseChain({
      data: { id: 1, name: 'Tournament', status: 'inactive' },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(updateChain);

    const result = await updateTournament({
      id: 1,
      name: 'Tournament',
      organiser_id: 1,
      sport_id: 1,
      entry_fee: 5000,
      status: 'inactive',
    });

    expect(result.data?.status).toBe('inactive');
  });

  it('returns an error when update fails', async () => {
    const updateChain = mockSupabaseChain({
      data: null,
      error: { message: 'Tournament not found' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(updateChain);

    const result = await updateTournament({
      id: 999,
      name: 'Tournament',
      organiser_id: 1,
      sport_id: 1,
      entry_fee: 5000,
      status: 'active',
    });

    expect(result.error).toBe('Tournament not found');
  });
});

describe('deleteTournament', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes a tournament successfully', async () => {
    const deleteChain = mockSupabaseChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(deleteChain);

    const result = await deleteTournament(1);

    expect(deleteChain.delete).toHaveBeenCalled();
    expect(deleteChain.eq).toHaveBeenCalledWith('id', 1);
    expect(result.error).toBeNull();
  });

  it('returns an error when delete fails', async () => {
    const deleteChain = mockSupabaseChain({
      data: null,
      error: { message: 'permission denied' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(deleteChain);

    const result = await deleteTournament(1);

    expect(result.error).toBe('permission denied');
  });
});

describe('createTournamentCriteria', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates criteria successfully with required fields', async () => {
    const insertChain = mockSupabaseChain({
      data: {
        id: 1,
        tournament_id: 1,
        type: 'age',
        operator: 'min',
        value_min: 18,
        max_players_count: 50,
        min_players_count: 10,
      },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(insertChain);

    const result = await createTournamentCriteria({
      tournament_id: 1,
      type: 'age',
      operator: 'min',
      value_min: 18,
      max_players_count: 50,
      min_players_count: 10,
    });

    expect(result.error).toBeNull();
    expect(result.data?.type).toBe('age');
  });

  it('creates criteria with optional fields', async () => {
    const insertChain = mockSupabaseChain({
      data: {
        id: 1,
        tournament_id: 1,
        gender: 'male',
        type: 'weight',
        operator: 'between',
        value_min: 60,
        value_max: 80,
        unit: 'kg',
        max_players_count: 30,
        min_players_count: 5,
      },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(insertChain);

    const result = await createTournamentCriteria({
      tournament_id: 1,
      gender: 'male',
      type: 'weight',
      operator: 'between',
      value_min: 60,
      value_max: 80,
      unit: 'kg',
      max_players_count: 30,
      min_players_count: 5,
    });

    expect(result.error).toBeNull();
  });

  it('validates operator and type enum values', async () => {
    const insertChain = mockSupabaseChain({
      data: {
        id: 1,
        type: 'height',
        operator: 'exact',
        value_min: 180,
        max_players_count: 20,
        min_players_count: 1,
      },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(insertChain);

    const result = await createTournamentCriteria({
      tournament_id: 1,
      type: 'height',
      operator: 'exact',
      value_min: 180,
      max_players_count: 20,
      min_players_count: 1,
    });

    expect(result.error).toBeNull();
  });
});

describe('updateTournamentCriteria', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates criteria successfully', async () => {
    const updateChain = mockSupabaseChain({
      data: {
        id: 1,
        type: 'age',
        operator: 'max',
        value_min: 16,
        status: 'active',
      },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(updateChain);

    const result = await updateTournamentCriteria({
      id: 1,
      type: 'age',
      operator: 'max',
      value_min: 16,
      max_players_count: 50,
      min_players_count: 10,
      status: 'active',
    });

    expect(result.error).toBeNull();
  });

  it('can change criteria status to inactive', async () => {
    const updateChain = mockSupabaseChain({
      data: { id: 1, status: 'inactive' },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(updateChain);

    const result = await updateTournamentCriteria({
      id: 1,
      type: 'age',
      operator: 'min',
      value_min: 18,
      max_players_count: 50,
      min_players_count: 10,
      status: 'inactive',
    });

    expect(result.data?.status).toBe('inactive');
  });

  it('returns an error when criteria update fails', async () => {
    const updateChain = mockSupabaseChain({
      data: null,
      error: { message: 'Criteria not found' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(updateChain);

    const result = await updateTournamentCriteria({
      id: 999,
      type: 'age',
      operator: 'min',
      value_min: 18,
      max_players_count: 50,
      min_players_count: 10,
      status: 'active',
    });

    expect(result.error).toBe('Criteria not found');
  });
});

describe('deleteTournamentCriteria', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes criteria successfully', async () => {
    const deleteChain = mockSupabaseChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(deleteChain);

    const result = await deleteTournamentCriteria(1);

    expect(deleteChain.delete).toHaveBeenCalled();
    expect(deleteChain.eq).toHaveBeenCalledWith('id', 1);
    expect(result.error).toBeNull();
  });

  it('returns an error when delete fails', async () => {
    const deleteChain = mockSupabaseChain({
      data: null,
      error: { message: 'permission denied' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(deleteChain);

    const result = await deleteTournamentCriteria(1);

    expect(result.error).toBe('permission denied');
  });
});