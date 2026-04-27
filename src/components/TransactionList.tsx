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
          <p className="text-gray-400 text-sm text-center py-8">
            No transactions found.
          </p>
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
