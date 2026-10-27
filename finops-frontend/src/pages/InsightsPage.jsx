import { ReceiptText } from 'lucide-react';
import { dashboardApi } from '../api/dashboardApi.js';
import RankedBarChart from '../components/charts/RankedBarChart.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import { useApi } from '../hooks/useApi.js';
import { CHART_COLORS } from '../utils/theme.js';

export default function InsightsPage() {
  const { data, error, loading, reload } = useApi(() => dashboardApi.insights(), []);
  const initialLoad = loading && !data;

  if (error && !data) return (<><PageHeader title="Insights" /><ErrorState title="Couldn't load insights" message={error.message} onRetry={reload} /></>);

  return (
    <>
      <PageHeader title="Insights" description="Top categories by total amount across all non-deleted records. Each list shows at most five." />
      <div className="mb-6 max-w-sm">
        <StatCard label="Total records" icon={ReceiptText} loading={initialLoad} value={String(data?.total_records ?? 0)} caption="Excludes deleted records" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RankedBarChart title="Top expense categories" subtitle="Highest total spending by category" items={data?.top_expense_categories} color={CHART_COLORS.expense} loading={initialLoad} />
        <RankedBarChart title="Top income sources" subtitle="Highest total income by category" items={data?.top_income_sources} color={CHART_COLORS.income} loading={initialLoad} />
      </div>
    </>
  );
}
