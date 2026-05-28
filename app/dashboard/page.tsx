import Link from 'next/link'

export default function DashboardPage() {
  const stats = [
    { label: 'Active Tournaments', value: '5', icon: '🏆', color: 'from-blue-500 to-blue-600' },
    { label: 'Total Teams', value: '24', icon: '👥', color: 'from-purple-500 to-purple-600' },
    { label: 'Total Players', value: '156', icon: '👤', color: 'from-pink-500 to-pink-600' },
    { label: 'Upcoming Matches', value: '12', icon: '⚡', color: 'from-orange-500 to-orange-600' },
  ]

  const recentTournaments = [
    { id: 1, name: 'Spring Championship 2026', status: 'In Progress', teams: 16 },
    { id: 2, name: 'Summer League', status: 'Upcoming', teams: 12 },
    { id: 3, name: 'Winter Cup', status: 'Completed', teams: 20 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 w-full">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-8 py-6">
          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's your tournament overview.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.color} rounded-lg shadow-lg p-6 text-white transform transition hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl opacity-50">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Tournaments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Recent Tournaments</h2>
                <Link
                  href="/tournaments"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-4">
                {recentTournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">{tournament.name}</h3>
                      <p className="text-sm text-slate-600">{tournament.teams} teams</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tournament.status === 'In Progress'
                            ? 'bg-green-100 text-green-800'
                            : tournament.status === 'Upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {tournament.status}
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 transition">
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 sticky top-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/tournaments?action=create"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-center transition"
                >
                  Create Tournament
                </Link>
                <Link
                  href="/teams?action=create"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-center transition"
                >
                  Add Team
                </Link>
                <Link
                  href="/schedule"
                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg text-center transition"
                >
                  View Schedule
                </Link>
                <Link
                  href="/results"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-center transition"
                >
                  View Results
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { time: '2 hours ago', action: 'Team "Blue Warriors" registered for Spring Championship' },
              { time: '5 hours ago', action: 'Match between "Red Dragons" vs "Blue Warriors" scheduled' },
              { time: '1 day ago', action: 'Tournament "Spring Championship 2026" created' },
              { time: '2 days ago', action: 'New player "John Doe" added to "Blue Warriors"' },
            ].map((activity, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-slate-200 last:border-b-0">
                <div className="text-sm text-slate-500 min-w-fit">{activity.time}</div>
                <div className="text-slate-700">{activity.action}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
