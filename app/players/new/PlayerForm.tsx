'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Team {
  id: number
  name: string
}

interface Player {
  id: number
  name: string
  id_proof?: string
  id_type?: string
  weight?: number
  height?: number
  team_id: number
  status: string
}

interface User {
  id: number
  username: string
  role: string
  uuid: string
}

const emptyForm = {
  name: '',
  id_proof: '',
  id_type: '',
  weight: '',
  height: '',
  team_id: '',
  status: 'active',
}

const statusOptions = ['active', 'inactive']
const idTypeOptions = ['aadhar', 'passport', 'pan', 'school id', 'collage id']

export default function PlayerForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const playerId = searchParams.get('id')
  const isEditMode = Boolean(playerId)

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(isEditMode)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [organiserData, setOrganiserData] = useState<{ id: number; name: string } | null>(null)

  // Fetch current user on mount
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          const data = await response.json()
          setCurrentUser(data.user)
        }
      } catch (err) {
        console.error('Error fetching current user:', err)
      }
    }

    loadCurrentUser()
  }, [])

  // Fetch organiser data if user is an organiser
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'organiser') return

    const fetchOrganiserData = async () => {
      try {
        const response = await fetch('/api/auth/organiser')
        if (response.ok) {
          const data = await response.json()
          setOrganiserData(data.organiser)
        }
      } catch (err) {
        console.error('Error fetching organiser data:', err)
      }
    }

    fetchOrganiserData()
  }, [currentUser])

  // Fetch teams on mount or when user/organiser data changes
  useEffect(() => {
    const loadTeams = async () => {
      try {
        let url = '/api/teams'

        // If user is an organiser, fetch only their teams
        if (currentUser?.role === 'organiser' && organiserData?.id) {
          // Get tournaments for this organiser first
          const tournamentsResponse = await fetch(`/api/tournaments?organiser_id=${organiserData.id}`)
          const tournamentsData = await tournamentsResponse.json()

          if (tournamentsData.tournaments && tournamentsData.tournaments.length > 0) {
            const tournamentIds = tournamentsData.tournaments.map((t: any) => t.id).join(',')
            // Fetch teams for these tournaments
            const teamsResponse = await fetch(`/api/teams?tournament_ids=${tournamentIds}`)
            const teamsData = await teamsResponse.json()
            setTeams(teamsData.teams || [])
          }
        } else {
          const response = await fetch(url)
          const data = await response.json()
          if (response.ok) {
            setTeams(data.teams || [])
          }
        }
      } catch (err) {
        console.error('Error fetching teams:', err)
      } finally {
        setIsLoadingTeams(false)
      }
    }

    loadTeams()
  }, [currentUser, organiserData])

  // Load player data if in edit mode
  useEffect(() => {
    if (!playerId) return

    const loadPlayer = async () => {
      setIsLoadingData(true)
      setError('')

      try {
        const response = await fetch(`/api/players/${playerId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to load player')
          return
        }

        const { player } = data
        setFormData({
          name: player.name ?? '',
          id_proof: player.id_proof ?? '',
          id_type: player.id_type ?? '',
          weight: player.weight ? String(player.weight) : '',
          height: player.height ? String(player.height) : '',
          team_id: String(player.team_id ?? ''),
          status: player.status ?? 'active',
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load player')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadPlayer()
  }, [playerId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      setError('Player name is required')
      return
    }

    if (!formData.team_id) {
      setError('Team is required')
      return
    }

    if (formData.height && (Number(formData.height) <= 0 || Number(formData.height) > 300)) {
      setError('Height must be a valid value between 1 and 300 cm')
      return
    }

    if (formData.weight && (Number(formData.weight) <= 0 || Number(formData.weight) > 500)) {
      setError('Weight must be a valid value between 1 and 500 kg')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        name: formData.name,
        id_proof: formData.id_proof || null,
        id_type: formData.id_type || null,
        weight: formData.weight ? Number(formData.weight) : null,
        height: formData.height ? Number(formData.height) : null,
        team_id: Number(formData.team_id),
        status: formData.status,
      }

      const response = await fetch(
        isEditMode ? `/api/players/${playerId}` : '/api/players',
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
            (isEditMode ? 'Failed to update player' : 'Failed to create player')
        )
        return
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/players')
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
            Loading player...
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
              {isEditMode ? 'Edit Player' : 'Create Player'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEditMode ? 'Update player details.' : 'Add a new player to the system.'}
            </p>
          </div>
          <Link
            href="/players"
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            ← Back to Players
          </Link>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
                <p className="font-semibold">
                  ✓ Player {isEditMode ? 'updated' : 'created'} successfully!
                </p>
                <p className="text-sm mt-1">Redirecting to players list...</p>
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
                  Player Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="team_id" className="block text-sm font-semibold text-slate-900 mb-2">
                  Team *
                </label>
                <select
                  id="team_id"
                  name="team_id"
                  value={formData.team_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading || isLoadingTeams}
                >
                  <option value="">Select Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="height" className="block text-sm font-semibold text-slate-900 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g., 180"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-semibold text-slate-900 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g., 75"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="id_type" className="block text-sm font-semibold text-slate-900 mb-2">
                    ID Type
                  </label>
                  <select
                    id="id_type"
                    name="id_type"
                    value={formData.id_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  >
                    <option value="">Select ID Type</option>
                    {idTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="id_proof" className="block text-sm font-semibold text-slate-900 mb-2">
                    ID Proof Number
                  </label>
                  <input
                    type="text"
                    id="id_proof"
                    name="id_proof"
                    value={formData.id_proof}
                    onChange={handleChange}
                    placeholder="e.g., XXXX-XXXX-XXXX"
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
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Player' : 'Create Player')}
                </button>
                <Link
                  href="/players"
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium py-2 px-4 rounded-lg transition text-center"
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
