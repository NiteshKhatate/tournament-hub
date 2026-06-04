import { createAdminClient } from '@/lib/supabase-admin'
import { encryptPassword } from '@/lib/auth-utils'

type RouteContext = { params: Promise<{ id: string }> }

// GET a specific team
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*, login:login_id(username)')
      .eq('id', Number(id))
      .single()

    if (error || !data) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    const login = data.login as { username: string } | { username: string }[] | null
    const username = Array.isArray(login) ? login[0]?.username : login?.username

    const { login: _login, ...team } = data

    return Response.json({
      team: {
        ...team,
        username: username ?? '',
      },
    })
  } catch (error) {
    console.error('Team GET error:', error)
    return Response.json(
      { error: 'An error occurred while fetching team' },
      { status: 500 }
    )
  }
}

// PATCH - Update a team
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      email,
      contact,
      tournament_id,
      status,
      disqualified_reason,
      username,
      password,
    } = body

    const supabase = createAdminClient()

    const { data: existing, error: fetchError } = await supabase
      .from('teams')
      .select('id, login_id')
      .eq('id', Number(id))
      .single()

    if (fetchError || !existing) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (contact !== undefined) updateData.contact = Number(contact)
    if (tournament_id !== undefined) updateData.tournament_id = Number(tournament_id)
    if (status !== undefined) updateData.status = status
    if (disqualified_reason !== undefined) {
      updateData.disqualified_reason = disqualified_reason
    }

    const { data, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', Number(id))
      .select()
      .single()

    if (error || !data) {
      return Response.json({ error: 'Failed to update team' }, { status: 500 })
    }

    if (username || password) {
      if (!username) {
        return Response.json(
          { error: 'Username is required when updating credentials' },
          { status: 400 }
        )
      }

      const loginUpdate: { username: string; password?: string } = { username }

      if (password) {
        const encryptionSalt = process.env.ENCRYPTION_SALT
        if (!encryptionSalt) {
          return Response.json(
            { error: 'Encryption salt not configured' },
            { status: 500 }
          )
        }
        loginUpdate.password = encryptPassword(password, encryptionSalt)
      }

      const { error: loginError } = await supabase
        .from('login')
        .update(loginUpdate)
        .eq('id', existing.login_id)

      if (loginError) {
        return Response.json(
          { error: `Failed to update login: ${loginError.message}` },
          { status: 400 }
        )
      }
    }

    return Response.json({ team: data }, { status: 200 })
  } catch (error) {
    console.error('Team PATCH error:', error)
    return Response.json(
      { error: 'An error occurred while updating team' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a team
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('id, login_id')
      .eq('id', Number(id))
      .single()

    if (fetchError || !team) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', Number(id))

    if (deleteError) {
      return Response.json({ error: 'Failed to delete team' }, { status: 500 })
    }

    if (team.login_id) {
      const { error: loginError } = await supabase
        .from('login')
        .delete()
        .eq('id', team.login_id)

      if (loginError) {
        return Response.json(
          { error: `Failed to delete login: ${loginError.message}` },
          { status: 400 }
        )
      }
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Team DELETE error:', error)
    return Response.json(
      { error: 'An error occurred while deleting team' },
      { status: 500 }
    )
  }
}
