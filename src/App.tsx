import React, { useState } from 'react';
import { TransactionProvider } from './context/TransactionContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';

type Page = 'dashboard' | 'transactions';

function Logo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className="text-primary"
    >
      <rect width="28" height="28" rx="6" fill="currentColor" fillOpacity="0.15" />
      <path
        d="M8 10h12M8 14h8M8 18h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="18" r="3" fill="currentColor" />
    </svg>
  );
}

function AppContent() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-foreground font-semibold text-lg tracking-tight">
              FinTrack
            </span>
            <span className="text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full bg-secondary">
              Lite
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
              {(['dashboard', 'transactions'] as Page[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                    page === p
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {page === 'dashboard' ? <Dashboard /> : <TransactionsPage />}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>FinTrack Lite</span>
          <span>Your personal finance companion</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TransactionProvider>
        <AppContent />
      </TransactionProvider>
    </ThemeProvider>
  );
}
