import { createAdminClient } from '@/lib/supabase-admin'
import { getAuthUser } from '@/lib/auth-session'
import {
  assertPlayerBelongsToTeamAdmin,
  assertTeamIdAllowedForTeamAdmin,
} from '@/lib/player-auth'

type RouteContext = { params: Promise<{ id: string }> }

// GET a specific player
export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', Number(id))
      .single()

    if (error || !data) {
      return Response.json({ error: 'Player not found' }, { status: 404 })
    }

    const user = await getAuthUser()
    if (user?.role === 'team_admin') {
      const access = await assertPlayerBelongsToTeamAdmin(Number(id))
      if (!access.ok) {
        return Response.json({ error: access.error }, { status: access.status })
      }
    }

    return Response.json({ player: data }, { status: 200 })
  } catch (error) {
    console.error('Player GET error:', error)
    return Response.json(
      { error: 'An error occurred while fetching player' },
      { status: 500 }
    )
  }
}

// PATCH - Update a player
export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, id_proof, id_type, weight, height, team_id, status } = body

    const user = await getAuthUser()
    if (user?.role === 'team_admin') {
      const access = await assertPlayerBelongsToTeamAdmin(Number(id))
      if (!access.ok) {
        return Response.json({ error: access.error }, { status: access.status })
      }
      if (team_id !== undefined) {
        const teamAccess = await assertTeamIdAllowedForTeamAdmin(Number(team_id))
        if (!teamAccess.ok) {
          return Response.json({ error: teamAccess.error }, { status: teamAccess.status })
        }
      }
    }

    const supabase = createAdminClient()

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (id_proof !== undefined) updateData.id_proof = id_proof
    if (id_type !== undefined) updateData.id_type = id_type
    if (weight !== undefined) updateData.weight = weight
    if (height !== undefined) updateData.height = height
    if (team_id !== undefined) updateData.team_id = Number(team_id)
    if (status !== undefined) updateData.status = status

    const { data, error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', Number(id))
      .select()
      .single()

    if (error || !data) {
      return Response.json({ error: 'Failed to update player' }, { status: 500 })
    }

    return Response.json({ player: data }, { status: 200 })
  } catch (error) {
    console.error('Player PATCH error:', error)
    return Response.json(
      { error: 'An error occurred while updating player' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a player
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // First, check if player exists
    const { data: player, error: fetchError } = await supabase
      .from('players')
      .select('*')
      .eq('id', Number(id))
      .single()

    if (fetchError || !player) {
      return Response.json({ error: 'Player not found' }, { status: 404 })
    }

    const user = await getAuthUser()
    if (user?.role === 'team_admin') {
      const access = await assertPlayerBelongsToTeamAdmin(Number(id))
      if (!access.ok) {
        return Response.json({ error: access.error }, { status: access.status })
      }
    }

    // Delete the player
    const { error: deleteError } = await supabase
      .from('players')
      .delete()
      .eq('id', Number(id))

    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 })
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Player DELETE error:', error)
    return Response.json(
      { error: 'An error occurred while deleting player' },
      { status: 500 }
    )
  }
}
