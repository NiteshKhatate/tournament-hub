import { createAdminClient } from '@/lib/supabase-admin'
import { encryptPassword } from '@/lib/auth-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('organisers')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { organisers: data },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error fetching organisers:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, username, contact } = body

    if (!name || !email || !password || !username || !contact) {
      return NextResponse.json(
        { error: 'Name, email, username, contact, and password are required' },
        { status: 400 }
      )
    }

    let supabase
    try {
      supabase = createAdminClient()
    } catch {
      return NextResponse.json(
        {
          error:
            'Server database configuration is incomplete. Add SUPABASE_SECRET_KEY (sb_secret_...) or SUPABASE_SERVICE_ROLE_KEY to .env.local from Supabase Dashboard → Settings → API Keys.',
        },
        { status: 500 }
      )
    }
    const encryptionSalt = process.env.ENCRYPTION_SALT

    if (!encryptionSalt) {
      return NextResponse.json(
        { error: 'Encryption salt not configured' },
        { status: 500 }
      )
    }

    // Encrypt password
    const encryptedPassword = encryptPassword(password, encryptionSalt)

    // Create login record first (login.username is required)
    const { data: loginData, error: loginError } = await supabase
      .from('login')
      .insert([
        {
          username,
          password: encryptedPassword,
          role: 'organiser',
        },
      ])
      .select()

    if (loginError) {
      return NextResponse.json(
        { error: `Failed to create login: ${loginError.message}` },
        { status: 400 }
      )
    }

    const loginId = loginData?.[0]?.id

    // Create organiser record (include contact)
    const { data: organiserData, error: organiserError } = await supabase
      .from('organisers')
      .insert([
        {
          name,
          email,
          contact: Number(contact),
          login_id: loginId,
          status: 'active',
        },
      ])
      .select()

    if (organiserError) {
      // Rollback login record if organiser creation fails
      await supabase.from('login').delete().eq('id', loginId)
      return NextResponse.json(
        { error: `Failed to create organiser: ${organiserError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message: 'Organiser created successfully',
        organiser: organiserData?.[0],
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating organiser:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
