import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { FinancialSummary, CategoryTotal, Trend } from '../types/dashboard.types';
import { RECORDS_API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';

export const Dashboard: React.FC = () => {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${RECORDS_API_BASE_URL}${API_ENDPOINTS.RECORDS.SUMMARY}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch summary data');
        }

        const data = await response.json();
        if (data.success && data.summary) {
          setSummary(data.summary);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchSummary();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Finance Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : summary ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <SummaryCard
                title="Total Income"
                value={`$${summary.totalIncome.toLocaleString()}`}
                icon="�"
                color="green"
              />
              <SummaryCard
                title="Total Expenses"
                value={`$${summary.totalExpenses.toLocaleString()}`}
                icon="�"
                color="red"
              />
              <SummaryCard
                title="Net Balance"
                value={`$${summary.netBalance.toLocaleString()}`}
                icon="�"
                color="blue"
              />
            </div>

            {summary.categoryTotals && summary.categoryTotals.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <CategoryColumn
                  title="Income"
                  type="income"
                  categories={summary.categoryTotals.filter((c) => c.type === 'income')}
                />
                <CategoryColumn
                  title="Expenses"
                  type="expense"
                  categories={summary.categoryTotals.filter((c) => c.type === 'expense')}
                />
              </div>
            )}

            {summary.trends && summary.trends.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h2>
                <div className="space-y-3">
                  {summary.trends.map((trend) => (
                    <TrendItem key={trend.period} trend={trend} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'red';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
};

const CategoryColumn: React.FC<{ title: string; type: 'income' | 'expense'; categories: CategoryTotal[] }> = ({ title, type, categories }) => {
  const isIncome = type === 'income';
  const total = categories.reduce((sum, c) => sum + Number(c.total), 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
          ${total.toLocaleString()}
        </span>
      </div>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={`${cat.category}-${cat.type}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{cat.category}</p>
            <p className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
              ${Number(cat.total).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatPeriod = (period: string): string => {
  const [year, month] = period.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const TrendItem: React.FC<{ trend: Trend }> = ({ trend }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <p className="font-medium text-gray-900">{formatPeriod(trend.period)}</p>
      <div className="flex gap-6">
        <span className="text-green-600 font-medium">+${trend.income.toLocaleString()}</span>
        <span className="text-red-600 font-medium">-${trend.expense.toLocaleString()}</span>
      </div>
    </div>
  );
};
