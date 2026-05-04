import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RECORDS_API_BASE_URL, API_ENDPOINTS } from '../constants/api.constants';

interface FinRecord {
  id: string;
  amount: string;
  type: string;
  category: string;
  date: string;
  notes: string | null;
  created_by: string;
  created_at: string;
}


const getMonthKey = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonthLabel = (key: string) => {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatDay = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const Records: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [records, setRecords] = useState<FinRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [deleteRecord, setDeleteRecord] = useState<FinRecord | null>(null);
  const [editRecord, setEditRecord] = useState<FinRecord | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('income');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editErrors, setEditErrors] = useState<{ amount?: string; category?: string; date?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (user?.role === 'viewer') {
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchRecords();
  }, [filterType, filterCategory]);

  const fetchRecords = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterType) params.set('type', filterType);
      if (filterCategory) params.set('category', filterCategory);
      const query = params.toString() ? `?${params.toString()}` : '';

      const response = await fetch(`${RECORDS_API_BASE_URL}${API_ENDPOINTS.RECORDS.ALL_RECORDS}${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch records');

      setRecords(data.records || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRecord) return;
    try {
      const response = await fetch(`${RECORDS_API_BASE_URL}/api/v1/${deleteRecord.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete');
      }
      setRecords((prev) => prev.filter((r) => r.id !== deleteRecord.id));
      setDeleteRecord(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    }
  };

  const startEdit = (record: FinRecord) => {
    setEditRecord(record);
    setEditAmount(String(record.amount));
    setEditType(record.type);
    setEditCategory(record.category);
    setEditDate(record.date.slice(0, 10));
    setEditNotes(record.notes || '');
    setEditErrors({});
  };

  const closeEdit = () => {
    setEditRecord(null);
    setEditErrors({});
  };

  const validateEdit = (): boolean => {
    const errs: { amount?: string; category?: string; date?: string } = {};
    if (!editAmount || Number(editAmount) <= 0) errs.amount = 'Amount must be positive';
    if (!editCategory.trim()) errs.category = 'Category is required';
    if (!editDate) errs.date = 'Date is required';
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateEdit()) return;
    if (!editRecord) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${RECORDS_API_BASE_URL}/api/v1/${editRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(editAmount),
          type: editType,
          category: editCategory.trim(),
          date: editDate,
          notes: editNotes.trim() || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update');

      setRecords((prev) =>
        prev.map((r) => (r.id === editRecord.id ? { ...r, ...data.record } : r))
      );
      closeEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record');
    } finally {
      setIsSaving(false);
    }
  };

  const uniqueCategories = [...new Set(records.map((r) => r.category))].sort();

  const groupedRecords = records.reduce<{ [key: string]: FinRecord[] }>((acc, record) => {
    const key = getMonthKey(record.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(record);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

  const getMonthTotals = (monthRecords: FinRecord[]) => {
    const income = monthRecords.filter((r) => r.type === 'income').reduce((s, r) => s + Number(r.amount), 0);
    const expense = monthRecords.filter((r) => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0);
    return { income, expense, net: income - expense };
  };

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
              <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {user?.name}</span>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Dashboard
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate('/add-record')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Record
                </button>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Records</h2>
            <p className="text-gray-500 text-sm mt-1">{records.length} records across {sortedMonths.length} months</p>
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-lg">No records found</div>
        ) : (
          <div className="space-y-6">
            {sortedMonths.map((monthKey) => {
              const monthRecords = groupedRecords[monthKey].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              const totals = getMonthTotals(monthRecords);

              return (
                <div key={monthKey} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{formatMonthLabel(monthKey)}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                          +₹{totals.income.toLocaleString('en-IN')}
                        </span>
                        <span className="flex items-center gap-1 text-red-500 font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                          -₹{totals.expense.toLocaleString('en-IN')}
                        </span>
                        <span className={`font-bold ${totals.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          Net: {totals.net >= 0 ? '+' : ''}₹{totals.net.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-50">
                    {monthRecords.map((record) => (
                      <div key={record.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg">
                              {record.type === 'income' ? '💰' : '💸'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{record.category}</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${record.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {formatDay(record.date)}{record.notes ? ` · ${record.notes}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-lg font-bold ${record.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {record.type === 'income' ? '+' : '-'}₹{Number(record.amount).toLocaleString('en-IN')}
                              </span>
                              {isAdmin && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => startEdit(record)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  </button>
                                  <button
                                    onClick={() => setDeleteRecord(record)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeEdit} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-0 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Edit Record</h3>
                  <p className="text-sm text-gray-500">Update record details</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditType('income')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all text-sm font-semibold ${editType === 'income' ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <span>💰</span> Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all text-sm font-semibold ${editType === 'expense' ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <span>💸</span> Expense
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base font-medium"
                  />
                </div>
                {editErrors.amount && <p className="mt-1 text-xs text-red-600">{editErrors.amount}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                {editErrors.category && <p className="mt-1 text-xs text-red-600">{editErrors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                {editErrors.date && <p className="mt-1 text-xs text-red-600">{editErrors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes <span className="text-gray-400">(optional)</span></label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={closeEdit}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteRecord(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm p-0 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-red-50 to-rose-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Record</h3>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete the <span className="font-semibold">{deleteRecord.category}</span> record of <span className={`font-bold ${deleteRecord.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>{deleteRecord.type === 'income' ? '+' : '-'}₹{Number(deleteRecord.amount).toLocaleString('en-IN')}</span>?
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setDeleteRecord(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                No, Keep It
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
