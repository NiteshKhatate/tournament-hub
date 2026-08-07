'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import CriteriaModal from './CriteriaModal';

interface Criteria {
  id: number;
  gender: string | null;
  type: string;
  operator: string;
  value_min: number;
  value_max: number | null;
  unit: string | null;
  max_players_count: number;
  min_players_count: number;
  status: 'active' | 'inactive';
}

interface CriteriaButtonProps {
  tournamentId: number;
  criteria?: Criteria;
}

export default function CriteriaButton({ tournamentId, criteria }: CriteriaButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsModalOpen(true)}
        className="!px-3 !py-1.5 text-sm"
      >
        {criteria ? 'Edit Criteria' : 'Add Criteria'}
      </Button>
      <CriteriaModal
        tournamentId={tournamentId}
        criteria={criteria}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}