import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Supabase credentials not configured',
          details: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
        },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test auth connection
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // If no error, connection is successful
    const isConnected = !sessionError
    const message = isConnected 
      ? '✅ Successfully connected to Supabase!' 
      : '❌ Connection failed'

    return NextResponse.json(
      {
        success: isConnected,
        message,
        connection: {
          url: supabaseUrl,
          authKey: supabaseKey.substring(0, 20) + '...',
          status: isConnected ? 'connected' : 'disconnected',
          authCheck: {
            status: sessionError ? 'failed' : 'ok',
            error: sessionError?.message,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: isConnected ? 200 : 500 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Connection test failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
