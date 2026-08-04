import { useTranslation } from 'react-i18next';
import { Receipt, Loader2, CheckCircle2, Tags, PieChart, BarChart3, Clock } from 'lucide-react';
import { StatCard } from '../../../components/StatCard';
import { Card } from '../../../components/Card';
import { BreakdownBar, type BreakdownItem } from '../../../components/charts/BreakdownBar';
import { useExpenses } from '../../expenses/hooks/useExpenses';
import { useCategories } from '../../categories/hooks/useCategories';
import { ExpenseList } from '../../expenses/components/ExpenseList';

const CATEGORICAL_COLORS = [
  'var(--cat-1)',
  'var(--cat-2)',
  'var(--cat-3)',
  'var(--cat-4)',
  'var(--cat-5)',
  'var(--cat-6)',
  'var(--cat-7)',
  'var(--cat-8)',
];

const IN_PROGRESS_STATUSES = ['processing', 'extracted', 'classified', 'validated'];

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: expenses, isLoading } = useExpenses();
  const { data: categories } = useCategories();

  const total = expenses?.length ?? 0;
  const processing = expenses?.filter((e) => IN_PROGRESS_STATUSES.includes(e.status)).length ?? 0;
  const approved = expenses?.filter((e) => e.status === 'approved').length ?? 0;
  const recent = expenses?.slice(0, 5) ?? [];

  const categoryBreakdown: BreakdownItem[] = (categories ?? []).map((category, i) => ({
    key: category.id,
    label: category.name,
    value: expenses?.filter((e) => e.category?.id === category.id).length ?? 0,
    color: CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length],
  }));

  const statusBreakdown: BreakdownItem[] = [
    {
      key: 'inProgress',
      label: t('dashboard.statusBuckets.inProgress'),
      value: expenses?.filter((e) => IN_PROGRESS_STATUSES.includes(e.status)).length ?? 0,
      color: 'var(--text-muted)',
    },
    {
      key: 'approved',
      label: t('dashboard.statusBuckets.approved'),
      value: expenses?.filter((e) => e.status === 'approved').length ?? 0,
      color: 'var(--status-good)',
    },
    {
      key: 'escalated',
      label: t('dashboard.statusBuckets.escalated'),
      value: expenses?.filter((e) => e.status === 'escalated').length ?? 0,
      color: 'var(--status-serious)',
    },
    {
      key: 'rejected',
      label: t('dashboard.statusBuckets.rejected'),
      value: expenses?.filter((e) => e.status === 'rejected').length ?? 0,
      color: 'var(--status-critical)',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('dashboard.title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('dashboard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t('dashboard.totalExpenses')} value={total} icon={Receipt} tint="var(--cat-1)" />
        <StatCard label={t('dashboard.processing')} value={processing} icon={Loader2} tint="var(--status-warning)" />
        <StatCard label={t('dashboard.approved')} value={approved} icon={CheckCircle2} tint="var(--status-good)" />
        <StatCard
          label={t('dashboard.categoriesCount')}
          value={categories?.length ?? 0}
          icon={Tags}
          tint="var(--cat-7)"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card title={t('dashboard.byCategory')} icon={PieChart}>
          <BreakdownBar items={categoryBreakdown} emptyLabel={t('dashboard.noData')} />
        </Card>
        <Card title={t('dashboard.byStatus')} icon={BarChart3}>
          <BreakdownBar items={statusBreakdown} emptyLabel={t('dashboard.noData')} />
        </Card>
      </div>

      <Card title={t('dashboard.recentExpenses')} icon={Clock}>
        {isLoading && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>}
        {!isLoading && <ExpenseList expenses={recent} />}
      </Card>
    </div>
  );
}
