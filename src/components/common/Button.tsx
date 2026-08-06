'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  className?: string;
}

interface ButtonAsButton extends BaseProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  href?: undefined;
}

interface ButtonAsLink extends BaseProps {
  href: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-app-text text-app-bg hover:opacity-90',
  secondary: 'border-2 border-input-border text-app-text hover:bg-app-bg',
  danger: 'text-red-600 hover:opacity-70',
};

export default function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    loading = false,
    loadingText,
    fullWidth = false,
    className = '',
  } = props;

  const baseClasses =
    variant === 'danger'
      ? 'text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40'
      : 'inline-block rounded-lg px-5 py-2.5 font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`;

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  const {
    variant: _variant,
    loading: _loading,
    loadingText: _loadingText,
    fullWidth: _fullWidth,
    className: _className,
    children: _children,
    href: _href,
    disabled,
    ...rest
  } = props as ButtonAsButton;

  return (
    <button disabled={disabled || loading} className={combinedClasses} {...rest}>
      {loading ? loadingText ?? 'Loading...' : children}
    </button>
  );
}