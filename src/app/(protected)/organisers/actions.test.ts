import { createOrganiser, updateOrganiser, deleteOrganiser } from './actions';
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
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

// Helper to build a chainable Supabase query mock
function mockSupabaseChain(finalResult: { data: any; error: any }) {
  const chain: any = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    update: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    maybeSingle: jest.fn(() => Promise.resolve(finalResult)),
    single: jest.fn(() => Promise.resolve(finalResult)),
    then: (resolve: (value: any) => void) => resolve(finalResult),
  };
  return chain;
}

describe('createOrganiser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a login and organiser record when username is available', async () => {
    const loginChain = mockSupabaseChain({ data: null, error: null }); // username check: no existing login
    const loginInsertChain = mockSupabaseChain({
      data: { id: 1, username: 'testuser' },
      error: null,
    });
    const organiserInsertChain = mockSupabaseChain({
      data: { id: 10, name: 'Test Organiser' },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(loginChain) // username existence check
      .mockReturnValueOnce(loginInsertChain) // login insert
      .mockReturnValueOnce(organiserInsertChain); // organiser insert

    const result = await createOrganiser({
      name: 'Test Organiser',
      email: 'test@example.com',
      contact: '9876543210',
      username: 'testuser',
      password: 'password123',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ id: 10, name: 'Test Organiser' });
  });

  it('returns an error when the username already exists', async () => {
    const loginChain = mockSupabaseChain({
      data: { id: 5 }, // existing login found
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(loginChain);

    const result = await createOrganiser({
      name: 'Test Organiser',
      username: 'existinguser',
      password: 'password123',
    });

    expect(result.error).toBe('Username already exists');
    expect(result.data).toBeNull();
  });

  it('rolls back the login record if organiser insert fails', async () => {
    const loginCheckChain = mockSupabaseChain({ data: null, error: null });
    const loginInsertChain = mockSupabaseChain({
      data: { id: 1, username: 'testuser' },
      error: null,
    });
    const organiserInsertChain = mockSupabaseChain({
      data: null,
      error: { message: 'duplicate key value violates unique constraint' },
    });
    const loginDeleteChain = mockSupabaseChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(loginCheckChain)
      .mockReturnValueOnce(loginInsertChain)
      .mockReturnValueOnce(organiserInsertChain)
      .mockReturnValueOnce(loginDeleteChain);

    const result = await createOrganiser({
      name: 'Test Organiser',
      username: 'testuser',
      password: 'password123',
    });

    expect(result.error).toBe('duplicate key value violates unique constraint');
    expect(loginDeleteChain.delete).toHaveBeenCalled();
  });
});

describe('updateOrganiser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates organiser fields successfully', async () => {
    const updateChain = mockSupabaseChain({
      data: { id: 10, name: 'Updated Name', status: 'active' },
      error: null,
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(updateChain);

    const result = await updateOrganiser({
      id: 10,
      name: 'Updated Name',
      email: 'updated@example.com',
      contact: '9999999999',
      status: 'active',
    });

    expect(result.error).toBeNull();
    expect(result.data?.name).toBe('Updated Name');
  });

  it('returns an error when the update fails', async () => {
    const updateChain = mockSupabaseChain({
      data: null,
      error: { message: 'Update failed' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(updateChain);

    const result = await updateOrganiser({
      id: 10,
      name: 'Updated Name',
      status: 'active',
    });

    expect(result.error).toBe('Update failed');
    expect(result.data).toBeNull();
  });
});

describe('deleteOrganiser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the organiser and their linked login record', async () => {
    const fetchChain = mockSupabaseChain({
      data: { login_id: 5 },
      error: null,
    });
    const deleteOrganiserChain = mockSupabaseChain({ data: null, error: null });
    const deleteLoginChain = mockSupabaseChain({ data: null, error: null });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(deleteOrganiserChain)
      .mockReturnValueOnce(deleteLoginChain);

    const result = await deleteOrganiser(10);

    expect(result.error).toBeNull();
    expect(deleteOrganiserChain.delete).toHaveBeenCalled();
    expect(deleteLoginChain.delete).toHaveBeenCalled();
  });

  it('returns an error if the organiser fetch fails', async () => {
    const fetchChain = mockSupabaseChain({
      data: null,
      error: { message: 'Organiser not found' },
    });

    (supabaseAdmin.from as jest.Mock).mockReturnValueOnce(fetchChain);

    const result = await deleteOrganiser(999);

    expect(result.error).toBe('Organiser not found');
  });

  it('returns an error if the organiser delete fails', async () => {
    const fetchChain = mockSupabaseChain({ data: { login_id: 5 }, error: null });
    const deleteOrganiserChain = mockSupabaseChain({
      data: null,
      error: { message: 'Delete failed' },
    });

    (supabaseAdmin.from as jest.Mock)
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(deleteOrganiserChain);

    const result = await deleteOrganiser(10);

    expect(result.error).toBe('Delete failed');
  });
});