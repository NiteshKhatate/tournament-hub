'use client';

import { Field, ErrorMessage } from 'formik';

interface InputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}

export default function Input({ name, label, type = 'text', placeholder }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-app-text">
        {label}
      </label>
      <Field
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input-border bg-white px-4 py-3 font-poppins text-sm text-app-text placeholder:text-app-text/35 focus:outline-none"
      />
      <ErrorMessage name={name} component="p" className="text-sm text-red-600" />
    </div>
  );
}