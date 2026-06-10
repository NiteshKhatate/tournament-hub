import { createAdminClient } from '@/lib/supabase-admin'

// GET all teams
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tournamentIds = searchParams.get('tournament_ids')

    const supabase = createAdminClient()

    let query = supabase
      .from('groups')
      .select('*')
      .order('created', { ascending: false })

    // If tournament_ids is provided, filter by multiple tournament IDs
    if (tournamentIds) {
      const ids = tournamentIds.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id))
      if (ids.length > 0) {
        query = query.in('tournament_id', ids)
      }
    }

    const { data, error } = await query

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ teams: data }, { status: 200 })
  } catch (error) {
    console.error('Teams GET error:', error)
    return Response.json(
      { error: 'An error occurred while fetching groups' },
      { status: 500 }
    )
  }
}

// POST - Create a new team
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      tournament_id,
    } = body

    if (!name || !tournament_id) {
      return Response.json(
        {
          error:
            'Missing required fields: name, tournament_id',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('groups')
      .insert([
        {
          name,
          tournament_id: Number(tournament_id),
        },
      ])
      .select()
      .single()

    return Response.json({ group: data }, { status: 201 })
  } catch (error) {
    console.error('Group POST error:', error)
    return Response.json(
      { error: 'An error occurred while creating team' },
      { status: 500 }
    )
  }
}
