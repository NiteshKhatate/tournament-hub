'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import { deleteSport } from '@/services/sports/mutations';

export default function DeleteSportButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this sport?');
    if (!confirmed) return;

    setLoading(true);
    await deleteSport(id);
    setLoading(false);
  };

  return (
    <Button variant="danger" onClick={handleDelete} loading={loading} loadingText="Deleting...">
      Delete
    </Button>
  );
}