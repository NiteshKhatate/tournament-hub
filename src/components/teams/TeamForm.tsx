'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { createTeam, updateTeam, updateTeamStatus } from '@/app/(protected)/teams/actions';
import { supabase } from '@/lib/supabase';

interface TeamFormProps {
  team?: {
    id: number;
    name: string;
    sport_id: number;
    login_id: number;
    email: string;
    contact: number;
    status: 'active' | 'inactive';
  };
}

interface Sport {
  id: number;
  name: string;
}

const CreateTeamSchema = Yup.object().shape({
  name: Yup.string().required('Team name is required').min(2).max(200),
  sport_id: Yup.number().required('Sport is required'),
  username: Yup.string()
    .required('Username is required')
    .min(3)
    .max(50)
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  contact: Yup.string()
    .required('Contact number is required')
    .matches(/^\d{10}$/, 'Enter a valid 10-digit contact number'),
});

const EditTeamSchema = Yup.object().shape({
  name: Yup.string().required('Team name is required').min(2).max(200),
  sport_id: Yup.number().required('Sport is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  contact: Yup.string()
    .required('Contact number is required')
    .matches(/^\d{10}$/, 'Enter a valid 10-digit contact number'),
});

export default function TeamForm({ team }: TeamFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const isEditMode = Boolean(team);

  useEffect(() => {
    const fetchData = async () => {
      const sportsResult = await supabase.from('sports').select('id, name').order('name');

      if (sportsResult.data) {
        setSports(sportsResult.data as Sport[]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Loading sports...</div>;
  }

  return (
    <Formik
      initialValues={{
        name: team?.name ?? '',
        sport_id: team?.sport_id ?? '',
        username: '',
        password: '',
        confirmPassword: '',
        email: team?.email ?? '',
        contact: team?.contact ?? '',
        status: team?.status ?? 'active',
      }}
      validationSchema={isEditMode ? EditTeamSchema : CreateTeamSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setServerError('');

        let result;
        if (isEditMode) {
          // For edit, only update team details, status separately
          result = await updateTeam({
            id: team!.id,
            name: values.name,
            sport_id: Number(values.sport_id),
            email: values.email,
            contact: Number(values.contact),
            status: values.status as 'active' | 'inactive',
          });

          // If status changed, also update login status
          if (team!.status !== values.status) {
            await updateTeamStatus({
              id: team!.id,
              status: values.status as 'active' | 'inactive',
            });
          }
        } else {
          // For create, username/password required
          result = await createTeam({
            name: values.name,
            sport_id: Number(values.sport_id),
            username: values.username,
            password: values.password,
            email: values.email,
            contact: Number(values.contact),
          });
        }

        setSubmitting(false);

        if (result.error) {
          setServerError(result.error);
          return;
        }

        router.push('/teams');
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="flex flex-col gap-6">
          <Input name="name" label="Team Name" placeholder="e.g. City Warriors" />

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

          {!isEditMode && (
            <>
              <Input
                name="username"
                label="Username"
                placeholder="e.g. city_warriors"
              />
              <Input
                name="password"
                label="Password"
                type="password"
                placeholder="Min 6 characters"
              />
              <Input
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
              />
            </>
          )}

          <Input name="email" label="Email" type="email" placeholder="team@example.com" />
          <Input name="contact" label="Contact Number" placeholder="10-digit number" />

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
            <Button type="button" variant="secondary" onClick={() => router.push('/teams')}>
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}