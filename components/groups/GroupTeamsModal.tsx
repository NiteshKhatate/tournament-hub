'use client'

import { useEffect, useState } from 'react'

type Team = {
  id: number
  name: string
}

type Props = {
  groupId: number | null
  groupName: string
  onClose: () => void
}

export default function GroupTeamsModal({
  groupId,
  groupName,
  onClose,
}: Props) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!groupId) return

    const fetchTeams = async () => {
      setLoading(true)

      try {
        const response = await fetch(
          `/api/groups/${groupId}/teams`
        )

        const data = await response.json()

        if (response.ok) {
          setTeams(data.teams || [])
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [groupId])

  if (!groupId || teams.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">
            {groupName}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-slate-600">
              Loading teams...
            </p>
          ) : (
            <div className="space-y-2">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className="p-3 border border-slate-200 rounded-lg flex justify-between"
                >
                  <span>{team.name}</span>
                  <span className="text-slate-500">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}