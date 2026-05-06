import React, { useState } from 'react';
import SummaryCards from '../components/SummaryCards';
import ChartComponent from '../components/ChartComponent';
import TransactionList from '../components/TransactionList';
import TransactionFormModal from '../components/TransactionFormModal';
import UpcomingTransactions from '../components/UpcomingTransactions';
import { useTransactions } from '../context/TransactionContext';

export default function Dashboard() {
  const [showAdd, setShowAdd] = useState(false);
  const { transactions } = useTransactions();

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your financial activity and spending patterns
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-primary/25"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Charts */}
      <ChartComponent />

      {/* Upcoming & Recent Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Upcoming Transactions</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Recurring items due this week</p>
            </div>
          </div>
          <UpcomingTransactions transactions={transactions} />
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Recent Transactions</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Your latest financial activity</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              {recent.length} of {transactions.length}
            </span>
          </div>
          <TransactionList transactions={recent} />
        </div>
      </div>

      {showAdd && <TransactionFormModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
