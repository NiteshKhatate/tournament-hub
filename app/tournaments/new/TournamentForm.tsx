'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Organiser {
  id: number
  name: string
}

interface User {
  id: number
  username: string
  role: string
  uuid: string
}

const emptyForm = {
  name: '',
  sport: '',
  player_criteria: '',
  player_limit: '',
  organiser_id: '',
  start_date: '',
  end_date: '',
  status: 'active',
}

const sportOptions = ['cricket', 'football', 'kabaddi']
const playerCriteriaOptions = ['age', 'weight', 'height']

export default function TournamentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tournamentId = searchParams.get('id')
  const isEditMode = Boolean(tournamentId)

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(isEditMode)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [organisers, setOrganisers] = useState<Organiser[]>([])
  const [isLoadingOrganisers, setIsLoadingOrganisers] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loggedInOrganiser, setLoggedInOrganiser] = useState<Organiser | null>(null)

  // Fetch current user on mount
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
          
          // If user is an organiser, fetch their organiser details
          if (data.user.role === 'organiser') {
            const organiserResponse = await fetch('/api/organisers')
            const organiserData = await organiserResponse.json()
            if (organiserResponse.ok) {
              // Find the organiser linked to this user
              // We need to check the login_id, but since we only get id and name from /api/organisers,
              // we'll need to make an assumption or create a new endpoint
              // For now, we'll assume the first organiser is theirs or use their username
              setOrganisers(organiserData.organisers || [])
            }
          }
        }
      } catch (err) {
        console.error('Error fetching current user:', err)
      }
    }

    loadCurrentUser()
  }, [])

  // Fetch organiser for logged-in organiser user
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'organiser') return

    const fetchLoggedInOrganiser = async () => {
      try {
        const response = await fetch('/api/auth/organiser')
        if (response.ok) {
          const data = await response.json()
          setLoggedInOrganiser(data.organiser)
          // Auto-fill organiser_id if not already set
          setFormData((prev) => ({
            ...prev,
            organiser_id: String(data.organiser.id),
          }))
        }
      } catch (err) {
        console.error('Error fetching organiser details:', err)
      }
    }

    fetchLoggedInOrganiser()
  }, [currentUser])

  // Fetch organisers on mount (only if user is not an organiser)
  useEffect(() => {
    if (currentUser?.role === 'organiser') {
      setIsLoadingOrganisers(false)
      return
    }

    const loadOrganisers = async () => {
      try {
        const response = await fetch('/api/organisers')
        const data = await response.json()
        if (response.ok) {
          setOrganisers(data.organisers || [])
        }
      } catch (err) {
        console.error('Error fetching organisers:', err)
      } finally {
        setIsLoadingOrganisers(false)
      }
    }

    loadOrganisers()
  }, [currentUser])

  useEffect(() => {
    if (!tournamentId) return

    const loadTournament = async () => {
      setIsLoadingData(true)
      setError('')

      try {
        const response = await fetch(`/api/tournaments/${tournamentId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to load tournament')
          return
        }

        const { tournament } = data
        setFormData({
          name: tournament.name ?? '',
          sport: tournament.sport ?? '',
          player_criteria: tournament.player_criteria ?? '',
          player_limit: String(tournament.player_limit ?? ''),
          organiser_id: String(tournament.organiser_id ?? ''),
          start_date: tournament.start_date ? tournament.start_date.split('T')[0] : '',
          end_date: tournament.end_date ? tournament.end_date.split('T')[0] : '',
          status: tournament.status ?? 'active',
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load tournament')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadTournament()
  }, [tournamentId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!formData.name.trim()) {
      setError('Tournament name is required')
      return
    }

    if (!formData.sport) {
      setError('Sport is required')
      return
    }

    if (!formData.player_criteria) {
      setError('Player criteria is required')
      return
    }

    if (!formData.player_limit || Number(formData.player_limit) <= 0) {
      setError('Player limit must be a positive number')
      return
    }

    if (!formData.organiser_id) {
      setError('Organiser is required')
      return
    }

    if (!formData.start_date) {
      setError('Start date is required')
      return
    }

    if (!formData.end_date) {
      setError('End date is required')
      return
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      setError('End date must be after start date')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        name: formData.name,
        sport: formData.sport,
        player_criteria: formData.player_criteria,
        player_limit: Number(formData.player_limit),
        organiser_id: Number(formData.organiser_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
      }

      const response = await fetch(
        isEditMode ? `/api/tournaments/${tournamentId}` : '/api/tournaments',
        {
          method: isEditMode ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.error ||
            (isEditMode ? 'Failed to update tournament' : 'Failed to create tournament')
        )
        return
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/tournaments')
      }, 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <main className="p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-slate-200 p-8 text-center text-slate-600">
            Loading tournament...
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              {isEditMode ? 'Edit Tournament' : 'Create Tournament'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEditMode
                ? 'Update tournament details.'
                : 'Add a new tournament to the system.'}
            </p>
          </div>
          <Link
            href="/tournaments"
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            ← Back to Tournaments
          </Link>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
                <p className="font-semibold">
                  ✓ Tournament {isEditMode ? 'updated' : 'created'} successfully!
                </p>
                <p className="text-sm mt-1">Redirecting to tournaments list...</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
                <p className="font-semibold">Error:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Spring Championship 2026"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sport" className="block text-sm font-semibold text-slate-900 mb-2">
                    Sport *
                  </label>
                  <select
                    id="sport"
                    name="sport"
                    value={formData.sport}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  >
                    <option value="">Select Sport</option>
                    {sportOptions.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="player_criteria" className="block text-sm font-semibold text-slate-900 mb-2">
                    Player Criteria *
                  </label>
                  <select
                    id="player_criteria"
                    name="player_criteria"
                    value={formData.player_criteria}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  >
                    <option value="">Select Criteria</option>
                    {playerCriteriaOptions.map((criteria) => (
                      <option key={criteria} value={criteria}>
                        {criteria.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="player_limit" className="block text-sm font-semibold text-slate-900 mb-2">
                    Player Limit *
                  </label>
                  <input
                    type="number"
                    id="player_limit"
                    name="player_limit"
                    value={formData.player_limit}
                    onChange={handleChange}
                    placeholder="e.g., 100"
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                </div>

                {currentUser?.role === 'organiser' ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Your Organisation
                    </label>
                    <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 flex items-center">
                      {loggedInOrganiser?.name || 'Loading...'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="organiser_id" className="block text-sm font-semibold text-slate-900 mb-2">
                      Organiser *
                    </label>
                    <select
                      id="organiser_id"
                      name="organiser_id"
                      value={formData.organiser_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      disabled={isLoading || isLoadingOrganisers}
                    >
                      <option value="">Select Organiser</option>
                      {organisers.map((organiser) => (
                        <option key={organiser.id} value={organiser.id}>
                          {organiser.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-semibold text-slate-900 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-semibold text-slate-900 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-slate-900 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition"
                >
                  {isLoading ? 'Saving...' : isEditMode ? 'Update Tournament' : 'Create Tournament'}
                </button>
                <Link
                  href="/tournaments"
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 px-6 rounded-lg transition text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
