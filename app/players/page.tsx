import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-admin'
import { getAuthUser, getTeamByLoginId } from '@/lib/auth-session'
import DeletePlayerButton from './DeletePlayerButton'

export default async function PlayersPage() {
  let players: any[] = []
  let error = null
  let errorMessage = ''
  let isOrganiser = false
  let organiserName = ''
  let isTeamAdmin = false
  let teamName = ''

  try {
    const supabase = createAdminClient()
    const user = await getAuthUser()

    if (user) {
      if (user.role === 'team_admin') {
        isTeamAdmin = true

        const { data: teamData, error: teamError } = await getTeamByLoginId(user.id)

        if (!teamError && teamData) {
          teamName = teamData.name

          const { data, error: fetchError } = await supabase
            .from('players')
            .select('*, teams(name, tournaments(name))')
            .eq('team_id', teamData.id)
            .order('created', { ascending: false })

          if (fetchError) {
            errorMessage = fetchError.message
            throw fetchError
          }
          players = data || []
        }
      } else if (user.role === 'organiser') {
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
            
            // Get teams for these tournaments
            const { data: teamsData, error: teamsError } = await supabase
              .from('teams')
              .select('id')
              .in('tournament_id', tournamentIds)

            if (!teamsError && teamsData) {
              const teamIds = teamsData.map((t) => t.id)
              
              // Fetch players for these teams
              const { data, error: fetchError } = await supabase
                .from('players')
                .select('*, teams(name, tournaments(name))')
                .in('team_id', teamIds)
                .order('created', { ascending: false })

              if (fetchError) {
                errorMessage = fetchError.message
                throw fetchError
              }
              players = data || []
            }
          }
        }
      } else {
        // Non-organiser users see all players
        const { data, error: fetchError } = await supabase
          .from('players')
          .select('*, teams(name, tournaments(name))')
          .order('created', { ascending: false })

        if (fetchError) {
          errorMessage = fetchError.message
          throw fetchError
        }
        players = data || []
      }
    } else {
      // No user logged in, show all players
      const { data, error: fetchError } = await supabase
        .from('players')
        .select('*, teams(name, tournaments(name))')
        .order('created', { ascending: false })

      if (fetchError) {
        errorMessage = fetchError.message
        throw fetchError
      }
      players = data || []
    }
  } catch (err: unknown) {
    error = err
    errorMessage =
      err instanceof Error ? err.message : 'Unknown error'
    console.error('Error fetching players:', err)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-8 py-6">
          <h1 className="text-4xl font-bold text-slate-900">Players</h1>
          <p className="text-slate-600 mt-1">
            {isTeamAdmin
              ? `Players for team ${teamName}`
              : isOrganiser
                ? `Players from teams affiliated with tournaments organized by ${organiserName}`
                : 'Manage all players across tournaments.'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            <p className="font-semibold">Error loading players:</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="mb-6">
          <Link
            href="/players/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            + Add New Player
          </Link>
        </div>

        {/* Players Table */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          {players.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No players found. Create your first player to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Team</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tournament</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">ID Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Height (cm)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Weight (kg)</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr
                      key={player.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                        index === players.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{player.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {player.teams?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {player.teams?.tournaments?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{player.id_type || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{player.height || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{player.weight || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            player.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {player.status || 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/players/new?id=${player.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium mr-4"
                        >
                          Edit
                        </Link>
                        <DeletePlayerButton
                          id={player.id}
                          name={player.name}
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
