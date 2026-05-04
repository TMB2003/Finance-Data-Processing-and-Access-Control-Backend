import React from 'react';

interface FormContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const FormContainer: React.FC<FormContainerProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
};
