import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FormContainer } from '../components/forms/FormContainer';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { VALIDATION } from '../constants/api.constants';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!VALIDATION.EMAIL_REGEX.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer title="Welcome Back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
          placeholder="Enter your email"
          required
          disabled={isLoading}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          placeholder="Enter your password"
          required
          disabled={isLoading}
        />
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>
        )}
        <Button
          type="submit"
          isLoading={isLoading}
          fullWidth
          size="lg"
        >
          Sign In
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
          Sign up
        </Link>
      </p>
    </FormContainer>
  );
};
