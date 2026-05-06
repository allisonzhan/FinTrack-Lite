// Transactions page: full transaction list with type/category/date filters, CSV import/export, and add/edit modal.
import React, { useRef, useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { useTransactions } from '../context/TransactionContext';
import TransactionList from '../components/TransactionList';
import TransactionFormModal from '../components/TransactionFormModal';
import { ALL_CATEGORIES } from '../utils/categories';

export default function TransactionsPage() {
  const { transactions, addTransaction } = useTransactions();
  const [showAdd, setShowAdd] = useState(false);
  const [filterType, setFilterType] = useState<TransactionType | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [csvMessage, setCsvMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasFilters = filterType || filterCategory || filterDateFrom || filterDateTo;

  const filtered = useMemo(() => {
    return [...transactions]
      .filter((t) => !filterType || t.type === filterType)
      .filter((t) => !filterCategory || t.category === filterCategory)
      .filter((t) => !filterDateFrom || t.date >= filterDateFrom)
      .filter((t) => !filterDateTo || t.date <= filterDateTo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterCategory, filterDateFrom, filterDateTo]);

  function clearFilters() {
    setFilterType('');
    setFilterCategory('');
    setFilterDateFrom('');
    setFilterDateTo('');
  }

  const inputClasses = "bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";
  const selectClasses = `${inputClasses} appearance-none pr-8`;
  const selectStyle = { 
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
    backgroundPosition: 'right 0.5rem center', 
    backgroundRepeat: 'no-repeat', 
    backgroundSize: '1.5em 1.5em' 
  };

  const csvFileName = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `transactions_${now.getFullYear()}-${month}.csv`;
  };

  const normalizeType = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'income' || normalized === 'expense') return normalized;
    return null;
  };

  const isValidDate = (value: string) => {
    const parsed = new Date(value);
    return value.trim() !== '' && !Number.isNaN(parsed.getTime());
  };

  const formatCSVValue = (value: string | number | undefined) => {
    if (value === undefined || value === null) return '';
    const stringValue = String(value);
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const buildCSV = (items: Transaction[]) => {
    const columns = ['date', 'type', 'category', 'amount', 'note'];
    const rows = items.map((item) => [
      formatCSVValue(item.date),
      formatCSVValue(item.type),
      formatCSVValue(item.category),
      formatCSVValue(item.amount),
      formatCSVValue(item.description ?? ''),
    ]);
    return [columns.join(','), ...rows.map((row) => row.join(','))].join('\n');
  };

  const downloadCSV = () => {
    const csv = buildCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', csvFileName());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCSVLine = (line: string) => {
    const values: string[] = [];
    let field = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(field);
        field = '';
      } else {
        field += char;
      }
    }

    values.push(field);
    return values.map((value) => value.trim());
  };

  const parseCSV = (text: string) => {
    const lines = text.replace(/\r/g, '').split('\n').filter((line) => line.trim() !== '');
    if (lines.length === 0) {
      return { rows: [] as Record<string, string>[], error: 'CSV file is empty or not valid.' };
    }

    const headers = parseCSVLine(lines[0]).map((header) => header.trim().toLowerCase());
    const recognizedHeaders = ['date', 'type', 'amount', 'category', 'note'];
    const headerSet = new Set(headers);
    const hasRecognizedHeader = recognizedHeaders.some((header) => headerSet.has(header));

    if (!hasRecognizedHeader) {
      return { rows: [] as Record<string, string>[], error: 'No recognizable CSV headers found.' };
    }

    const rows = lines.slice(1).map((line) => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? '';
      });
      return row;
    });

    return { rows, error: null as string | null };
  };

  const handleImportText = (text: string) => {
    const parseResult = parseCSV(text);
    if (parseResult.error) {
      setCsvMessage({ type: 'error', text: parseResult.error });
      return;
    }

    const importedRows: Omit<Transaction, 'id'>[] = [];
    let skipped = 0;
    const existingMatches = new Set(
      transactions.map((t) => `${t.date}::${t.amount}::${t.category}`)
    );

    parseResult.rows.forEach((row) => {
      const dateValue = (row.date ?? '').trim();
      const typeValue = normalizeType(row.type ?? '');
      const amountValue = row.amount
        ? parseFloat(row.amount.replace(/[^0-9.-]/g, '').trim())
        : NaN;
      const categoryValue = (row.category ?? '').trim();
      const noteValue = (row.note ?? '').trim();

      if (!dateValue || !typeValue || Number.isNaN(amountValue) || !categoryValue || !isValidDate(dateValue)) {
        skipped += 1;
        return;
      }

      const duplicateKey = `${dateValue}::${amountValue}::${categoryValue}`;
      if (existingMatches.has(duplicateKey)) {
        skipped += 1;
        return;
      }

      existingMatches.add(duplicateKey);
      importedRows.push({
        date: dateValue,
        type: typeValue,
        amount: amountValue,
        category: categoryValue,
        description: noteValue || undefined,
      });
    });

    importedRows.forEach((row) => {
      addTransaction({
        amount: row.amount,
        type: row.type,
        category: row.category,
        date: row.date,
        description: row.description,
      });
    });

    setCsvMessage({
      type: 'success',
      text: `${importedRows.length} imported, ${skipped} skipped`,
    });
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCsvMessage(null);
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvMessage({ type: 'error', text: 'Please select a valid CSV file.' });
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (typeof text === 'string') {
        handleImportText(text);
      } else {
        setCsvMessage({ type: 'error', text: 'Unable to read the selected CSV file.' });
      }
      event.target.value = '';
    };
    reader.onerror = () => {
      setCsvMessage({ type: 'error', text: 'Error reading the CSV file.' });
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage all your transactions
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-foreground text-sm font-medium px-4 py-2.5 rounded-lg transition-colors border border-border"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-foreground text-sm font-medium px-4 py-2.5 rounded-lg transition-colors border border-border"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Import CSV
          </button>
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
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleImportFile}
      />
      {csvMessage && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${csvMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-destructive-50 border-destructive-200 text-destructive-700'}`}>
          {csvMessage.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium text-foreground">Filters</span>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TransactionType | '')}
            className={selectClasses}
            style={selectStyle}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={selectClasses}
            style={selectStyle}
          >
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className={inputClasses}
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className={inputClasses}
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}

          <span className="ml-auto text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
            {filtered.length} of {transactions.length} transactions
          </span>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-card rounded-xl border border-border p-6">
        <TransactionList transactions={filtered} />
      </div>

      {showAdd && <TransactionFormModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
