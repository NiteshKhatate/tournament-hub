import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')

    if (!authToken || !authToken.value) {
      return Response.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Token exists, user is authenticated
    return Response.json(
      { authenticated: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error checking auth:', error)
    return Response.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}
