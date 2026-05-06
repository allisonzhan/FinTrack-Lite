import { Transaction } from '../types';

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpenses(transactions);
}

export function getSavingsRate(income: number, expenses: number): number {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
}

export function getExpensesByCategory(
  transactions: Transaction[]
): { name: string; value: number }[] {
  const map: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function getBalanceOverTime(
  transactions: Transaction[]
): { date: string; balance: number }[] {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let running = 0;
  return sorted.map((t) => {
    running += t.type === 'income' ? t.amount : -t.amount;
    return { date: t.date, balance: parseFloat(running.toFixed(2)) };
  });
}
