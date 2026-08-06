'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import { deleteOrganiser } from '@/app/(protected)/organisers/actions';

export default function DeleteOrganiserButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this organiser? This will also delete their login access.'
    );
    if (!confirmed) return;

    setLoading(true);
    await deleteOrganiser(id);
    setLoading(false);
  };

  return (
    <Button variant="danger" onClick={handleDelete} loading={loading} loadingText="Deleting...">
      Delete
    </Button>
  );
}