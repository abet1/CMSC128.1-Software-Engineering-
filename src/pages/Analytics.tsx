import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppLayout } from '@/components/AppLayout';
import { mockRentals, mockPayments, mockProducts } from '@/api/mock';
import { formatCurrencyCompact } from '@/types';

// ── Data derivations ──────────────────────────────────────────────────────────
const rentalPayments = mockPayments.filter(p => p.rental_id);
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function revenueByMonth() {
  const today = new Date('2026-03-08');
  return Array.from({ length: 6 }, (_, i) => {
    const d   = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      month: MONTHS[d.getMonth()],
      revenue: rentalPayments.filter(p => p.payment_date.startsWith(key)).reduce((s, p) => s + p.amount, 0),
    };
  });
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#60a5fa', COMPLETED: '#79e19b', OVERDUE: '#f87171', CANCELLED: '#6b7280',
};

function rentalStatusData() {
  const counts: Record<string, number> = { ACTIVE: 0, COMPLETED: 0, OVERDUE: 0, CANCELLED: 0 };
  mockRentals.forEach(r => { counts[r.status] = (counts[r.status] ?? 0) + 1; });
  return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
}

function topProductsData() {
  const rev: Record<string, number> = {};
  rentalPayments.forEach(p => {
    const rental = mockRentals.find(r => r.id === p.rental_id);
    if (rental) rev[rental.product_id] = (rev[rental.product_id] ?? 0) + p.amount;
  });
  return Object.entries(rev)
    .map(([pid, revenue]) => {
      const product = mockProducts.find(p => p.id === pid);
      const label = product ? `${product.brand ?? ''} ${product.model ?? product.product_name}`.trim() : pid;
      return { name: label.length > 14 ? label.slice(0, 13) + '…' : label, revenue };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function bestDayData() {
  const totals = Array<number>(7).fill(0);
  rentalPayments.forEach(p => { totals[new Date(p.payment_date).getDay()] += p.amount; });
  const max = Math.max(...totals, 0); 
  return DAYS.map((day, i) => ({ day, amount: totals[i], isMax: totals[i] === max }));
}

const tooltip = {
  contentStyle: { backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px', fontSize: 12 },
  labelStyle: { color: '#e5e5e5' },
  itemStyle: { color: '#79e19b' },
};

function ChartCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 min-w-0 overflow-hidden">
      <p className="text-sm font-medium text-foreground leading-tight">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5 mb-3 sm:mb-4">{sub}</p>
      {children}
    </div>
  );
}

export default function Analytics() {
  const revenueData  = revenueByMonth();
  const statusData   = rentalStatusData();
  const topProducts  = topProductsData();
  const bestDayChart = bestDayData();

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6 max-w-7xl mx-auto">
        <div className="hidden lg:block mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Deep dive into your rental performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="md:col-span-3">
            <ChartCard title="Revenue Over Time" sub="Last 6 months · rental payments only">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#79e19b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#79e19b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                  <Tooltip {...tooltip} formatter={(v: number) => [formatCurrencyCompact(v), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#79e19b" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#79e19b' }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="md:col-span-2">
            <ChartCard title="Rental Status" sub="By count">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {statusData.map(e => <Cell key={e.name} fill={STATUS_COLORS[e.name] ?? '#6b7280'} />)}
                  </Pie>
                  <Tooltip {...tooltip} formatter={(v: number, name: string) => [v, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
                {statusData.map(s => (
                  <div key={s.name} className="flex items-center gap-1.5 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.name] }} />
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{s.name} <span className="text-foreground font-medium">{s.value}</span></span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <ChartCard title="Top Products" sub="By rental revenue">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={76} />
                <Tooltip {...tooltip} formatter={(v: number) => [formatCurrencyCompact(v), 'Revenue']} />
                <Bar dataKey="revenue" fill="#79e19b" radius={[0, 4, 4, 0] as any} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Best Day to Collect" sub="Total rental payments by weekday">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={bestDayChart} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...tooltip} formatter={(v: number) => [formatCurrencyCompact(v), 'Amount']} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0] as any} maxBarSize={28}>
                  {bestDayChart.map(e => <Cell key={e.day} fill={e.isMax ? '#79e19b' : '#2a2a2a'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </AppLayout>
  );
}