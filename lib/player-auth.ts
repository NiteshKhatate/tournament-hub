import { getAuthUser, getTeamByLoginId } from '@/lib/auth-session'
import { createAdminClient } from '@/lib/supabase-admin'

export async function getTeamAdminTeamId(): Promise<number | null> {
  const user = await getAuthUser()
  if (!user || user.role !== 'team_admin') return null

  const { data } = await getTeamByLoginId(user.id)
  return data?.id ?? null
}

export async function assertPlayerBelongsToTeamAdmin(
  playerId: number
): Promise<{ ok: true; teamId: number } | { ok: false; error: string; status: number }> {
  const teamId = await getTeamAdminTeamId()
  if (!teamId) {
    return { ok: false, error: 'Forbidden', status: 403 }
  }

  const supabase = createAdminClient()
  const { data: player, error } = await supabase
    .from('players')
    .select('team_id')
    .eq('id', playerId)
    .single()

  if (error || !player) {
    return { ok: false, error: 'Player not found', status: 404 }
  }

  if (player.team_id !== teamId) {
    return { ok: false, error: 'Forbidden', status: 403 }
  }

  return { ok: true, teamId }
}

export async function assertTeamIdAllowedForTeamAdmin(
  teamId: number
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const allowedTeamId = await getTeamAdminTeamId()
  if (!allowedTeamId) {
    return { ok: false, error: 'Forbidden', status: 403 }
  }

  if (teamId !== allowedTeamId) {
    return { ok: false, error: 'You can only manage players for your team', status: 403 }
  }

  return { ok: true }
}
