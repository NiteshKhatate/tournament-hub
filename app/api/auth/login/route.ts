import { createAdminClient } from '@/lib/supabase-admin'
import { encryptPassword } from '@/lib/auth-utils'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return Response.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Get salt from environment variable
    const salt = process.env.ENCRYPTION_SALT
    if (!salt) {
      console.error('ENCRYPTION_SALT not configured in environment')
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Query the login table
    const supabase = createAdminClient()
    const { data: loginData, error: queryError } = await supabase
      .from('login')
      .select('*')
      .eq('username', username)
      .single()

    if (queryError || !loginData) {
      return Response.json(
        { error: 'Invalid login credentials' },
        { status: 401 }
      )
    }

    // Encrypt the incoming password with salt and compare
    const encryptedPassword = encryptPassword(password, salt)
    const isPasswordValid = encryptedPassword === loginData.password

    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid login credentials' },
        { status: 401 }
      )
    }

    // Create a session token/response
    // You can store session in a cookie or return a token
    const cookieStore = await cookies()
    cookieStore.set('auth_token', JSON.stringify({
      id: loginData.id,
      username: loginData.username,
      uuid: loginData.uuid,
      role: loginData.role,
      loginTime: new Date().toISOString(),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return Response.json(
      {
        success: true,
        user: {
          id: loginData.id,
          username: loginData.username,
          uuid: loginData.uuid,
          role: loginData.role,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
