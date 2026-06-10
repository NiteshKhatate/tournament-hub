import { createAdminClient } from '@/lib/supabase-admin'

type RouteContext = { params: Promise<{ id: string }> }

// GET a specific group
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', Number(id))
      .single()

    if (error || !data) {
      return Response.json({ error: 'Group not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Group GET error:', error)
    return Response.json(
      { error: 'An error occurred while fetching group' },
      { status: 500 }
    )
  }
}

// PATCH - Update a group
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      tournament_id,
    } = body

    const supabase = createAdminClient()

    const { data: existing, error: fetchError } = await supabase
      .from('groups')
      .select('id, tournament_id')
      .eq('id', Number(id))
      .single()

    if (fetchError || !existing) {
      return Response.json({ error: 'Group not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (tournament_id !== undefined) updateData.tournament_id = Number(tournament_id)

    const { data, error } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', Number(id))
      .select()
      .single()

    if (error || !data) {
      return Response.json({ error: 'Failed to update group' }, { status: 500 })
    }

    return Response.json({ group: data }, { status: 200 })
  } catch (error) {
    console.error('Group PATCH error:', error)
    return Response.json(
      { error: 'An error occurred while updating group' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a group
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = createAdminClient()

    // Delete group-team mappings first
    const { error: groupTeamsError } = await supabase
      .from('group_teams')
      .delete()
      .eq('group_id', id)

    if (groupTeamsError) {
      return Response.json(
        { error: groupTeamsError.message },
        { status: 500 }
      )
    }

    // Delete group
    const { error: groupError } = await supabase
      .from('groups')
      .delete()
      .eq('id', id)

    if (groupError) {
      return Response.json(
        { error: groupError.message },
        { status: 500 }
      )
    }

    return Response.json(
      {
        success: true,
        message: 'Group deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete group error:', error)

    return Response.json(
      {
        error: 'An error occurred while deleting the group',
      },
      { status: 500 }
    )
  }
}
