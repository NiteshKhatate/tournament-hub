import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'
import DeleteButton from '@/components/DeleteButtton'

export default async function GroupsPage() {
  let groups: any[] = []
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
            
            // Fetch groups for these tournaments
            const { data, error: fetchError } = await supabase
              .from('groups')
              .select('*, tournaments(name)')
              .in('tournament_id', tournamentIds)
              .order('created', { ascending: false })

            if (fetchError) {
              errorMessage = fetchError.message
              throw fetchError
            }
            groups = data || []
          }
        }
      } else {
        // Non-organiser users see all groups
        const { data, error: fetchError } = await supabase
          .from('groups')
          .select('*, tournaments(name)')
          .order('created', { ascending: false })

        if (fetchError) {
          errorMessage = fetchError.message
          throw fetchError
        }
        groups = data || []
      }
    } else {
      // No user logged in, show all groups
      const { data, error: fetchError } = await supabase
        .from('groups')
        .select('*, tournaments(name)')
        .order('created', { ascending: false })

      if (fetchError) {
        errorMessage = fetchError.message
        throw fetchError
      }
      groups = data || []
    }
  } catch (err: unknown) {
    error = err
    errorMessage =
      err instanceof Error ? err.message : 'Unknown error'
    console.error('Error fetching groups:', err)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-8 py-6">
          <h1 className="text-4xl font-bold text-slate-900">groups</h1>
          <p className="text-slate-600 mt-1">
            {isOrganiser 
              ? `Groups from tournaments organized by ${organiserName}` 
              : 'Manage all groups created for tournaments.'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {error ? (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            <p className="font-semibold">Error loading groups:</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        ) : <></>}

        {/* Action Button */}
        <div className="mb-6">
          <Link
            href="/groups/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            + Add New Group
          </Link>
        </div>

        {/* groups Table */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          {groups.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No groups found. Create your first group to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tournament</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group, index) => (
                    <tr
                      key={group.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                        index === groups.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{group.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {group.tournaments?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {group.created ? new Date(group.created).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <DeleteButton
                          apiUrl={`/api/groups/${group.id}`}
                          entityName={group.name}
                          entityType="group"
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
