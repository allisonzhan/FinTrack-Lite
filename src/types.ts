// Shared TypeScript types and interfaces used across the application.
export type TransactionType = 'income' | 'expense';

export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  description?: string;
  isRecurring?: boolean;
  frequency?: Frequency;
  nextDueDate?: string;
}
