'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeletePlayerButtonProps {
  id: number
  name: string
}

export default function DeletePlayerButton({ id, name }: DeletePlayerButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete player "${name}"?`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/players?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete player')
      }

      alert(`Player "${name}" deleted successfully!`)
      // Refresh the page
      router.refresh()
    } catch (error) {
      console.error('Error deleting player:', error)
      alert('Failed to delete player. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
