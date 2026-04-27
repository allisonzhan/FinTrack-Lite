import React from 'react';
import { Transaction } from '../types';
import { useTransactions } from '../context/TransactionContext';

interface Props {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
}

export default function TransactionItem({ transaction, onEdit }: Props) {
  const { deleteTransaction } = useTransactions();
  const { amount, type, category, date, description } = transaction;

  const amountStr = amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
            type === 'income' ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {category}
            {description ? (
              <span className="text-gray-400 font-normal"> · {description}</span>
            ) : null}
          </p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4 flex-shrink-0">
        <span
          className={`text-sm font-semibold ${
            type === 'income' ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {type === 'income' ? '+' : '-'}
          {amountStr}
        </span>
        <button
          onClick={() => onEdit(transaction)}
          className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => deleteTransaction(transaction.id)}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
