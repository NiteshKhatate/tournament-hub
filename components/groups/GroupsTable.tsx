'use client'

import { useState } from 'react'
import DeleteButton from '@/components/DeleteButtton'
import GroupTeamsModal from './GroupTeamsModal'

type Props = {
  groups: any[]
}

export default function GroupsTable({ groups }: Props) {
  const [showGroupTeamsId, setShowGroupTeamsId] = useState<number>(0)
  const [showGroupName, setShowGroupName] = useState('')

  return (
    <>
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
                    <td className="px-6 py-4 text-sm flex gap-1">
                      <button
                        onClick={() => {
                            setShowGroupTeamsId(group.id)
                            setShowGroupName(group.name)
                        }}
                        className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                        >
                        Show
                        </button>

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

      <GroupTeamsModal
        groupId={showGroupTeamsId}
        groupName={showGroupName}
        onClose={() => {
          setShowGroupTeamsId(0)
          setShowGroupName('')
        }}
      />
    </>
  )
}