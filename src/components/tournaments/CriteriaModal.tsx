'use client';

import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import {
  createTournamentCriteria,
  updateTournamentCriteria,
  deleteTournamentCriteria,
} from '@/services/tournament-teams/mutations';

interface CriteriaModalProps {
  tournamentId: number;
  criteria?: {
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
  };
  isOpen: boolean;
  onClose: () => void;
}

const CriteriaSchema = Yup.object().shape({
  gender: Yup.string(),
  type: Yup.string().required('Type is required'),
  operator: Yup.string().required('Operator is required'),
  value_min: Yup.number().required('Min value is required').min(0),
  value_max: Yup.number().nullable(),
  unit: Yup.string(),
  max_players_count: Yup.number().required('Max players is required').min(1),
  min_players_count: Yup.number().required('Min players is required').min(1),
});

export default function CriteriaModal({
  tournamentId,
  criteria,
  isOpen,
  onClose,
}: CriteriaModalProps) {
  const [serverError, setServerError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const isEditMode = Boolean(criteria);

  if (!isOpen) return null;

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this criteria?');
    if (!confirmed) return;

    setDeleting(true);
    await deleteTournamentCriteria(criteria!.id);
    setDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-app-text font-semibold">
          {isEditMode ? 'Edit Criteria' : 'Add Criteria'}
        </h2>

        <Formik
          initialValues={{
            gender: criteria?.gender ?? '',
            type: criteria?.type ?? '',
            operator: criteria?.operator ?? '',
            value_min: criteria?.value_min ?? '',
            value_max: criteria?.value_max ?? '',
            unit: criteria?.unit ?? '',
            max_players_count: criteria?.max_players_count ?? '',
            min_players_count: criteria?.min_players_count ?? '',
          }}
          validationSchema={CriteriaSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setServerError('');

            const result = isEditMode
              ? await updateTournamentCriteria({
                  id: criteria!.id,
                  gender: values.gender || undefined,
                  type: values.type,
                  operator: values.operator,
                  value_min: Number(values.value_min),
                  value_max: values.value_max ? Number(values.value_max) : undefined,
                  unit: values.unit || undefined,
                  max_players_count: Number(values.max_players_count),
                  min_players_count: Number(values.min_players_count),
                  status: criteria!.status,
                })
              : await createTournamentCriteria({
                  tournament_id: tournamentId,
                  gender: values.gender || undefined,
                  type: values.type,
                  operator: values.operator,
                  value_min: Number(values.value_min),
                  value_max: values.value_max ? Number(values.value_max) : undefined,
                  unit: values.unit || undefined,
                  max_players_count: Number(values.max_players_count),
                  min_players_count: Number(values.min_players_count),
                });

            setSubmitting(false);

            if (result.error) {
              setServerError(result.error);
              return;
            }

            onClose();
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="gender" className="text-sm font-medium text-app-text">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={values.gender}
                  onChange={(e) => setFieldValue('gender', e.target.value)}
                  className="h-8 rounded-lg border-2 border-input-border px-3 text-sm text-app-text outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="mixed">Mixed</option>
                  <option value="not specified">Not Specified</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="type" className="text-sm font-medium text-app-text">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={values.type}
                  onChange={(e) => setFieldValue('type', e.target.value)}
                  className="h-8 rounded-lg border-2 border-input-border px-3 text-sm text-app-text outline-none"
                >
                  <option value="">Select type</option>
                  <option value="age">Age</option>
                  <option value="weight">Weight</option>
                  <option value="height">Height</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="operator" className="text-sm font-medium text-app-text">
                  Operator
                </label>
                <select
                  id="operator"
                  name="operator"
                  value={values.operator}
                  onChange={(e) => setFieldValue('operator', e.target.value)}
                  className="h-8 rounded-lg border-2 border-input-border px-3 text-sm text-app-text outline-none"
                >
                  <option value="">Select operator</option>
                  <option value="min">Min</option>
                  <option value="max">Max</option>
                  <option value="between">Between</option>
                  <option value="exact">Exact</option>
                </select>
              </div>

              <Input name="value_min" label="Min Value" type="number" placeholder="0" />

              {values.operator === 'between' && (
                <Input name="value_max" label="Max Value" type="number" placeholder="100" />
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="unit" className="text-sm font-medium text-app-text">
                  Unit
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={values.unit}
                  onChange={(e) => setFieldValue('unit', e.target.value)}
                  className="h-8 rounded-lg border-2 border-input-border px-3 text-sm text-app-text outline-none"
                >
                  <option value="">Select unit</option>
                  <option value="years">Years</option>
                  <option value="kg">KG</option>
                  <option value="meter">Meter</option>
                </select>
              </div>

              <Input
                name="min_players_count"
                label="Min Players Count"
                type="number"
                placeholder="1"
              />
              <Input
                name="max_players_count"
                label="Max Players Count"
                type="number"
                placeholder="100"
              />

              {serverError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {serverError}
                </p>
              )}

              <div className="flex gap-3 justify-end">
                {isEditMode && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDelete}
                    loading={deleting}
                    loadingText="Deleting..."
                  >
                    Delete
                  </Button>
                )}
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={isSubmitting} loadingText="Saving...">
                  {isEditMode ? 'Update' : 'Add'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}