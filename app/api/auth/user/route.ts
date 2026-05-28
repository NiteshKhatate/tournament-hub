import { cookies } from 'next/headers'

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

    return Response.json(
      { 
        success: true,
        user: {
          id: user.id,
          username: user.username,
          uuid: user.uuid,
          role: user.role,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error getting user:', error)
    return Response.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    )
  }
}
