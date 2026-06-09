'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type DeleteButtonProps = {
  apiUrl: string
  entityName: string
  entityType?: string
  onSuccess?: () => void
}

export default function DeleteButton({
  apiUrl,
  entityName,
  entityType = 'record',
  onSuccess,
}: DeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete ${entityType} "${entityName}"? This cannot be undone.`
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      const response = await fetch(apiUrl, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || `Failed to delete ${entityType}`)
        return
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : `Failed to delete ${entityType}`
      )
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