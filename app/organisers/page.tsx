import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export default async function OrganisersPage() {
  const supabase = await createClient()
  
  let organisers: any[] = []
  let error = null
  let errorMessage = ''

  try {
    const { data, error: fetchError } = await supabase
      .from('organisers')
      .select('*')
      .order('created', { ascending: false })

    if (fetchError) {
      errorMessage = fetchError.message
      throw fetchError
    }
    organisers = data || []
  } catch (err: any) {
    error = err
    errorMessage = err?.message || 'Unknown error'
    console.error('Error fetching organisers:', err)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="ml-64 px-8 py-6">
          <h1 className="text-4xl font-bold text-slate-900">Organisers</h1>
          <p className="text-slate-600 mt-1">Manage tournament organisers and administrators.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            <p className="font-semibold">Error loading organisers:</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="mb-6">
          <Link
            href="/organisers/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            + Add New Organiser
          </Link>
        </div>

        {/* Organisers Table */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
          {organisers.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No organisers found. Create your first organiser to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tournaments</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organisers.map((organiser, index) => (
                    <tr
                      key={organiser.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition ${
                        index === organisers.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{organiser.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{organiser.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {organiser.tournaments || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            organiser.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {organiser.status || 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-700 font-medium mr-4">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-700 font-medium">
                          Delete
                        </button>
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
