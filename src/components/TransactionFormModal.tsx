import React, { useState } from 'react';
import { Transaction, TransactionType, Frequency } from '../types';
import { useTransactions } from '../context/TransactionContext';
import { getCategoriesForType, addCustomCategory, editCustomCategory, deleteCustomCategory } from '../utils/categories';

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
          date: new Date().toISOString().split('T')[0],
          description: '',
          isRecurring: false,
          frequency: 'monthly',
          nextDueDate: new Date().toISOString().split('T')[0],
        }
  );

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const categories = getCategoriesForType(form.type);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'type') {
        next.category = '';
        setIsAddingCategory(false);
        setNewCategoryName('');
        setEditingCategory(null);
        setEditCategoryName('');
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
    if (!form.category) e.category = 'Category is required';
    if (!form.date) e.date = 'Date is required';
    if (form.isRecurring && !form.nextDueDate) e.nextDueDate = 'Next due date is required for recurring';
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

  function handleAddCategory() {
    if (newCategoryName.trim()) {
      addCustomCategory(form.type, newCategoryName.trim());
      setForm(prev => ({ ...prev, category: newCategoryName.trim() }));
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  }

  function handleEditCategory(oldCategory: string, newName: string) {
    if (newName.trim() && newName !== oldCategory) {
      editCustomCategory(form.type, oldCategory, newName.trim());
      if (form.category === oldCategory) {
        setForm(prev => ({ ...prev, category: newName.trim() }));
      }
      setEditingCategory(null);
      setEditCategoryName('');
    }
  }

  function handleDeleteCategory(category: string) {
    deleteCustomCategory(form.type, category);
    if (form.category === category) {
      setForm(prev => ({ ...prev, category: '' }));
    }
  }

  function startEditingCategory(category: string) {
    setEditingCategory(category);
    setEditCategoryName(category);
  }

  function cancelEditingCategory() {
    setEditingCategory(null);
    setEditCategoryName('');
  }

  const isPredefinedCategory = (category: string) => {
    const predefined = form.type === 'income' ? ['Salary', 'Freelance', 'Other'] : ['Food', 'Rent', 'Transport', 'Entertainment', 'Utilities'];
    return predefined.includes(category);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (isDropdownOpen && !target.closest('.category-dropdown')) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
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

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 rounded-lg bg-secondary">
            {(['income', 'expense'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setField('type', t)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
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
            <label className="block text-sm font-medium text-foreground mb-1.5">
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
                className="w-full bg-secondary border border-border rounded-lg pl-7 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            {errors.amount && (
              <p className="text-destructive text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Category
            </label>
            {!isAddingCategory ? (
              <div className="space-y-2">
                {/* Custom Dropdown */}
                <div className="relative category-dropdown">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-left text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all flex items-center justify-between"
                  >
                    <span className={form.category ? 'text-foreground' : 'text-muted-foreground'}>
                      {form.category || 'Select a category'}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {/* Existing categories */}
                      {categories.map((category) => (
                        <div
                          key={category}
                          className="flex items-center justify-between px-3 py-2 hover:bg-secondary cursor-pointer group"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setField('category', category);
                              setIsDropdownOpen(false);
                            }}
                            className="flex-1 text-left text-sm text-foreground hover:text-primary"
                          >
                            {category}
                          </button>
                          {!isPredefinedCategory(category) && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingCategory(category);
                                  setIsDropdownOpen(false);
                                }}
                                className="p-1 text-muted-foreground hover:text-foreground rounded"
                                title="Edit category"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(category);
                                }}
                                className="p-1 text-muted-foreground hover:text-destructive rounded"
                                title="Delete category"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add new category option */}
                      <div className="border-t border-border">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingCategory(true);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-secondary flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add new category...
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inline editing for selected category */}
                {editingCategory && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="flex-1 bg-secondary border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEditCategory(editingCategory, editCategoryName)}
                      className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditingCategory}
                      className="px-2 py-1 border border-border text-xs rounded hover:bg-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCategory}
                    className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90"
                  >
                    Add Category
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }}
                    className="px-3 py-1 border border-border text-sm rounded hover:bg-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {errors.category && (
              <p className="text-destructive text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.date && (
              <p className="text-destructive text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
              <span className="text-muted-foreground font-normal ml-1">(optional)</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="e.g. Lunch at campus"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
              <div className="mt-2 space-y-2">
                <select
                  value={form.frequency}
                  onChange={(e) => setField('frequency', e.target.value as Frequency)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <input
                  type="date"
                  value={form.nextDueDate}
                  onChange={(e) => setField('nextDueDate', e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {errors.nextDueDate && (
                  <p className="text-destructive text-xs mt-1">{errors.nextDueDate}</p>
                )}
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
    </div>
  );
}
