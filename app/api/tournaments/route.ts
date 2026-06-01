import { createAdminClient } from '@/lib/supabase-admin'

// GET all tournaments or GET a specific tournament
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const supabase = createAdminClient()

    if (id) {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', Number(id))
        .single()

      if (error || !data) {
        return Response.json({ error: 'Tournament not found' }, { status: 404 })
      }

      return Response.json({ tournament: data }, { status: 200 })
    }

    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created', { ascending: false })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ tournaments: data }, { status: 200 })
  } catch (error) {
    console.error('Tournament GET error:', error)
    return Response.json(
      { error: 'An error occurred while fetching tournaments' },
      { status: 500 }
    )
  }
}

// POST - Create a new tournament
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, sport, start_date, end_date, player_criteria, player_limit, organiser_id, status } = body

    // Validate required fields
    if (!name || !sport || !start_date || !end_date || !player_criteria || !player_limit || !organiser_id) {
      return Response.json(
        { error: 'Missing required fields: name, sport, start_date, end_date, player_criteria, player_limit, organiser_id' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('tournaments')
      .insert([
        {
          name,
          sport,
          start_date,
          end_date,
          player_criteria,
          player_limit: Number(player_limit),
          organiser_id: Number(organiser_id),
          status: status || 'active',
        },
      ])
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ tournament: data }, { status: 201 })
  } catch (error) {
    console.error('Tournament POST error:', error)
    return Response.json(
      { error: 'An error occurred while creating tournament' },
      { status: 500 }
    )
  }
}
