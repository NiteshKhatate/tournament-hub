import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'
import DeleteButton from '@/components/DeleteButtton'

export default async function TournamentsPage() {
  let tournaments: any[] = []
  let error = null
  let errorMessage = ''
  let isOrganiser = false
  let organiserName = ''

  try {
    const supabase = createAdminClient()
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')

    // Check if user is authenticated and is an organiser
    if (authToken && authToken.value) {
      const user = JSON.parse(authToken.value)
      
      if (user.role === 'organiser') {
        isOrganiser = true
        
        // Get the organiser details for this user
        const { data: organiserData, error: organiserError } = await supabase
          .from('organisers')
          .select('id, name')
          .eq('login_id', user.id)
          .single()

        if (!organiserError && organiserData) {
          organiserName = organiserData.name
          
          // Fetch only tournaments for this organiser
          const { data, error: fetchError } = await supabase
            .from('tournaments')
            .select('*, organisers(name)')
            .eq('organiser_id', organiserData.id)
            .order('created', { ascending: false })

          if (fetchError) {
            errorMessage = fetchError.message
            throw fetchError
          }
          tournaments = data || []
        }
      } else {
        // Non-organiser users see all tournaments
        const { data, error: fetchError } = await supabase
          .from('tournaments')
          .select('*, organisers(name)')
          .order('created', { ascending: false })

        if (fetchError) {
          errorMessage = fetchError.message
          throw fetchError
        }
        tournaments = data || []
      }
    } else {
      // No user logged in, show all tournaments
      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select('*, organisers(name)')
        .order('created', { ascending: false })

      if (fetchError) {
        errorMessage = fetchError.message
        throw fetchError
      }
      tournaments = data || []
    }
  } catch (err: unknown) {
    error = err
    errorMessage =
      err instanceof Error ? err.message : 'Unknown error'
    console.error('Error fetching tournaments:', err)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-8 py-6">
          <h1 className="text-4xl font-bold text-slate-900">Tournaments</h1>
          <p className="text-slate-600 mt-1">
            {isOrganiser 
              ? `Tournaments organized by ${organiserName}` 
              : 'Manage all tournaments and events.'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {error ? (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            <p className="font-semibold">Error loading tournaments:</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        ) : <></>}

        {/* Action Button */}
        <div className="mb-6">
          <Link
            href="/tournaments/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            + Add New Tournament
          </Link>
        </div>

        {/* Tournaments Table */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          {tournaments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No tournaments found. Create your first tournament to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Sport</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Organiser</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Player Criteria</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Player Limit</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((tournament, index) => (
                    <tr
                      key={tournament.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                        index === tournaments.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{tournament.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{tournament.sport || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {tournament.organisers?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {tournament.player_criteria ? tournament.player_criteria.replace('_', ' ').toUpperCase() : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {tournament.player_limit || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            tournament.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : tournament.status === 'inactive'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {tournament.status || 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/tournaments/new?id=${tournament.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium mr-4"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          apiUrl={`/api/tournaments/${tournament.id}`}
                          entityName={tournament.name}
                          entityType="tournament"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
