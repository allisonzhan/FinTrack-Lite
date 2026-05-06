// Displays recurring transactions due within the next 7 days, derived from the provided transaction list.
import React from 'react';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

export default function UpcomingTransactions({ transactions }: Props) {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcoming = transactions
    .filter(t => t.isRecurring && t.nextDueDate)
    .map(t => {
      const dueDate = new Date(t.nextDueDate!);
      if (dueDate >= now && dueDate <= nextWeek) {
        return { ...t, dueDate };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.dueDate.getTime() - b!.dueDate.getTime());

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No upcoming recurring transactions this week.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {upcoming.map(t => (
        <div key={t!.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${t!.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm font-medium text-gray-800">{t!.category}</span>
          </div>
          <span className={`text-sm font-semibold ${t!.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {t!.type === 'income' ? '+' : '-'}${t!.amount.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}