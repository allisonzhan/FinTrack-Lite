import React, { useState } from 'react';
import { Transaction, TransactionType, Frequency } from '../types';
import { useTransactions } from '../context/TransactionContext';
import { getCategoriesForType, addCustomCategory } from '../utils/categories';

interface Props {
  transaction?: Transaction;
  onClose: () => void;
}

interface FormState {
  amount: string;
  type: TransactionType;
  category: string;
  customCategory: string;
  date: string;
  description: string;
  isRecurring: boolean;
  frequency: Frequency;
  nextDueDate: string;
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
          customCategory: '',
          date: transaction.date,
          description: transaction.description ?? '',
          isRecurring: transaction.isRecurring ?? false,
          frequency: transaction.frequency ?? 'monthly',
          nextDueDate: transaction.nextDueDate ?? transaction.date,
        }
      : {
          amount: '',
          type: 'expense',
          category: '',
          customCategory: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          isRecurring: false,
          frequency: 'monthly',
          nextDueDate: new Date().toISOString().split('T')[0],
        }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const categories = getCategoriesForType(form.type);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'type') {
        next.category = '';
        next.customCategory = '';
      }
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
    if (!form.category && !form.customCategory.trim()) e.category = 'Category is required';
    if (!form.date) e.date = 'Date is required';
    if (form.isRecurring && !form.nextDueDate) e.nextDueDate = 'Next due date is required for recurring';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory = form.customCategory.trim() || form.category;
    if (form.customCategory.trim()) {
      addCustomCategory(form.type, form.customCategory.trim());
    }

    const data = {
      amount: parseFloat(form.amount),
      type: form.type,
      category: finalCategory,
      date: form.date,
      description: form.description,
      isRecurring: form.isRecurring,
      frequency: form.isRecurring ? form.frequency : undefined,
      nextDueDate: form.isRecurring ? form.nextDueDate : undefined,
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
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEdit ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEdit ? 'Update the transaction details' : 'Record a new income or expense'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 rounded-lg bg-secondary">
            {(['income', 'expense'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setField('type', t)}
                className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                  form.type === t
                    ? t === 'income'
                      ? 'bg-success text-success-foreground shadow-sm'
                      : 'bg-destructive text-destructive-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'income' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setField('amount', e.target.value)}
                placeholder="0.00"
                className="w-full bg-secondary border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            {errors.amount && (
              <p className="text-destructive text-xs mt-1.5">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={form.customCategory}
              onChange={(e) => setField('customCategory', e.target.value)}
              placeholder="Or enter custom category"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all mt-2"
            />
            {errors.category && (
              <p className="text-destructive text-xs mt-1.5">{errors.category}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.date && (
              <p className="text-destructive text-xs mt-1.5">{errors.date}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
              <span className="text-muted-foreground font-normal ml-1">(optional)</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="e.g. Lunch at campus"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) => setField('isRecurring', e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">Recurring Transaction</span>
            </label>
            {form.isRecurring && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setField('frequency', e.target.value as Frequency)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Next Due Date</label>
                  <input
                    type="date"
                    value={form.nextDueDate}
                    onChange={(e) => setField('nextDueDate', e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  {errors.nextDueDate && (
                    <p className="text-destructive text-xs mt-1.5">{errors.nextDueDate}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              {isEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
