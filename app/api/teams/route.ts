import { createAdminClient } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

// GET all teams
export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created', { ascending: false })

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
    const { name, email, contact, tournament_id, status, disqualified_reason } = body

    // Validate required fields
    if (!name || !email || !contact || !tournament_id) {
      return Response.json(
        { error: 'Missing required fields: name, email, contact, tournament_id' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get login_id from auth token
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value

    if (!authToken) {
      return Response.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }

    let loginId: number
    try {
      const user = JSON.parse(authToken)
      loginId = user.id
    } catch {
      return Response.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

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
