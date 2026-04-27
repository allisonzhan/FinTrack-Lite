import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { useTransactions } from '../context/TransactionContext';
import { getCategoriesForType } from '../utils/categories';

interface Props {
  transaction?: Transaction;
  onClose: () => void;
}

interface FormState {
  amount: string;
  type: TransactionType;
  category: string;
  date: string;
  description: string;
}

export default function TransactionFormModal({ transaction, onClose }: Props) {
  const { addTransaction, updateTransaction } = useTransactions();
  const isEdit = transaction !== undefined;

  const [form, setForm] = useState<FormState>(
    transaction
      ? {
          amount: String(transaction.amount),
          type: transaction.type,
          category: transaction.category,
          date: transaction.date,
          description: transaction.description ?? '',
        }
      : {
          amount: '',
          type: 'expense',
          category: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
        }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const categories = getCategoriesForType(form.type);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'type') next.category = '';
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    const parsed = parseFloat(form.amount);
    if (!form.amount || isNaN(parsed) || parsed <= 0) {
      e.amount = 'Amount must be greater than 0';
    }
    if (!form.category) e.category = 'Category is required';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
      description: form.description,
    };

    if (isEdit && transaction) {
      updateTransaction({ ...data, id: transaction.id });
    } else {
      addTransaction(data);
    }
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none w-6 h-6 flex items-center justify-center"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(['income', 'expense'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setField('type', t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.type === t
                    ? t === 'income'
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {t === 'income' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setField('amount', e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="e.g. Lunch at campus"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
