import { loginUser } from './auth';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

describe('loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user data on successful login', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: { id: 1, username: 'admin', role: 'super_admin', status: 'active' },
      error: null,
    });

    const result = await loginUser('admin', 'correctpassword');

    expect(supabase.rpc).toHaveBeenCalledWith('verify_login', {
      p_username: 'admin',
      p_password: 'correctpassword',
    });
    expect(result.error).toBeNull();
    expect(result.data?.username).toBe('admin');
  });

  it('returns an error for incorrect password', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const result = await loginUser('admin', 'wrongpassword');

    expect(result.error).toBe('Invalid username or password');
    expect(result.data).toBeNull();
  });

  it('returns an error for a non-existent username', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const result = await loginUser('nonexistent', 'anypassword');

    expect(result.error).toBe('Invalid username or password');
  });

  it('returns an error when Supabase itself errors', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'connection timeout' },
    });

    const result = await loginUser('admin', 'correctpassword');

    expect(result.error).toBe('Invalid username or password');
  });

  it('does not leak whether the username exists via error message', async () => {
    // both a wrong password AND a nonexistent username should produce
    // the exact same generic error — this guards against a future change
    // accidentally revealing "username not found" vs "wrong password"
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: null, error: null });
    const wrongPasswordResult = await loginUser('admin', 'wrongpassword');

    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ data: null, error: null });
    const nonExistentUserResult = await loginUser('ghost', 'anypassword');

    expect(wrongPasswordResult.error).toBe(nonExistentUserResult.error);
  });

  it('calls verify_login with the exact username and password provided, unmodified', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({
      data: { id: 1, username: '  admin  ' },
      error: null,
    });

    await loginUser('  admin  ', 'password with spaces ');

    expect(supabase.rpc).toHaveBeenCalledWith('verify_login', {
      p_username: '  admin  ',
      p_password: 'password with spaces ',
    });
  });
});