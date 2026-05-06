// Renders a scrollable list of TransactionItem rows and manages which item is open for editing.
import React, { useState } from 'react';
import { Transaction } from '../types';
import { useTransactions } from '../context/TransactionContext';
import TransactionItem from './TransactionItem';
import TransactionFormModal from './TransactionFormModal';

interface Props {
  transactions?: Transaction[];
}

export default function TransactionList({ transactions: propTransactions }: Props) {
  const { transactions: allTransactions } = useTransactions();
  const [editing, setEditing] = useState<Transaction | null>(null);

  const transactions = propTransactions ?? allTransactions;

  return (
    <>
      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs mt-1">Add your first transaction to get started</p>
          </div>
        ) : (
          transactions.map((t) => (
            <TransactionItem key={t.id} transaction={t} onEdit={setEditing} />
          ))
        )}
      </div>
      {editing && (
        <TransactionFormModal
          transaction={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
