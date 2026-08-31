import Link from "next/link";

export default function RegisterLandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-app-text text-center">Register</h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Choose what you&apos;d like to register as
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <Link
            href="/register/organiser"
            className="rounded-lg border-2 border-input-border px-4 py-3 text-center font-medium text-app-text transition hover:bg-app-bg"
          >
            Register as Organiser
          </Link>
          <Link
            href="/register/team"
            className="rounded-lg border-2 border-input-border px-4 py-3 text-center font-medium text-app-text transition hover:bg-app-bg"
          >
            Register a Team
          </Link>
          <Link
            href="/register/player"
            className="rounded-lg border-2 border-input-border px-4 py-3 text-center font-medium text-app-text transition hover:bg-app-bg"
          >
            Register as Player
          </Link>
        </div>
      </div>
    </div>
  );
}
