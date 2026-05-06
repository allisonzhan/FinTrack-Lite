// Renders a pie chart of expenses by category and an area chart of running balance over time using Recharts.
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useTransactions } from '../context/TransactionContext';
import { getExpensesByCategory, getBalanceOverTime } from '../utils/calculations';

const PIE_COLORS = [
  'hsl(160, 84%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 55%)',
  'hsl(200, 80%, 50%)',
  'hsl(280, 70%, 60%)',
  'hsl(120, 50%, 45%)',
];

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
      <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-sm">{label}</p>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name?: string;
    dataKey?: string;
    color?: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl">
      {label && <p className="text-xs text-muted-foreground mb-1">{label}</p>}
      {payload.map((entry, index) => (
        <div key={index} className="space-y-1">
          {entry.name && <p className="text-xs text-muted-foreground">{entry.name}</p>}
          <p className="text-sm font-medium text-foreground">
            {entry.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ChartComponent() {
  const { transactions } = useTransactions();
  const pieData = getExpensesByCategory(transactions);
  const lineData = getBalanceOverTime(transactions);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Expenses by Category */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">Expenses by Category</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Breakdown of your spending</p>
        </div>
        {pieData.length === 0 ? (
          <EmptyState label="No expense data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                label={false}
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell 
                    key={i} 
                    fill={PIE_COLORS[i % PIE_COLORS.length]} 
                    stroke="hsl(220, 14%, 10%)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: '20px', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}
                formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Balance Over Time */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-foreground">Balance Over Time</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Your financial trajectory</p>
        </div>
        {lineData.length === 0 ? (
          <EmptyState label="No transaction data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={lineData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(220, 14%, 18%)" 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: 'hsl(220, 10%, 55%)' }} 
                tickLine={false}
                axisLine={{ stroke: 'hsl(220, 14%, 18%)' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(220, 10%, 55%)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="hsl(160, 84%, 45%)"
                strokeWidth={2}
                fill="url(#balanceGradient)"
                dot={{ r: 4, fill: 'hsl(220, 14%, 10%)', stroke: 'hsl(160, 84%, 45%)', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'hsl(160, 84%, 45%)', stroke: 'hsl(220, 14%, 10%)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
