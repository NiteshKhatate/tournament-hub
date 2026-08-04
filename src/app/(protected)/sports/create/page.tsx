import CreateSportForm from '@/components/sports/CreateSportForm';

export default function CreateSportPage() {
  return (
    <>
      <h1 className="text-app-text">Create Sport</h1>
      <p className="mt-1 text-sm text-gray-500">Add a new sport to the platform</p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-8 shadow-md">
        <CreateSportForm />
      </div>
    </>
  );
}