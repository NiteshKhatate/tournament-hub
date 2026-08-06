import OrganiserForm from '@/components/organisers/OrganiserForm';

export default function CreateOrganiserPage() {
  return (
    <>
      <h1 className="text-app-text">Create Organiser</h1>
      <p className="mt-1 text-sm text-gray-500">Add a new organiser to the platform</p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-8 shadow-md">
        <OrganiserForm />
      </div>
    </>
  );
}