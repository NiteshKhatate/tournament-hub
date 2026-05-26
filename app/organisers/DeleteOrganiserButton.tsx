'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type DeleteOrganiserButtonProps = {
  id: number
  name: string
}

export default function DeleteOrganiserButton({
  id,
  name,
}: DeleteOrganiserButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete organiser "${name}"? This cannot be undone.`
    )
    if (!confirmed) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/organisers/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to delete organiser')
        return
      }

      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete organiser')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
