import { createAdminClient } from '@/lib/supabase-admin'
import { encryptPassword } from '@/lib/auth-utils'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

function getSupabaseOrError() {
  try {
    return { supabase: createAdminClient(), error: null as null }
  } catch {
    return {
      supabase: null,
      error: NextResponse.json(
        {
          error:
            'Server database configuration is incomplete. Add SUPABASE_SECRET_KEY (sb_secret_...) or SUPABASE_SERVICE_ROLE_KEY to .env.local from Supabase Dashboard → Settings → API Keys.',
        },
        { status: 500 }
      ),
    }
  }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const { supabase, error: configError } = getSupabaseOrError()
    if (configError) return configError

    const { data, error } = await supabase!
      .from('organisers')
      .select('id, name, email, contact, status, login_id, login:login_id(username)')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Organiser not found' },
        { status: error.code === 'PGRST116' ? 404 : 400 }
      )
    }

    const login = data.login as { username: string } | { username: string }[] | null
    const username = Array.isArray(login) ? login[0]?.username : login?.username

    return NextResponse.json({
      organiser: {
        id: data.id,
        name: data.name,
        email: data.email,
        contact: data.contact,
        status: data.status,
        login_id: data.login_id,
        username: username ?? '',
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching organiser:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { name, email, password, username, contact } = body

    if (!name || !email || !username || contact === undefined || contact === null) {
      return NextResponse.json(
        { error: 'Name, email, username, and contact are required' },
        { status: 400 }
      )
    }

    const { supabase, error: configError } = getSupabaseOrError()
    if (configError) return configError

    const { data: existing, error: fetchError } = await supabase!
      .from('organisers')
      .select('id, login_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Organiser not found' },
        { status: 404 }
      )
    }

    const { data: organiserData, error: organiserError } = await supabase!
      .from('organisers')
      .update({
        name,
        email,
        contact: Number(contact),
      })
      .eq('id', id)
      .select()
      .single()

    if (organiserError) {
      return NextResponse.json(
        { error: `Failed to update organiser: ${organiserError.message}` },
        { status: 400 }
      )
    }

    const loginUpdate: { username: string; password?: string } = { username }

    if (password) {
      const encryptionSalt = process.env.ENCRYPTION_SALT
      if (!encryptionSalt) {
        return NextResponse.json(
          { error: 'Encryption salt not configured' },
          { status: 500 }
        )
      }
      loginUpdate.password = encryptPassword(password, encryptionSalt)
    }

    const { error: loginError } = await supabase!
      .from('login')
      .update(loginUpdate)
      .eq('id', existing.login_id)

    if (loginError) {
      return NextResponse.json(
        { error: `Failed to update login: ${loginError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Organiser updated successfully',
      organiser: organiserData,
    })
  } catch (error: unknown) {
    console.error('Error updating organiser:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const { supabase, error: configError } = getSupabaseOrError()
    if (configError) return configError

    const { data: existing, error: fetchError } = await supabase!
      .from('organisers')
      .select('id, login_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Organiser not found' },
        { status: 404 }
      )
    }

    const { error: organiserError } = await supabase!
      .from('organisers')
      .delete()
      .eq('id', id)

    if (organiserError) {
      return NextResponse.json(
        { error: `Failed to delete organiser: ${organiserError.message}` },
        { status: 400 }
      )
    }

    if (existing.login_id) {
      const { error: loginError } = await supabase!
        .from('login')
        .delete()
        .eq('id', existing.login_id)

      if (loginError) {
        return NextResponse.json(
          { error: `Failed to delete login: ${loginError.message}` },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({ message: 'Organiser deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting organiser:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
