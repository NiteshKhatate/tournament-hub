'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Tournament {
  id: number
  name: string
}

interface Team {
  id: number
  name: string
  email: string
  contact: number
  tournament_id: number
  status: string
  disqualified_reason?: string
}

interface User {
  id: number
  username: string
  role: string
  uuid: string
}

const emptyForm = {
  name: '',
  email: '',
  contact: '',
  tournament_id: '',
  status: 'active',
  disqualified_reason: '',
}

const statusOptions = ['active', 'eliminated', 'disqualified']

export default function TeamForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = searchParams.get('id')
  const isEditMode = Boolean(teamId)

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(isEditMode)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true)
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

  // Fetch tournaments on mount or when user/organiser data changes
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        let url = '/api/tournaments'

        // If user is an organiser, fetch only their tournaments
        if (currentUser?.role === 'organiser' && organiserData?.id) {
          url = `/api/tournaments?organiser_id=${organiserData.id}`
        }

        const response = await fetch(url)
        const data = await response.json()
        if (response.ok) {
          setTournaments(data.tournaments || [])
        }
      } catch (err) {
        console.error('Error fetching tournaments:', err)
      } finally {
        setIsLoadingTournaments(false)
      }
    }

    loadTournaments()
  }, [currentUser, organiserData])

  // Load team data if in edit mode
  useEffect(() => {
    if (!teamId) return

    const loadTeam = async () => {
      setIsLoadingData(true)
      setError('')

      try {
        const response = await fetch(`/api/teams/${teamId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to load team')
          return
        }

        const { team } = data
        setFormData({
          name: team.name ?? '',
          email: team.email ?? '',
          contact: String(team.contact ?? ''),
          tournament_id: String(team.tournament_id ?? ''),
          status: team.status ?? 'active',
          disqualified_reason: team.disqualified_reason ?? '',
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load team')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadTeam()
  }, [teamId])

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
      setError('Team name is required')
      return
    }

    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!formData.contact || Number(formData.contact) <= 0) {
      setError('Valid contact number is required')
      return
    }

    if (!formData.tournament_id) {
      setError('Tournament is required')
      return
    }

    if (formData.status === 'disqualified' && !formData.disqualified_reason.trim()) {
      setError('Disqualified reason is required when status is disqualified')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        contact: Number(formData.contact),
        tournament_id: Number(formData.tournament_id),
        status: formData.status,
        disqualified_reason: formData.disqualified_reason || null,
      }

      const response = await fetch(
        isEditMode ? `/api/teams/${teamId}` : '/api/teams',
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
            (isEditMode ? 'Failed to update team' : 'Failed to create team')
        )
        return
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/teams')
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
            Loading team...
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
              {isEditMode ? 'Edit Team' : 'Create Team'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEditMode ? 'Update team details.' : 'Add a new team to the system.'}
            </p>
          </div>
          <Link
            href="/teams"
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            ← Back to Teams
          </Link>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
                <p className="font-semibold">
                  ✓ Team {isEditMode ? 'updated' : 'created'} successfully!
                </p>
                <p className="text-sm mt-1">Redirecting to teams list...</p>
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
                  Team Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Blue Warriors"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="team@example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="contact" className="block text-sm font-semibold text-slate-900 mb-2">
                    Contact (Phone) *
                  </label>
                  <input
                    type="number"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="e.g., 9876543210"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tournament_id" className="block text-sm font-semibold text-slate-900 mb-2">
                  Tournament *
                </label>
                <select
                  id="tournament_id"
                  name="tournament_id"
                  value={formData.tournament_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading || isLoadingTournaments}
                >
                  <option value="">Select Tournament</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
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

              {formData.status === 'disqualified' && (
                <div>
                  <label htmlFor="disqualified_reason" className="block text-sm font-semibold text-slate-900 mb-2">
                    Disqualified Reason *
                  </label>
                  <textarea
                    id="disqualified_reason"
                    name="disqualified_reason"
                    value={formData.disqualified_reason}
                    onChange={handleChange}
                    placeholder="Explain why the team was disqualified"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Team' : 'Create Team')}
                </button>
                <Link
                  href="/teams"
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
