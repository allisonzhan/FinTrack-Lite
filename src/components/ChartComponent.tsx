import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useTransactions } from '../context/TransactionContext';
import { getExpensesByCategory, getBalanceOverTime } from '../utils/calculations';

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
      {label}
    </div>
  );
}

export default function ChartComponent() {
  const { transactions } = useTransactions();
  const pieData = getExpensesByCategory(transactions);
  const lineData = getBalanceOverTime(transactions);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Expenses by Category</h3>
        {pieData.length === 0 ? (
          <EmptyState label="No expense data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Balance Over Time</h3>
        {lineData.length === 0 ? (
          <EmptyState label="No transaction data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                }
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
