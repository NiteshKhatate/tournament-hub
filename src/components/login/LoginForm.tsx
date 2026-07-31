'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { loginUser } from '@/services/auth';
import Input from '@/components/common/Input';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      validationSchema={LoginSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setServerError('');
        const { error } = await loginUser(values.username, values.password);
        setSubmitting(false);

        if (error) {
          setServerError(error);
          return;
        }

        router.push('/dashboard');
      }}
    >
      {({ isSubmitting }) => (
        <Form className="flex flex-col gap-7">
          <Input name="username" label="Username" placeholder="Enter your username" />
          <Input name="password" label="Password" type="password" placeholder="Enter your password" />

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 rounded-xl bg-app-text px-4 py-3.5 font-medium text-app-bg shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </Form>
      )}
    </Formik>
  );
}