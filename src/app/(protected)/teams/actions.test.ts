import { createTeam, updateTeam, deleteTeam, updateTeamStatus } from './actions';
import { supabaseAdmin } from '@/lib/supabase-admin';
import bcrypt from 'bcryptjs';

jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(() => 'hashed_password'),
}));

interface MockChain {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  then: (resolve: (value: { data: unknown; error?: unknown }) => void) => void;
}

function mockSupabaseChain(finalResult: { data: unknown; error?: unknown }): MockChain {
  const chain: MockChain = {
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

describe('createTeam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a login record and a team successfully', async () => {
    const loginChain = mockSupabaseChain({
      data: { id: 100, username: 'city_warriors' },
      error: null,
    });
    const teamChain = mockSupabaseChain({
      data: { id: 1, name: 'City Warriors', login_id: 100 },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(loginChain)
      .mockReturnValueOnce(teamChain);

    const result = await createTeam({
      name: 'City Warriors',
      sport_id: 1,
      username: 'city_warriors',
      password: 'password123',
      email: 'team@example.com',
      contact: 9999999999,
    });

    expect(bcrypt.hashSync).toHaveBeenCalledWith('password123', 10);
    expect(loginChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'city_warriors', role: 'team_manager' })
    );
    expect(result.error).toBeNull();
    expect(result.data?.name).toBe('City Warriors');
  });

  it('returns an error when login creation fails (duplicate username)', async () => {
    const loginChain = mockSupabaseChain({
      data: null,
      error: { message: 'duplicate key value violates unique constraint' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(loginChain);

    const result = await createTeam({
      name: 'City Warriors',
      sport_id: 1,
      username: 'city_warriors',
      password: 'password123',
      email: 'team@example.com',
      contact: 9999999999,
    });

    expect(result.error).toBe('duplicate key value violates unique constraint');
    expect(result.data).toBeNull();
  });

  it('rolls back login record if team creation fails', async () => {
    const loginChain = mockSupabaseChain({
      data: { id: 100, username: 'city_warriors' },
      error: null,
    });
    const teamChain = mockSupabaseChain({
      data: null,
      error: { message: 'duplicate team name' },
    });
    const rollbackChain = mockSupabaseChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(loginChain)
      .mockReturnValueOnce(teamChain)
      .mockReturnValueOnce(rollbackChain);

    const result = await createTeam({
      name: 'City Warriors',
      sport_id: 1,
      username: 'city_warriors',
      password: 'password123',
      email: 'team@example.com',
      contact: 9999999999,
    });

    expect(rollbackChain.delete).toHaveBeenCalled();
    expect(rollbackChain.eq).toHaveBeenCalledWith('id', 100);
    expect(result.error).toBe('duplicate team name');
  });
});

describe('updateTeam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates a team successfully', async () => {
    const updateChain = mockSupabaseChain({
      data: { id: 1, name: 'Updated Warriors', status: 'active' },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(updateChain);

    const result = await updateTeam({
      id: 1,
      name: 'Updated Warriors',
      sport_id: 1,
      email: 'team@example.com',
      contact: 9999999999,
      status: 'active',
    });

    expect(result.error).toBeNull();
    expect(result.data?.name).toBe('Updated Warriors');
  });

  it('returns an error when update fails', async () => {
    const updateChain = mockSupabaseChain({
      data: null,
      error: { message: 'Team not found' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(updateChain);

    const result = await updateTeam({
      id: 999,
      name: 'Team',
      sport_id: 1,
      email: 'team@example.com',
      contact: 9999999999,
      status: 'active',
    });

    expect(result.error).toBe('Team not found');
  });
});

describe('deleteTeam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes a team and its associated login record', async () => {
    const fetchChain = mockSupabaseChain({ data: { login_id: 100 }, error: null });
    const deleteTeamChain = mockSupabaseChain({ data: null, error: null });
    const deleteLoginChain = mockSupabaseChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(deleteTeamChain)
      .mockReturnValueOnce(deleteLoginChain);

    const result = await deleteTeam(1);

    expect(deleteTeamChain.delete).toHaveBeenCalled();
    expect(deleteLoginChain.delete).toHaveBeenCalled();
    expect(deleteLoginChain.eq).toHaveBeenCalledWith('id', 100);
    expect(result.error).toBeNull();
  });

  it('returns an error if team is not found', async () => {
    const fetchChain = mockSupabaseChain({ data: null, error: { message: 'Not found' } });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(fetchChain);

    const result = await deleteTeam(999);

    expect(result.error).toBe('Team not found');
  });

  it('returns an error if team delete fails', async () => {
    const fetchChain = mockSupabaseChain({ data: { login_id: 100 }, error: null });
    const deleteTeamChain = mockSupabaseChain({
      data: null,
      error: { message: 'permission denied' },
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(deleteTeamChain);

    const result = await deleteTeam(1);

    expect(result.error).toBe('permission denied');
  });

  it('returns an error if login delete fails', async () => {
    const fetchChain = mockSupabaseChain({ data: { login_id: 100 }, error: null });
    const deleteTeamChain = mockSupabaseChain({ data: null, error: null });
    const deleteLoginChain = mockSupabaseChain({
      data: null,
      error: { message: 'permission denied on login' },
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(deleteTeamChain)
      .mockReturnValueOnce(deleteLoginChain);

    const result = await deleteTeam(1);

    expect(result.error).toBe('permission denied on login');
  });
});

describe('updateTeamStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates both team and login status in sync', async () => {
    const fetchChain = mockSupabaseChain({ data: { login_id: 100 }, error: null });
    const updateTeamChain = mockSupabaseChain({
      data: { id: 1, status: 'inactive' },
      error: null,
    });
    const updateLoginChain = mockSupabaseChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(updateTeamChain)
      .mockReturnValueOnce(updateLoginChain);

    const result = await updateTeamStatus({ id: 1, status: 'inactive' });

    expect(updateLoginChain.update).toHaveBeenCalledWith({ status: 'inactive' });
    expect(result.data?.status).toBe('inactive');
  });

  it('returns an error if team is not found', async () => {
    const fetchChain = mockSupabaseChain({ data: null, error: { message: 'Not found' } });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(fetchChain);

    const result = await updateTeamStatus({ id: 999, status: 'inactive' });

    expect(result.error).toBe('Team not found');
  });
});