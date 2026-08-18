import { notFound } from 'next/navigation';
import { getOrganiserById } from '@/services/organisers/queries';
import OrganiserForm from '@/components/organisers/OrganiserForm';

export default async function EditOrganiserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: organiser, error } = await getOrganiserById(Number(id));

  if (error || !organiser) {
    notFound();
  }

  return (
    <>
      <h1 className="text-app-text">Edit Organiser</h1>
      <p className="mt-1 text-sm text-gray-500">Update organiser details</p>

      <div className="mt-8 max-w-md rounded-2xl bg-white p-8 shadow-md">
        <OrganiserForm organiser={organiser} />
      </div>
    </>
  );
}