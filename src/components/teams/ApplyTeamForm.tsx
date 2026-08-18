'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Button from '@/components/common/Button';
import { applyTeamToTournament } from '@/services/teams/mutations';
import { supabase } from '@/lib/supabase';

interface ApplyTeamFormProps {
  teamId: number;
  teamName: string;
  sportId: number;
  sportName: string;
}

interface Tournament {
  id: number;
  name: string;
}

const ApplySchema = Yup.object().shape({
  tournament_id: Yup.number().required('Please select a tournament'),
});

export default function ApplyTeamForm({ teamId, teamName, sportId, sportName }: ApplyTeamFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data } = await supabase
        .from('tournaments')
        .select('id, name')
        .eq('status', 'active')
        .eq('sport_id', sportId)
        .order('name');

      if (data) {
        setTournaments(data as Tournament[]);
      }
      setLoading(false);
    };

    fetchTournaments();
  }, [sportId]);

  if (loading) {
    return <div className="text-center text-gray-500">Loading tournaments...</div>;
  }

  return (
    <Formik
      initialValues={{ tournament_id: '' }}
      validationSchema={ApplySchema}
      onSubmit={async (values, { setSubmitting }) => {
        setServerError('');

        const result = await applyTeamToTournament({
          team_id: teamId,
          tournament_id: Number(values.tournament_id),
        });

        setSubmitting(false);

        if (result.error) {
          setServerError(result.error);
          return;
        }

        router.push('/teams');
      }}
    >
      {({ isSubmitting, values, setFieldValue, errors, touched }) => (
        <Form className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-gray-500">Applying as</p>
            <p className="text-app-text font-medium">{teamName}</p>
            <p className="mt-1 text-sm text-gray-500">Sport: {sportName}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tournament_id" className="text-sm font-medium text-app-text">
              Tournament
            </label>
            <select
              id="tournament_id"
              name="tournament_id"
              value={values.tournament_id}
              onChange={(e) => setFieldValue('tournament_id', e.target.value)}
              className="h-8 rounded-lg border-2 border-input-border px-4 text-base text-app-text outline-none"
            >
              <option value="">Select tournament</option>
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>
            {errors.tournament_id && touched.tournament_id && (
              <p className="text-sm text-red-600">{errors.tournament_id}</p>
            )}
          </div>

          {tournaments.length === 0 && (
            <p className="text-sm text-gray-400">
              No active {sportName} tournaments available right now.
            </p>
          )}

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              loadingText="Applying..."
              disabled={tournaments.length === 0}
            >
              Apply
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push('/teams')}>
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}