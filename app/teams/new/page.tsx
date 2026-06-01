import { Suspense } from 'react'
import TeamForm from './TeamForm'

export default function CreateTeamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <main className="p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-slate-200 p-8 text-center text-slate-600">
              Loading...
            </div>
          </main>
        </div>
      }
    >
      <TeamForm />
    </Suspense>
  )
}
