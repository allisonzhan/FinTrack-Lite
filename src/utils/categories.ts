import { TransactionType } from '../types';

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Other'] as const;
export const EXPENSE_CATEGORIES = ['Food', 'Rent', 'Transport', 'Entertainment', 'Utilities'] as const;

export function getCategoriesForType(type: TransactionType): string[] {
  return type === 'income' ? [...INCOME_CATEGORIES] : [...EXPENSE_CATEGORIES];
}

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
