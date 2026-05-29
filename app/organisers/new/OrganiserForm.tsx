'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const emptyForm = {
  name: '',
  email: '',
  contact: '',
  username: '',
  password: '',
  confirmPassword: '',
}

export default function OrganiserForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const organiserId = searchParams.get('id')
  const isEditMode = Boolean(organiserId)

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(isEditMode)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (!organiserId) return

    const loadOrganiser = async () => {
      setIsLoadingData(true)
      setError('')

      try {
        const response = await fetch(`/api/organisers/${organiserId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to load organiser')
          return
        }

        const { organiser } = data
        setFormData({
          name: organiser.name ?? '',
          email: organiser.email ?? '',
          contact: String(organiser.contact ?? ''),
          username: organiser.username ?? '',
          password: '',
          confirmPassword: '',
        })
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load organiser')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadOrganiser()
  }, [organiserId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setError('Name is required')
      return
    }

    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }

    if (!formData.contact.trim()) {
      setError('Contact number is required')
      return
    }

    if (!/^\d+$/.test(formData.contact)) {
      setError('Contact must be a valid phone number')
      return
    }

    if (!formData.username.trim()) {
      setError('Username is required')
      return
    }

    if (!isEditMode) {
      if (!formData.password) {
        setError('Password is required')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
    } else if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
    }

    setIsLoading(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        contact: Number(formData.contact),
        username: formData.username,
        ...(formData.password ? { password: formData.password } : {}),
      }

      const response = await fetch(
        isEditMode ? `/api/organisers/${organiserId}` : '/api/organisers',
        {
          method: isEditMode ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            isEditMode ? payload : { ...payload, password: formData.password }
          ),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.error ||
            (isEditMode ? 'Failed to update organiser' : 'Failed to create organiser')
        )
        return
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/organisers')
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
            Loading organiser...
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="ml-64 px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              {isEditMode ? 'Edit Organiser' : 'Create Organiser'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEditMode
                ? 'Update tournament organiser details.'
                : 'Add a new tournament organiser to the system.'}
            </p>
          </div>
          <Link
            href="/organisers"
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            ← Back to Organisers
          </Link>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
                <p className="font-semibold">
                  ✓ Organiser {isEditMode ? 'updated' : 'created'} successfully!
                </p>
                <p className="text-sm mt-1">Redirecting to organisers list...</p>
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
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-semibold text-slate-900 mb-2">
                  Contact Number *
                </label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-slate-900 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="john_smith"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                  Password {isEditMode ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-600 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900 mb-2">
                  Confirm Password {isEditMode ? '' : '*'}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {isLoading
                    ? isEditMode
                      ? 'Saving...'
                      : 'Creating...'
                    : isEditMode
                      ? 'Save Changes'
                      : 'Create Organiser'}
                </button>
                <Link
                  href="/organisers"
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-2 px-4 rounded-lg transition text-center"
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
