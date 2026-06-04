import { createAdminClient } from '@/lib/supabase-admin'
import { encryptPassword } from '@/lib/auth-utils'

// GET all teams
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tournamentIds = searchParams.get('tournament_ids')

    const supabase = createAdminClient()

    let query = supabase
      .from('teams')
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
      { error: 'An error occurred while fetching teams' },
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
      email,
      contact,
      tournament_id,
      status,
      disqualified_reason,
      username,
      password,
    } = body

    if (!name || !email || !contact || !tournament_id || !username || !password) {
      return Response.json(
        {
          error:
            'Missing required fields: name, email, contact, tournament_id, username, password',
        },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const encryptionSalt = process.env.ENCRYPTION_SALT
    if (!encryptionSalt) {
      return Response.json(
        { error: 'Encryption salt not configured' },
        { status: 500 }
      )
    }

    const supabase = createAdminClient()
    const encryptedPassword = encryptPassword(password, encryptionSalt)

    const { data: loginData, error: loginError } = await supabase
      .from('login')
      .insert([
        {
          username,
          password: encryptedPassword,
          role: 'team_admin',
        },
      ])
      .select()

    if (loginError) {
      return Response.json(
        { error: `Failed to create login: ${loginError.message}` },
        { status: 400 }
      )
    }

    const loginId = loginData?.[0]?.id

    const { data, error } = await supabase
      .from('teams')
      .insert([
        {
          name,
          email,
          contact: Number(contact),
          tournament_id: Number(tournament_id),
          login_id: loginId,
          status: status || 'active',
          disqualified_reason: disqualified_reason || null,
        },
      ])
      .select()
      .single()

    if (error) {
      await supabase.from('login').delete().eq('id', loginId)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ team: data }, { status: 201 })
  } catch (error) {
    console.error('Team POST error:', error)
    return Response.json(
      { error: 'An error occurred while creating team' },
      { status: 500 }
    )
  }
}
