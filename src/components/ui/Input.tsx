'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  helperText?: string;
  suffix?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  helperText,
  suffix,
  disabled = false,
  required = false,
  name,
  id,
  className,
}: InputProps) {
  const inputId = id ?? name;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            'h-11 w-full rounded-[10px] border bg-white px-3 text-sm text-gray-900 outline-none transition-colors',
            'placeholder:text-gray-400',
            'focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
            error
              ? 'border-danger focus:border-danger focus:ring-red-400/20'
              : 'border-gray-200',
            suffix && 'pr-10',
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {suffix}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
