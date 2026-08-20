'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { createPlayer, updatePlayer } from '@/services/players/mutations';
import { supabase } from '@/lib/supabase';

interface PlayerFormProps {
  player?: {
    id: number;
    name: string;
    email: string;
    contact: number;
    sport_id: number;
    id_type: 'aadhar' | 'pan' | 'school_id' | 'college_id';
    id_proof: string;
    birthdate: string;
    height: number | null;
    weight: number | null;
    status: 'active' | 'inactive';
  };
}

interface Sport {
  id: number;
  name: string;
}

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PlayerSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').min(2).max(200),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  contact: Yup.string()
    .required('Contact number is required')
    .matches(/^\d{10}$/, 'Enter a valid 10-digit contact number'),
  sport_id: Yup.number().required('Sport is required'),
  id_type: Yup.string().required('ID type is required'),
  id_proof: Yup.string().required('ID proof number is required').max(50),
  birthdate: Yup.string()
    .required('Birthdate is required')
    .test('is-past', 'Birthdate must be before today', (value) => {
      if (!value) return true;
      return value < getTodayString();
    }),
  height: Yup.number().min(0).nullable(),
  weight: Yup.number().min(0).nullable(),
});

export default function PlayerForm({ player }: PlayerFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const isEditMode = Boolean(player);
  const today = getTodayString();

  useEffect(() => {
    const fetchSports = async () => {
      const { data } = await supabase.from('sports').select('id, name').order('name');
      if (data) {
        setSports(data as Sport[]);
      }
      setLoading(false);
    };

    fetchSports();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Loading sports...</div>;
  }

  return (
    <Formik
      initialValues={{
        name: player?.name ?? '',
        email: player?.email ?? '',
        contact: player?.contact ?? '',
        sport_id: player?.sport_id ?? '',
        id_type: player?.id_type ?? '',
        id_proof: player?.id_proof ?? '',
        birthdate: player?.birthdate ?? '',
        height: player?.height ?? '',
        weight: player?.weight ?? '',
        status: player?.status ?? 'active',
      }}
      validationSchema={PlayerSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setServerError('');

        const payload = {
          name: values.name,
          email: values.email,
          contact: Number(values.contact),
          sport_id: Number(values.sport_id),
          id_type: values.id_type as 'aadhar' | 'pan' | 'school_id' | 'college_id',
          id_proof: values.id_proof,
          birthdate: values.birthdate,
          height: values.height ? Number(values.height) : undefined,
          weight: values.weight ? Number(values.weight) : undefined,
        };

        const result = isEditMode
          ? await updatePlayer({
              id: player!.id,
              ...payload,
              status: values.status as 'active' | 'inactive',
            })
          : await createPlayer(payload);

        setSubmitting(false);

        if (result.error) {
          setServerError(result.error);
          return;
        }

        router.push('/players');
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="flex flex-col gap-6">
          <Input name="name" label="Player Name" placeholder="e.g. Rohan Sharma" />
          <Input name="email" label="Email" type="email" placeholder="player@example.com" />
          <Input name="contact" label="Contact Number" placeholder="10-digit number" />

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

          <div className="flex flex-col gap-2">
            <label htmlFor="id_type" className="text-sm font-medium text-app-text">
              ID Type
            </label>
            <select
              id="id_type"
              name="id_type"
              value={values.id_type}
              onChange={(e) => setFieldValue('id_type', e.target.value)}
              className="h-8 rounded-lg border-2 border-input-border px-4 text-base text-app-text outline-none"
            >
              <option value="">Select ID type</option>
              <option value="aadhar">Aadhar</option>
              <option value="pan">PAN</option>
              <option value="school_id">School ID</option>
              <option value="college_id">College ID</option>
            </select>
          </div>

          <Input name="id_proof" label="ID Proof Number" placeholder="e.g. 1234 5678 9012" />

          <Input name="birthdate" label="Birthdate" type="date" max={today} />

          <Input name="height" label="Height (cm)" type="number" placeholder="Optional" />
          <Input name="weight" label="Weight (kg)" type="number" placeholder="Optional" />

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
            <Button type="button" variant="secondary" onClick={() => router.push('/players')}>
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}