'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import { deleteTournament } from '@/app/(protected)/tournaments/actions';

export default function DeleteTournamentButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this tournament?');
    if (!confirmed) return;

    setLoading(true);
    await deleteTournament(id);
    setLoading(false);
  };

  return (
    <Button variant="danger" onClick={handleDelete} loading={loading} loadingText="Deleting...">
      Delete
    </Button>
  );
}