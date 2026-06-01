import { createAdminClient } from '@/lib/supabase-admin'

type RouteContext = { params: Promise<{ id: string }> }

// GET a specific team
export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', Number(id))
      .single()

    if (error || !data) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    return Response.json({ team: data }, { status: 200 })
  } catch (error) {
    console.error('Team GET error:', error)
    return Response.json(
      { error: 'An error occurred while fetching team' },
      { status: 500 }
    )
  }
}

// PATCH - Update a team
export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, email, contact, tournament_id, status, disqualified_reason } = body

    const supabase = createAdminClient()

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (contact !== undefined) updateData.contact = Number(contact)
    if (tournament_id !== undefined) updateData.tournament_id = Number(tournament_id)
    if (status !== undefined) updateData.status = status
    if (disqualified_reason !== undefined) updateData.disqualified_reason = disqualified_reason

    const { data, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', Number(id))
      .select()
      .single()

    if (error || !data) {
      return Response.json({ error: 'Failed to update team' }, { status: 500 })
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
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // First, check if team exists
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', Number(id))
      .single()

    if (fetchError || !team) {
      return Response.json({ error: 'Team not found' }, { status: 404 })
    }

    // Delete the team
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', Number(id))

    if (deleteError) {
      return Response.json({ error: 'Failed to delete team' }, { status: 500 })
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
