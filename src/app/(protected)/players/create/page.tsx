import PlayerForm from '@/components/players/PlayerForm';

export default function CreatePlayerPage() {
  return (
    <>
      <h1 className="text-app-text">Create Player</h1>
      <p className="mt-1 text-sm text-gray-500">Register a new player</p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-8 shadow-md">
        <PlayerForm />
      </div>
    </>
  );
}