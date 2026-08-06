'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-app-text text-app-bg hover:opacity-90',
  secondary: 'border-2 border-input-border text-app-text hover:bg-app-bg',
  danger: 'text-red-600 hover:opacity-70',
};

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  loadingText,
  fullWidth = false,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  const baseClasses =
    variant === 'danger'
      ? 'text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40'
      : 'rounded-lg px-5 py-2.5 font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? loadingText ?? 'Loading...' : children}
    </button>
  );
}