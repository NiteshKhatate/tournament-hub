'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import { deleteTeam } from '@/services/teams/mutations';

export default function DeleteTeamButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this team?');
    if (!confirmed) return;

    setLoading(true);
    await deleteTeam(id);
    setLoading(false);
  };

  return (
    <Button variant="danger" onClick={handleDelete} loading={loading} loadingText="Deleting...">
      Delete
    </Button>
  );
}