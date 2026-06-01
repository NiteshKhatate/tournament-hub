import { createAdminClient } from '@/lib/supabase-admin'

// GET a specific tournament
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', Number(id))
      .single()

    if (error || !data) {
      return Response.json({ error: 'Tournament not found' }, { status: 404 })
    }

    return Response.json({ tournament: data }, { status: 200 })
  } catch (error) {
    console.error('Tournament GET error:', error)
    return Response.json(
      { error: 'An error occurred while fetching tournament' },
      { status: 500 }
    )
  }
}

// PATCH - Update a tournament
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, sport, start_date, end_date, player_limit, player_criteria, organiser_id, status } = body

    const supabase = createAdminClient()

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (sport !== undefined) updateData.sport = sport
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (player_limit !== undefined) updateData.player_limit = Number(player_limit)
    if (player_criteria !== undefined) updateData.player_criteria = player_criteria
    if (organiser_id !== undefined) updateData.organiser_id = Number(organiser_id)
    if (status !== undefined) updateData.status = status

    const { data, error } = await supabase
      .from('tournaments')
      .update(updateData)
      .eq('id', Number(id))
      .select()
      .single()

    if (error || !data) {
      return Response.json({ error: 'Failed to update tournament' }, { status: 500 })
    }

    return Response.json({ tournament: data }, { status: 200 })
  } catch (error) {
    console.error('Tournament PATCH error:', error)
    return Response.json(
      { error: 'An error occurred while updating tournament' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a tournament
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const supabase = createAdminClient()

    // First, check if tournament exists
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', Number(id))
      .single()

    if (fetchError || !tournament) {
      return Response.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Delete the tournament
    const { error: deleteError } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', Number(id))

    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 })
    }

    return Response.json(
      { message: 'Tournament deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Tournament DELETE error:', error)
    return Response.json(
      { error: 'An error occurred while deleting tournament' },
      { status: 500 }
    )
  }
}
