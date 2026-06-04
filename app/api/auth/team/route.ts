import { getAuthUser, getTeamByLoginId } from '@/lib/auth-session'

export async function GET() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (user.role !== 'team_admin') {
      return Response.json({ error: 'User is not a team admin' }, { status: 403 })
    }

    const { data, error } = await getTeamByLoginId(user.id)

    if (error || !data) {
      return Response.json({ error: 'Team record not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      team: {
        id: data.id,
        name: data.name,
      },
    })
  } catch (error) {
    console.error('Error getting team details:', error)
    return Response.json({ error: 'Failed to get team info' }, { status: 500 })
  }
}
