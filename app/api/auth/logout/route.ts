import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    
    // Clear the auth token cookie
    cookieStore.delete('auth_token')

    return Response.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return Response.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
