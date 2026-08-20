'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import { deletePlayer } from '@/services/players/mutations';

export default function DeletePlayerButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this player?');
    if (!confirmed) return;

    setLoading(true);
    await deletePlayer(id);
    setLoading(false);
  };

  return (
    <Button variant="danger" onClick={handleDelete} loading={loading} loadingText="Deleting...">
      Delete
    </Button>
  );
}