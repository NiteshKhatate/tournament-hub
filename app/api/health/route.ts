import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { message: 'API is healthy', timestamp: new Date().toISOString() },
    { status: 200 }
  )
}
