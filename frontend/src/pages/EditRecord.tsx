import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RECORDS_API_BASE_URL } from '../constants/api.constants';

export const EditRecord: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/records', { replace: true });
      return;
    }
    if (id) fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${RECORDS_API_BASE_URL}/api/v1/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Record not found');

      const record = data.record || data;
      setAmount(String(record.amount));
      setType(record.type);
      setCategory(record.category);
      setDate(record.date.slice(0, 10));
      setNotes(record.notes || '');
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Failed to fetch record' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; category?: string; date?: string } = {};

    if (!amount || Number(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setErrors({});

    try {
      const response = await fetch(`${RECORDS_API_BASE_URL}/api/v1/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          type,
          category: category.trim(),
          date,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update record');

      navigate('/records');
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Failed to update record' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">₹</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Finance Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/records')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Records
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Record</h2>
            <p className="mt-1 text-gray-500">Update the record details</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${type === 'income' ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  <input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => setType('income')} className="sr-only" />
                  <span className="text-lg">💰</span>
                  <span className="font-semibold">Income</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${type === 'expense' ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  <input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => setType('expense')} className="sr-only" />
                  <span className="text-lg">💸</span>
                  <span className="font-semibold">Expense</span>
                </label>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isSaving}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white disabled:bg-gray-50 disabled:cursor-not-allowed text-lg font-medium"
                />
              </div>
              {errors.amount && <p className="mt-1.5 text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Salary, Rent, Groceries"
                disabled={isSaving}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              {errors.category && <p className="mt-1.5 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSaving}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              {errors.date && <p className="mt-1.5 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows={3}
                disabled={isSaving}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
              />
            </div>

            {errors.general && (
              <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/records')}
                className="flex-1 px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
