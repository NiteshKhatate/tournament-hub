import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')

    if (!authToken || !authToken.value) {
      return Response.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = JSON.parse(authToken.value)

    // Check if user is an organiser
    if (user.role !== 'organiser') {
      return Response.json(
        { error: 'User is not an organiser' },
        { status: 403 }
      )
    }

    // Get the organiser record linked to this user's login_id
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('organisers')
      .select('id, name')
      .eq('login_id', user.id)
      .single()

    if (error || !data) {
      return Response.json(
        { error: 'Organiser record not found' },
        { status: 404 }
      )
    }

    return Response.json(
      { 
        success: true,
        organiser: {
          id: data.id,
          name: data.name,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error getting organiser details:', error)
    return Response.json(
      { error: 'Failed to get organiser info' },
      { status: 500 }
    )
  }
}
