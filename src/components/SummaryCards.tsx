// Renders four summary cards: current balance, total income, total expenses, and savings rate.
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
  icon: React.ReactNode;
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

function Card({ title, value, icon, trend, variant = 'default' }: CardProps) {
  const variantStyles = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border p-5 gradient-border">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold ${variantStyles[variant]}`}>{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {trend.direction === 'up' && (
                <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend.direction === 'down' && (
                <svg className="w-3 h-3 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {trend.label}
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-secondary text-muted-foreground">
          {icon}
        </div>
      </div>
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
        title="Current Balance"
        value={fmt(balance)}
        variant={balance >= 0 ? 'default' : 'destructive'}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        }
        trend={{ direction: balance >= 0 ? 'up' : 'down', label: balance >= 0 ? 'Positive balance' : 'Negative balance' }}
      />
      <Card
        title="Total Income"
        value={fmt(income)}
        variant="success"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <Card
        title="Total Expenses"
        value={fmt(expenses)}
        variant="destructive"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
      />
      <Card
        title="Savings Rate"
        value={`${savingsRate.toFixed(1)}%`}
        variant={savingsRate >= 20 ? 'success' : savingsRate > 0 ? 'warning' : 'destructive'}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        trend={{
          direction: savingsRate >= 20 ? 'up' : savingsRate > 0 ? 'neutral' : 'down',
          label: income > 0 ? `Saved ${fmt(income - expenses)}` : 'No income recorded'
        }}
      />
    </div>
  );
}
