'use client'

import { getGroupOptions } from '@/app/helper/GroupHelper'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Tournament {
  id: number
  name: string
}

interface Team {
  id: number
  name: string
}

type GroupOption = {
  groups: number
  teamsPerGroup: number
}

export default function GroupForm() {
  const router = useRouter()

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)

  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([])
  const [selectedOption, setSelectedOption] =
    useState<GroupOption | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const response = await fetch('/api/tournaments')
        const data = await response.json()

        if (response.ok) {
          setTournaments(data.tournaments || [])
        }
      } catch (error) {
        console.error(error)
      }
    }

    loadTournaments()
  }, [])

  const handleTournamentChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const tournamentId = e.target.value

    setSelectedTournament(tournamentId)
    setTeams([])
    setGroupOptions([])
    setSelectedOption(null)
    setError('')

    if (!tournamentId) return

    setIsLoadingTeams(true)

    try {
      const response = await fetch(
        `/api/teams?tournament_id=${tournamentId}`
      )

      const data = await response.json()

      if (response.ok) {
        setTeams(data.teams || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const handleCreateGroups = () => {
    const options = getGroupOptions(teams.length)

    setGroupOptions(options)
    setSelectedOption(null)

    if (options.length === 0) {
      setError(
        'No valid group combinations found. Teams must be divisible into groups of at least 3 teams each.'
      )
    } else {
      setError('')
    }
  }

  const handleConfirmGroups = async () => {
    if (!selectedTournament) {
      setError('Please select a tournament')
      return
    }

    if (!selectedOption) {
      setError('Please select a group configuration')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/groups/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tournament_id: Number(selectedTournament),
          group_count: selectedOption.groups,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create groups')
      }

      router.push('/groups')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create groups'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-slate-200 p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">
            Create Groups
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Tournament
            </label>

            <select
              value={selectedTournament}
              onChange={handleTournamentChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select Tournament</option>

              {tournaments.map((tournament) => (
                <option
                  key={tournament.id}
                  value={tournament.id}
                >
                  {tournament.name}
                </option>
              ))}
            </select>
          </div>

          {isLoadingTeams && (
            <p className="mt-6 text-slate-600">
              Loading teams...
            </p>
          )}

          {!isLoadingTeams && teams.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold text-slate-900 mb-3">
                Teams ({teams.length})
              </h2>

              <div className="space-y-2">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="p-3 border border-slate-200 rounded-lg"
                  >
                    {team.name}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleCreateGroups}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Create Groups
                </button>
              </div>

              {groupOptions.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Select Group Configuration
                  </h3>

                  <div className="space-y-2">
                    {groupOptions.map((option) => (
                      <label
                        key={option.groups}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="radio"
                          name="groupOption"
                          checked={
                            selectedOption?.groups === option.groups
                          }
                          onChange={() =>
                            setSelectedOption(option)
                          }
                        />

                        <span>
                          {option.groups} Groups (
                          {option.teamsPerGroup} teams each)
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {selectedOption && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleConfirmGroups}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition"
                  >
                    {isLoading
                      ? 'Creating Groups...'
                      : 'Confirm Groups'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}