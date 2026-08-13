import TeamForm from '@/components/teams/TeamForm';

export default function CreateTeamPage() {
  return (
    <>
      <h1 className="text-app-text">Create Team</h1>
      <p className="mt-1 text-sm text-gray-500">Add a new team to the platform</p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-8 shadow-md">
        <TeamForm />
      </div>
    </>
  );
}