import TournamentForm from "@/components/tournaments/TournamentForm";

export default function CreateTournamentPage() {
  return (
    <>
      <h1 className="text-app-text">Create Tournament</h1>
      <p className="mt-1 text-sm text-gray-500">Set up a new tournament</p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-8 shadow-md">
        <TournamentForm />
      </div>
    </>
  );
}