import { TrendingUp, AlertCircle, CalendarDays, Receipt, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { mockRentals, mockPayments, mockExpenses, mockProducts } from '@/api/mock';
import { formatCurrencyCompact, personFullName } from '@/types';
import { useNavigate } from 'react-router-dom';

// ── Data derivations ──────────────────────────────────────────────────────────
const rentalPayments = mockPayments.filter(p => p.rental_id);
const totalRevenue   = rentalPayments.reduce((s, p) => s + p.amount, 0);
const outstanding    = mockRentals
  .filter(r => r.status === 'ACTIVE' || r.status === 'OVERDUE')
  .reduce((s, r) => s + r.amount_remaining, 0);
const hasOverdue    = mockRentals.some(r => r.status === 'OVERDUE');
const activeRentals = mockRentals.filter(r => r.status === 'ACTIVE').length;
const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);

const recentPayments = [...mockPayments]
  .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
  .slice(0, 6);

// Derivations for the Insight Boxes
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const today = new Date('2026-03-08');
const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
const currentMonthRevenue = rentalPayments
  .filter(p => p.payment_date.startsWith(currentMonthKey))
  .reduce((s, p) => s + p.amount, 0);

const statusCounts = { ACTIVE: 0, COMPLETED: 0, OVERDUE: 0 };
mockRentals.forEach(r => { 
  if (statusCounts[r.status as keyof typeof statusCounts] !== undefined) {
    statusCounts[r.status as keyof typeof statusCounts]++; 
  }
});

function getTopProduct() {
  const rev: Record<string, number> = {};
  rentalPayments.forEach(p => {
    const rental = mockRentals.find(r => r.id === p.rental_id);
    if (rental) rev[rental.product_id] = (rev[rental.product_id] ?? 0) + p.amount;
  });
  const sorted = Object.entries(rev).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return { name: 'N/A', revenue: 0 };
  const product = mockProducts.find(p => p.id === sorted[0][0]);
  const name = product ? `${product.brand ?? ''} ${product.model ?? product.product_name}`.trim() : 'N/A';
  return { name, revenue: sorted[0][1] };
}
const topProduct = getTopProduct();

function getBestDay() {
  const totals = Array<number>(7).fill(0);
  rentalPayments.forEach(p => { totals[new Date(p.payment_date).getDay()] += p.amount; });
  const max = Math.max(...totals, 0);
  const bestDayIndex = totals.indexOf(max);
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return { day: DAYS[bestDayIndex], amount: max };
}
const bestDay = getBestDay();

// ── Components ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, sub, alert = false, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className={`bg-card border border-border rounded-xl p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 min-w-0 cursor-pointer hover:shadow-md transition-all active:scale-95 ${alert ? 'hover:border-red-500/50' : 'hover:border-primary/50'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">{label}</span>
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${alert ? 'bg-red-500/10' : 'bg-primary/10'}`}>
          <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${alert ? 'text-red-400' : 'text-primary'}`} />
        </div>
      </div>
      <div className="min-w-0">
        <p className={`font-display text-lg sm:text-xl lg:text-2xl font-bold truncate ${alert ? 'text-red-400' : 'text-foreground'}`}>{value}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>
      </div>
    </div>
  );
}

function InsightBox({ title, sub, onClick, children }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col min-w-0 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all active:scale-95 group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-foreground leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6 max-w-7xl mx-auto">

        {/* Desktop page header */}
        <div className="hidden lg:block">
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of your rentals and expenses</p>
        </div>

        {/* Clickable KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <KpiCard onClick={() => navigate('/analytics')} label="Total Revenue"  value={formatCurrencyCompact(totalRevenue)} icon={TrendingUp}  sub="All rental payments" />
          <KpiCard onClick={() => navigate('/analytics')} label="Outstanding"    value={formatCurrencyCompact(outstanding)}  icon={AlertCircle} sub={hasOverdue ? 'Overdue exists' : 'No overdue'} alert={hasOverdue} />
          <KpiCard onClick={() => navigate('/analytics')} label="Active Rentals" value={String(activeRentals)}               icon={CalendarDays} sub={`of ${mockRentals.length} rentals`} />
          <KpiCard onClick={() => navigate('/analytics')} label="Total Expenses" value={formatCurrencyCompact(totalExpenses)} icon={Receipt}    sub={`${mockExpenses.length} expenses`} />
        </div>

        {/* Insight Boxes Replacing the Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-2">
          
          <InsightBox title="Top Performing Product" sub="By total rental revenue" onClick={() => navigate('/analytics')}>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-primary truncate" title={topProduct.name}>
              {topProduct.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Generated {formatCurrencyCompact(topProduct.revenue)} in revenue</p>
          </InsightBox>

          <InsightBox title="Best Collection Day" sub="Historically highest total payments" onClick={() => navigate('/analytics')}>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-[#79e19b]">
              {bestDay.day}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Collected {formatCurrencyCompact(bestDay.amount)} total</p>
          </InsightBox>

          <InsightBox title="Rental Status" sub="Current distribution overview" onClick={() => navigate('/analytics')}>
            <div className="flex gap-6 lg:gap-8 items-center mt-1">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Active</p>
                <p className="text-2xl font-bold text-[#60a5fa]">{statusCounts.ACTIVE}</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Completed</p>
                <p className="text-2xl font-bold text-[#79e19b]">{statusCounts.COMPLETED}</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Overdue</p>
                <p className="text-2xl font-bold text-[#f87171]">{statusCounts.OVERDUE}</p>
              </div>
            </div>
          </InsightBox>

          <InsightBox title="Current Month Revenue" sub={`${MONTHS[today.getMonth()]} ${today.getFullYear()} performance`} onClick={() => navigate('/analytics')}>
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-foreground">
              {formatCurrencyCompact(currentMonthRevenue)}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Total revenue collected this month</p>
          </InsightBox>

        </div>

        {/* Recent Payments */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mt-6">
          <div className="px-3 sm:px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Recent Payments</p>
            <a href="/payments" className="text-xs text-primary hover:text-primary/80 transition-colors">View all</a>
          </div>
          <div className="divide-y divide-border">
            {recentPayments.map(p => {
              // The fixed line is here! No more .title error.
              const title = p.rental?.product?.product_name ?? p.rental?.reference_id ?? p.expense?.description ?? '—';
              const payer = p.payee_person ? personFullName(p.payee_person) : '—';
              const date = new Date(p.payment_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
              return (
                <div key={p.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{title}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{payer} · {date}</p>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-primary shrink-0 tabular-nums">
                    {formatCurrencyCompact(p.amount ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}