import { TransactionType } from '../types';

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Other'] as const;
export const EXPENSE_CATEGORIES = ['Food', 'Rent', 'Transport', 'Entertainment', 'Utilities'] as const;

export function getCategoriesForType(type: TransactionType): string[] {
  const predefined = type === 'income' ? [...INCOME_CATEGORIES] : [...EXPENSE_CATEGORIES];
  const custom = getCustomCategories(type);
  return [...predefined, ...custom];
}

export function addCustomCategory(type: TransactionType, category: string) {
  const key = `fintrack_custom_${type}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  if (!existing.includes(category)) {
    existing.push(category);
    localStorage.setItem(key, JSON.stringify(existing));
  }
}

function getCustomCategories(type: TransactionType): string[] {
  const key = `fintrack_custom_${type}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
