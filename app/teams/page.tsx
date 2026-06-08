import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'
import DeleteButton from '@/components/DeleteButtton'

export default async function TeamsPage() {
  let teams: any[] = []
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

          // Get tournaments for this organiser
          const { data: tournamentsData, error: tournamentsError } = await supabase
            .from('tournaments')
            .select('id')
            .eq('organiser_id', organiserData.id)

          if (!tournamentsError && tournamentsData) {
            const tournamentIds = tournamentsData.map((t) => t.id)
            
            // Fetch teams for these tournaments
            const { data, error: fetchError } = await supabase
              .from('teams')
              .select('*, tournaments(name)')
              .in('tournament_id', tournamentIds)
              .order('created', { ascending: false })

            if (fetchError) {
              errorMessage = fetchError.message
              throw fetchError
            }
            teams = data || []
          }
        }
      } else {
        // Non-organiser users see all teams
        const { data, error: fetchError } = await supabase
          .from('teams')
          .select('*, tournaments(name)')
          .order('created', { ascending: false })

        if (fetchError) {
          errorMessage = fetchError.message
          throw fetchError
        }
        teams = data || []
      }
    } else {
      // No user logged in, show all teams
      const { data, error: fetchError } = await supabase
        .from('teams')
        .select('*, tournaments(name)')
        .order('created', { ascending: false })

      if (fetchError) {
        errorMessage = fetchError.message
        throw fetchError
      }
      teams = data || []
    }
  } catch (err: unknown) {
    error = err
    errorMessage =
      err instanceof Error ? err.message : 'Unknown error'
    console.error('Error fetching teams:', err)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-8 py-6">
          <h1 className="text-4xl font-bold text-slate-900">Teams</h1>
          <p className="text-slate-600 mt-1">
            {isOrganiser 
              ? `Teams from tournaments organized by ${organiserName}` 
              : 'Manage all teams participating in tournaments.'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {error ? (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            <p className="font-semibold">Error loading teams:</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        ) : <></>}

        {/* Action Button */}
        <div className="mb-6">
          <Link
            href="/teams/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            + Add New Team
          </Link>
        </div>

        {/* Teams Table */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          {teams.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No teams found. Create your first team to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Team Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tournament</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr
                      key={team.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                        index === teams.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{team.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{team.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {team.contact || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {team.tournaments?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            team.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : team.status === 'inactive'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {team.status || 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {team.created ? new Date(team.created).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/teams/new?id=${team.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium mr-4"
                        >
                          Edit
                        </Link>
                        <DeleteButton
                          apiUrl={`/api/teams/${team.id}`}
                          entityName={team.name}
                          entityType="team"
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
