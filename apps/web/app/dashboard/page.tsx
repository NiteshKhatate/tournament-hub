export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-white">
          Welcome to Tournament Hub
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8">
          Manage your tournaments and organisers from here. Use the sidebar to navigate to different sections.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">
              📊 Dashboard
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300">
              Overview of your tournaments and key statistics.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">
              👤 Organisers
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300">
              Manage tournament organisers and their details.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">
              ⚙️ Settings
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300">
              Configure your preferences and system settings.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white">
              🚀 Getting Started
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300">
              Learn how to get the most out of Tournament Hub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
