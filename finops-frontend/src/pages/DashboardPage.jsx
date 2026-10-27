import { Layers, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi.js';
import CategoryBreakdownChart from '../components/charts/CategoryBreakdownChart.jsx';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatCurrency } from '../utils/currency.js';

export default function DashboardPage() {
  const { data, error, loading, reload } = useApi(() => dashboardApi.summary(), []);
  const initialLoad = loading && !data;

  if (error && !data) return (<><PageHeader title="Dashboard" /><ErrorState title="Couldn't load the dashboard" message={error.message} onRetry={reload} /></>);

  const net = data?.net_balance ?? 0;
  const categoriesInUse = data ? Object.keys(data.category_totals || {}).length : 0;

  return (
    <>
      <PageHeader title="Dashboard" description="Combined totals across all non-deleted records in the system, not per-user figures." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total income" icon={TrendingUp} tone="positive" loading={initialLoad} value={formatCurrency(data?.total_income)} />
        <StatCard label="Total expenses" icon={TrendingDown} tone="negative" loading={initialLoad} value={formatCurrency(data?.total_expenses)} />
        <StatCard label="Net balance" icon={Wallet} tone={net < 0 ? 'negative' : 'positive'} loading={initialLoad} value={formatCurrency(net)}
          caption={net < 0 ? 'Expenses exceed income' : 'Income covers expenses'} />
        <StatCard label="Categories with activity" icon={Layers} loading={initialLoad} value={String(categoriesInUse)} caption="Distinct categories across all records" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><IncomeExpenseChart trends={data?.monthly_trends} loading={initialLoad} /></div>
        <CategoryBreakdownChart totals={data?.category_totals} loading={initialLoad} />
      </div>
      <div className="mt-6"><RecentActivity items={data?.recent_activity} loading={initialLoad} /></div>
      {error && data && <p role="alert" className="mt-4 text-sm text-red-600">Couldn't refresh: {error.message}</p>}
    </>
  );
}
