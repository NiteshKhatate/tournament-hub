'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '@/components/common/Input';
import { createSport } from '@/app/(protected)/sports/create/actions';

const CreateSportSchema = Yup.object().shape({
  name: Yup.string()
    .required('Sport name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
});

export default function CreateSportForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  return (
    <Formik
      initialValues={{ name: '' }}
      validationSchema={CreateSportSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setServerError('');
        const { error } = await createSport(values.name);
        setSubmitting(false);

        if (error) {
          setServerError(error);
          return;
        }

        router.push('/sports');
      }}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-6">
          <Input name="name" label="Sport Name" placeholder="e.g. Cricket" />

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-app-text px-5 py-2.5 font-medium text-app-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/sports')}
              className="rounded-lg border-2 border-input-border px-5 py-2.5 font-medium text-app-text transition hover:bg-app-bg"
            >
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}