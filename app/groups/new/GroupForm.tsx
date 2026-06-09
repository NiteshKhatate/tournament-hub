'use client'

import { useEffect, useState } from 'react'

interface Tournament {
  id: number
  name: string
}

interface Team {
  id: number
  name: string
}

export default function GroupForm() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedTournament, setSelectedTournament] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-slate-200 p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">
            Create Group
          </h1>

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
                <option key={tournament.id} value={tournament.id}>
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
                Teams
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
            </div>
          )}
        </div>
      </main>
    </div>
  )
}