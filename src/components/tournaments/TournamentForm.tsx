'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { createTournament, updateTournament } from '@/services/tournament-teams/mutations';
import { supabase } from '@/lib/supabase';

interface TournamentFormProps {
  tournament?: {
    id: number;
    name: string;
    organiser_id: number;
    sport_id: number;
    entry_fee: number;
    start_date: string | null;
    end_date: string | null;
    venue: string | null;
    geo_location: string | null;
    status: 'active' | 'inactive';
  };
}

interface Organiser {
  id: number;
  name: string;
}

interface Sport {
  id: number;
  name: string;
}

// Get today's date in YYYY-MM-DD format (for min attribute and validation)
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TournamentSchema = Yup.object().shape({
  name: Yup.string().required('Tournament name is required').min(2).max(200),
  organiser_id: Yup.number().required('Organiser is required'),
  sport_id: Yup.number().required('Sport is required'),
  entry_fee: Yup.number().required('Entry fee is required').min(0),
  start_date: Yup.string()
    .required('Start date is required')
    .test('is-future', 'Start date must be today or later', (value) => {
      if (!value) return true;
      return value >= getTodayString();
    }),
  end_date: Yup.string()
    .required('End date is required')
    .test('is-after-start', 'End date must be on or after the start date', function (value) {
      const { start_date } = this.parent;
      if (!value || !start_date) return true;
      return value >= start_date;
    }),
  venue: Yup.string().max(200),
  geo_location: Yup.string().max(200),
});

export default function TournamentForm({ tournament }: TournamentFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [organisers, setOrganisers] = useState<Organiser[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const isEditMode = Boolean(tournament);
  const today = getTodayString();

  useEffect(() => {
    const fetchData = async () => {
      const [organisersResult, sportsResult] = await Promise.all([
        supabase.from('organisers').select('id, name').order('name'),
        supabase.from('sports').select('id, name').order('name'),
      ]);

      if (organisersResult.data) {
        setOrganisers(organisersResult.data as Organiser[]);
      }
      if (sportsResult.data) {
        setSports(sportsResult.data as Sport[]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Loading organisers and sports...</div>;
  }

  return (
    <Formik
      initialValues={{
        name: tournament?.name ?? '',
        organiser_id: tournament?.organiser_id ?? '',
        sport_id: tournament?.sport_id ?? '',
        entry_fee: tournament?.entry_fee ?? '',
        start_date: tournament?.start_date ?? '',
        end_date: tournament?.end_date ?? '',
        venue: tournament?.venue ?? '',
        geo_location: tournament?.geo_location ?? '',
        status: tournament?.status ?? 'active',
      }}
      validationSchema={TournamentSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setServerError('');

        const result = isEditMode
          ? await updateTournament({
              id: tournament!.id,
              name: values.name,
              organiser_id: Number(values.organiser_id),
              sport_id: Number(values.sport_id),
              entry_fee: Number(values.entry_fee),
              start_date: values.start_date || undefined,
              end_date: values.end_date || undefined,
              venue: values.venue || undefined,
              geo_location: values.geo_location || undefined,
              status: values.status as 'active' | 'inactive',
            })
          : await createTournament({
              name: values.name,
              organiser_id: Number(values.organiser_id),
              sport_id: Number(values.sport_id),
              entry_fee: Number(values.entry_fee),
              start_date: values.start_date || undefined,
              end_date: values.end_date || undefined,
              venue: values.venue || undefined,
              geo_location: values.geo_location || undefined,
            });

        setSubmitting(false);

        if (result.error) {
          setServerError(result.error);
          return;
        }

        router.push('/tournaments');
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="flex flex-col gap-6">
          <Input name="name" label="Tournament Name" placeholder="e.g. City Cricket Championship" />

          <div className="flex flex-col gap-2">
            <label htmlFor="organiser_id" className="text-sm font-medium text-app-text">
              Organiser
            </label>
            <select
              id="organiser_id"
              name="organiser_id"
              value={values.organiser_id}
              onChange={(e) => setFieldValue('organiser_id', e.target.value)}
              className="h-8 rounded-lg border-2 border-input-border px-4 text-base text-app-text outline-none"
            >
              <option value="">Select organiser</option>
              {organisers.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sport_id" className="text-sm font-medium text-app-text">
              Sport
            </label>
            <select
              id="sport_id"
              name="sport_id"
              value={values.sport_id}
              onChange={(e) => setFieldValue('sport_id', e.target.value)}
              className="h-8 rounded-lg border-2 border-input-border px-4 text-base text-app-text outline-none"
            >
              <option value="">Select sport</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </div>

          <Input name="entry_fee" label="Entry Fee (₹)" type="number" placeholder="1000" />

          <Input
            name="start_date"
            label="Start Date"
            type="date"
            min={today}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFieldValue('start_date', e.target.value);
              // If end_date is now before the new start_date, clear it
              if (values.end_date && values.end_date < e.target.value) {
                setFieldValue('end_date', '');
              }
            }}
          />

          <Input
            name="end_date"
            label="End Date"
            type="date"
            min={values.start_date || today}
          />

          <Input name="venue" label="Venue" placeholder="e.g. Central Ground" />
          <Input name="geo_location" label="Geo Location" placeholder="e.g. Latitude, Longitude" />

          {isEditMode && (
            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-sm font-medium text-app-text">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={values.status}
                onChange={(e) => setFieldValue('status', e.target.value)}
                className="h-8 rounded-lg border-2 border-input-border px-4 text-base text-app-text outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={isSubmitting} loadingText="Saving...">
              {isEditMode ? 'Save Changes' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push('/tournaments')}>
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}