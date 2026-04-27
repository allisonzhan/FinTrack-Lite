import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import {
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getSavingsRate,
} from '../utils/calculations';

interface CardProps {
  title: string;
  value: string;
  accent: string;
  sub?: string;
}

function Card({ title, value, accent, sub }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${accent}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function SummaryCards() {
  const { transactions } = useTransactions();
  const income = getTotalIncome(transactions);
  const expenses = getTotalExpenses(transactions);
  const balance = getBalance(transactions);
  const savingsRate = getSavingsRate(income, expenses);

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        title="Balance"
        value={fmt(balance)}
        accent={balance >= 0 ? 'border-blue-500' : 'border-red-500'}
      />
      <Card title="Total Income" value={fmt(income)} accent="border-green-500" />
      <Card title="Total Expenses" value={fmt(expenses)} accent="border-red-500" />
      <Card
        title="Savings Rate"
        value={`${savingsRate.toFixed(1)}%`}
        accent="border-purple-500"
        sub={income > 0 ? `Saved ${fmt(income - expenses)}` : 'No income recorded'}
      />
    </div>
  );
}
