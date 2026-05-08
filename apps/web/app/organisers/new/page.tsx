'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  contact: Yup.string()
    .matches(/^\d{10}$/, 'Contact must be exactly 10 digits')
    .required('Contact is required'),
  sport: Yup.string().required('Sport is required'),
});

interface FormValues {
  name: string;
  email: string;
  username: string;
  password: string;
  contact: string;
  sport: string;
}

export default function NewOrganiserPage() {
  const router = useRouter();

  const initialValues: FormValues = {
    name: '',
    email: '',
    username: '',
    password: '',
    contact: '',
    sport: '',
  };

  const handleSubmit = async (values: FormValues, { setSubmitting, setStatus }: { setSubmitting: (isSubmitting: boolean) => void; setStatus: (status: string | null) => void }) => {
    setStatus(null);

    try {
      const response = await fetch(`${API_BASE}/organisers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          username: values.username,
          password: values.password,
          contact: values.contact,
          sport: values.sport,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create organiser");
      }

      router.push("/organisers");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl">
        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
              Add organiser
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-300">
              Create a new tournament organiser and return to the organisers list once the organiser has been added.
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="block">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Name
                    </label>
                    <Field
                      name="name"
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    />
                  </div>

                  <div className="block">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Email
                    </label>
                    <Field
                      name="email"
                      type="email"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    />
                  </div>

                  <div className="block">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Username
                    </label>
                    <Field
                      name="username"
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    />
                  </div>

                  <div className="block">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Password
                    </label>
                    <Field
                      name="password"
                      type="password"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="block">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Contact
                    </label>
                    <Field
                      name="contact"
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                    <ErrorMessage
                      name="contact"
                      component="div"
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    />
                  </div>

                  <div className="block">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Sport
                    </label>
                    <Field
                      name="sport"
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                    <ErrorMessage
                      name="sport"
                      component="div"
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    />
                  </div>
                </div>

                {status ? (
                  <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                    {status}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
                  >
                    {isSubmitting ? "Saving…" : "Create organiser"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
