import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppLayout } from '@/components/AppLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrencyCompact, personFullName } from '@/types';

// ── Data derivations ──────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function paymentsOverTime(payments: any[]) {
  const today = new Date('2026-03-18');
  return Array.from({ length: 6 }, (_, i) => {
    const d   = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const total = payments
      .filter(p => String(p.paymentDate ?? p.payment_date ?? '').startsWith(key))
      .reduce((s, p) => s + (p.paymentAmount ?? p.amount ?? 0), 0);
    return { month: MONTHS[d.getMonth()], amount: total };
  });
}

const STATUS_COLORS: Record<string, string> = {
  PAID: '#79e19b', PARTIALLY_PAID: '#f59e0b', UNPAID: '#6b7280', OVERDUE: '#f87171',
};
const STATUS_LABELS: Record<string, string> = {
  PAID: 'Paid', PARTIALLY_PAID: 'Partial', UNPAID: 'Unpaid', OVERDUE: 'Overdue',
};

function loanStatusData(transactions: any[]) {
  const counts: Record<string, number> = { PAID: 0, PARTIALLY_PAID: 0, UNPAID: 0, OVERDUE: 0 };
  transactions.forEach(t => {
    const key = t.status ?? 'UNPAID';
    counts[key] = (counts[key] ?? 0) + 1;
  });
  return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({
    name, value, label: STATUS_LABELS[name] ?? name,
  }));
}

function topPeopleData(transactions: any[], persons: any[]) {
  const totals: Record<string, number> = {};
  transactions
    .filter(t => t.transactionType === 'LEND')
    .forEach(t => {
      const pid = t.borrowerContactId ?? '';
      totals[pid] = (totals[pid] ?? 0) + (t.amountBorrowed ?? 0);
    });
  return Object.entries(totals)
    .map(([pid, amount]) => {
      const person = persons.find(p => p.id === pid);
      const name = person ? personFullName(person) : pid;
      return { name: name.length > 14 ? name.slice(0, 13) + '…' : name, amount };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

function receivablesVsPayables(transactions: any[]) {
  const out = { receivable: 0, payable: 0 };
  transactions.forEach(t => {
    if (t.transactionType === 'LEND' || t.transactionType === 'GROUP_EXPENSE') {
      out.receivable += t.amountRemaining ?? 0;
    } else if (t.transactionType === 'BORROW') {
      out.payable += t.amountRemaining ?? 0;
    }
  });
  return [
    { label: 'Receivable', amount: out.receivable },
    { label: 'Payable',    amount: out.payable },
  ];
}

const tooltip = {
  contentStyle: { backgroundColor: '#181d24', border: '1px solid #2a3140', borderRadius: '8px', fontSize: 12 },
  labelStyle: { color: '#e5e5e5' },
  itemStyle: { color: '#79e19b' },
};

function ChartCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 min-w-0 overflow-hidden">
      <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5 mb-3 sm:mb-4">{sub}</p>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { transactions, payments, persons } = useApp();
  const timeData    = paymentsOverTime(payments);
  const statusData  = loanStatusData(transactions);
  const topPeople   = topPeopleData(transactions, persons);
  const rvpData     = receivablesVsPayables(transactions);

  const totalLent = transactions
    .filter(t => t.transactionType === 'LEND')
    .reduce((s, t) => s + (t.amountBorrowed ?? 0), 0);
  const totalCollected = payments
    .reduce((s, p) => s + (p.paymentAmount ?? p.amount ?? 0), 0);

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 max-w-7xl mx-auto">

        {/* Desktop header */}
        <div className="hidden lg:block mb-2">
          <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of your loans and collections</p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Lent',      value: formatCurrencyCompact(totalLent),      color: 'text-primary' },
            { label: 'Total Collected', value: formatCurrencyCompact(totalCollected),  color: 'text-primary' },
            { label: 'Active Loans',    value: String(transactions.filter(t => t.status !== 'PAID').length), color: 'text-foreground' },
            { label: 'Completed',       value: String(transactions.filter(t => t.status === 'PAID').length),  color: 'text-muted-foreground' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 sm:p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-lg sm:text-xl font-bold font-display mt-0.5 tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="md:col-span-3">
            <ChartCard title="Collections Over Time" sub="Last 6 months · loan payments received">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={timeData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#79e19b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#79e19b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3140" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                  <Tooltip {...tooltip} formatter={(v: number) => [formatCurrencyCompact(v), 'Collected']} />
                  <Area type="monotone" dataKey="amount" stroke="#79e19b" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: '#79e19b' }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="md:col-span-2">
            <ChartCard title="Loan Status" sub="By count">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {statusData.map(e => <Cell key={e.name} fill={STATUS_COLORS[e.name] ?? '#6b7280'} />)}
                  </Pie>
                  <Tooltip {...tooltip} formatter={(v: number, name: string) => [v, STATUS_LABELS[name] ?? name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                {statusData.map(s => (
                  <div key={s.name} className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.name] }} />
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                      {s.label} <span className="text-foreground font-medium">{s.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <ChartCard title="Top Borrowers" sub="By total amount lent">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topPeople} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3140" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip {...tooltip} formatter={(v: number) => [formatCurrencyCompact(v), 'Total Lent']} />
                <Bar dataKey="amount" fill="#79e19b" radius={[0, 4, 4, 0] as any} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Receivables vs Payables" sub="Outstanding balances">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={rvpData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3140" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...tooltip} formatter={(v: number) => [formatCurrencyCompact(v), 'Amount']} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0] as any} maxBarSize={48}>
                  <Cell fill="#79e19b" />
                  <Cell fill="#f87171" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

      </div>
    </AppLayout>
  );
}
