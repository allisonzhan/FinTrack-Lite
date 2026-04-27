import React, { useState } from 'react';
import SummaryCards from '../components/SummaryCards';
import ChartComponent from '../components/ChartComponent';
import TransactionList from '../components/TransactionList';
import TransactionFormModal from '../components/TransactionFormModal';
import { useTransactions } from '../context/TransactionContext';

export default function Dashboard() {
  const [showAdd, setShowAdd] = useState(false);
  const { transactions } = useTransactions();

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add Transaction
        </button>
      </div>

      <SummaryCards />
      <ChartComponent />

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Transactions</h3>
        <TransactionList transactions={recent} />
      </div>

      {showAdd && <TransactionFormModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
