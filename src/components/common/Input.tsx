'use client';

import { useField } from 'formik';
import { ErrorMessage } from 'formik';
import { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string;
  label: string;
}

export default function Input({ name, label, ...rest }: InputProps) {
  const [field, meta] = useField(name);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-app-text">
        {label}
      </label>
      <input
        id={name}
        {...field}
        {...rest}
        className="h-8 rounded-lg border-2 border-input-border px-4 text-base text-app-text outline-none"
      />
      {meta.touched && meta.error && (
        <p className="text-sm text-red-600">{meta.error}</p>
      )}
    </div>
  );
}