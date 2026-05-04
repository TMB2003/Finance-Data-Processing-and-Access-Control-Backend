import React from 'react';
import type { FormFieldProps } from '../../types/auth.types';

export const Input: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
}) => {
  const baseStyles = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors';
  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500';
  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${baseStyles} ${errorStyles} ${disabledStyles}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
