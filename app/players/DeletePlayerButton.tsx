'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeletePlayerButtonProps {
  id: number
  name: string
}

export default function DeletePlayerButton({ id, name }: DeletePlayerButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/players?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete player')
      }

      // Refresh the page
      router.refresh()
      setShowConfirm(false)
    } catch (error) {
      console.error('Error deleting player:', error)
      alert('Failed to delete player. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="inline-block">
        <span className="text-red-600 text-sm font-medium mr-2">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-block text-red-600 hover:text-red-700 font-medium mr-2 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="inline-block text-gray-600 hover:text-gray-700 font-medium disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-700 font-medium"
    >
      Delete
    </button>
  )
}
