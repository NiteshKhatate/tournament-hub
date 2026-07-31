import { supabase } from '@/lib/supabase';

export async function loginUser(username: string, password: string) {
  const { data, error } = await supabase
    .rpc('verify_login', { p_username: username, p_password: password });

  if (error || !data) {
    return { data: null, error: 'Invalid username or password' };
  }

  return { data, error: null };
}