import { createAdminClient } from '@/lib/supabase-admin'

// GET all players or GET a specific player
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const teamId = searchParams.get('team_id')

    const supabase = createAdminClient()

    if (id) {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', Number(id))
        .single()

      if (error || !data) {
        return Response.json({ error: 'Player not found' }, { status: 404 })
      }

      return Response.json({ player: data }, { status: 200 })
    }

    // If team_id is provided, filter by team_id
    if (teamId) {
      const { data, error } = await supabase
        .from('players')
        .select('*, teams(name, tournaments(name))')
        .eq('team_id', Number(teamId))
        .order('created', { ascending: false })

      if (error) {
        return Response.json({ error: error.message }, { status: 500 })
      }

      return Response.json({ players: data }, { status: 200 })
    }

    const { data, error } = await supabase
      .from('players')
      .select('*, teams(name, tournaments(name))')
      .order('created', { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ players: data }, { status: 200 })
  } catch (error) {
    console.error('Player GET error:', error)
    return Response.json(
      { error: 'An error occurred while fetching players' },
      { status: 500 }
    )
  }
}

// POST - Create a new player
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, id_proof, id_type, weight, height, team_id, status } = body

    // Validate required fields
    if (!name || !team_id) {
      return Response.json(
        { error: 'Missing required fields: name, team_id' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('players')
      .insert([
        {
          name,
          id_proof: id_proof || null,
          id_type: id_type || null,
          weight: weight || null,
          height: height || null,
          team_id: Number(team_id),
          status: status || 'active',
        },
      ])
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ player: data }, { status: 201 })
  } catch (error) {
    console.error('Player POST error:', error)
    return Response.json(
      { error: 'An error occurred while creating the player' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a player
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json(
        { error: 'Missing player ID' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', Number(id))

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Player DELETE error:', error)
    return Response.json(
      { error: 'An error occurred while deleting the player' },
      { status: 500 }
    )
  }
}
