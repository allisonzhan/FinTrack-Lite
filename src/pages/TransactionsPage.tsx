import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { useTransactions } from '../context/TransactionContext';
import TransactionList from '../components/TransactionList';
import TransactionFormModal from '../components/TransactionFormModal';
import { ALL_CATEGORIES } from '../utils/categories';

export default function TransactionsPage() {
  const { transactions } = useTransactions();
  const [showAdd, setShowAdd] = useState(false);
  const [filterType, setFilterType] = useState<TransactionType | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const hasFilters = filterType || filterCategory || filterDateFrom || filterDateTo;

  const filtered = useMemo(() => {
    return [...transactions]
      .filter((t) => !filterType || t.type === filterType)
      .filter((t) => !filterCategory || t.category === filterCategory)
      .filter((t) => !filterDateFrom || t.date >= filterDateFrom)
      .filter((t) => !filterDateTo || t.date <= filterDateTo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterCategory, filterDateFrom, filterDateTo]);

  function clearFilters() {
    setFilterType('');
    setFilterCategory('');
    setFilterDateFrom('');
    setFilterDateTo('');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Transactions</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TransactionType | '')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} of {transactions.length} transactions
          </span>
        </div>
      </div>

      <TransactionList transactions={filtered} />

      {showAdd && <TransactionFormModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
