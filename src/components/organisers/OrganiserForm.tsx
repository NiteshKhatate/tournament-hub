'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { createOrganiser, updateOrganiser } from '@/app/(protected)/organisers/actions';

interface OrganiserFormProps {
  organiser?: {
    id: number;
    name: string;
    email: string | null;
    contact: string | null;
    status: 'active' | 'inactive';
  };
}

export default function OrganiserForm({ organiser }: OrganiserFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const isEditMode = Boolean(organiser);

  const validationShape: Record<string, Yup.AnySchema> = {
    name: Yup.string().required('Name is required').min(2).max(100),
    email: Yup.string().email('Enter a valid email'),
    contact: Yup.string().matches(/^\d{10}$/, 'Enter a valid 10-digit contact number'),
  };

  if (!isEditMode) {
    validationShape.username = Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters');
    validationShape.password = Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters');
    validationShape.confirmPassword = Yup.string()
      .required('Please retype your password')
      .oneOf([Yup.ref('password')], 'Passwords do not match');
  }

  const OrganiserSchema = Yup.object().shape(validationShape);

  return (
    <Formik
      initialValues={{
        name: organiser?.name ?? '',
        email: organiser?.email ?? '',
        contact: organiser?.contact ?? '',
        status: organiser?.status ?? 'active',
        username: '',
        password: '',
        confirmPassword: '',
      }}
      validationSchema={OrganiserSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setServerError('');

        const result = isEditMode
          ? await updateOrganiser({
              id: organiser!.id,
              name: values.name,
              email: values.email,
              contact: values.contact,
              status: values.status as 'active' | 'inactive',
            })
          : await createOrganiser({
              name: values.name,
              email: values.email,
              contact: values.contact,
              username: values.username,
              password: values.password,
            });

        setSubmitting(false);

        if (result.error) {
          setServerError(result.error);
          return;
        }

        router.push('/organisers');
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="flex flex-col gap-6">
          <Input name="name" label="Organiser Name" placeholder="e.g. Nashik Sports Club" />
          <Input name="email" label="Email" type="email" placeholder="organiser@example.com" />
          <Input name="contact" label="Contact Number" placeholder="10-digit number" />

          {!isEditMode && (
            <>
              <Input name="username" label="Username" placeholder="Choose a username" />
              <Input name="password" label="Password" type="password" placeholder="Create a password" />
              <Input
                name="confirmPassword"
                label="Retype Password"
                type="password"
                placeholder="Retype your password"
              />
            </>
          )}

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
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              loadingText={isEditMode ? 'Saving...' : 'Creating...'}
            >
              {isEditMode ? 'Save Changes' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push('/organisers')}>
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}