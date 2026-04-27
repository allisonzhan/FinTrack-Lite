import React, { useState } from 'react';
import { TransactionProvider } from './context/TransactionContext';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';

type Page = 'dashboard' | 'transactions';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <TransactionProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Nav */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold text-lg tracking-tight">
                FinTrack Lite
              </span>
            </div>
            <div className="flex gap-1">
              {(['dashboard', 'transactions'] as Page[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                    page === p
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {page === 'dashboard' ? <Dashboard /> : <TransactionsPage />}
        </main>
      </div>
    </TransactionProvider>
  );
}
