import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-admin'

export type AuthUser = {
  id: number
  username: string
  role: string
  uuid?: string
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value
  if (!authToken) return null

  try {
    return JSON.parse(authToken) as AuthUser
  } catch {
    return null
  }
}

export async function getTeamByLoginId(loginId: number) {
  const supabase = createAdminClient()
  return supabase
    .from('teams')
    .select('id, name')
    .eq('login_id', loginId)
    .single()
}
