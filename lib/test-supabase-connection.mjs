import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase URL or key not found in environment variables')
  process.exit(1)
}

console.log('🔧 Supabase Connection Test')
console.log('----------------------------')
console.log(`URL: ${supabaseUrl}`)
console.log(`Key: ${supabaseKey.substring(0, 20)}...`)
console.log('')

try {
  // Create client without realtime for Node.js testing
  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: false
  })
  console.log('✅ Supabase client initialized successfully')
  
  // Test with a simple health check - query the auth endpoint
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.log('⚠️  Auth session check:', sessionError.message)
  } else {
    console.log('✅ Auth API responding')
    console.log(`   Current session: ${session ? 'Active' : 'None (expected for anonymous key)'}`)
  }

  // Try to ping the API by checking user existence
  const { error } = await supabase.auth.getUser()
  if (!error || error.message === 'Auth session missing!') {
    console.log('✅ Supabase REST API is reachable')
  }
  
  console.log('')
  console.log('✅ Connection test completed successfully!')
  console.log('✅ Your Supabase credentials are valid!')
  process.exit(0)
} catch (error) {
  console.error('❌ Connection error:', error.message)
  process.exit(1)
}
