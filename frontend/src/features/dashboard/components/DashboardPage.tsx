import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { StatCard } from '../../../components/StatCard';
import { Card } from '../../../components/Card';
import { useExpenses } from '../../expenses/hooks/useExpenses';
import { useCategories } from '../../categories/hooks/useCategories';
import { ExpenseList } from '../../expenses/components/ExpenseList';

export function DashboardPage() {
  const { t } = useTranslation();
  const { organizationId } = useOrganization();
  const { data: expenses, isLoading } = useExpenses(organizationId);
  const { data: categories } = useCategories(organizationId);

  const total = expenses?.length ?? 0;
  const processing = expenses?.filter((e) => e.status === 'processing').length ?? 0;
  const approved = expenses?.filter((e) => e.status === 'approved').length ?? 0;
  const recent = expenses?.slice(0, 5) ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('dashboard.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t('dashboard.totalExpenses')} value={total} />
        <StatCard label={t('dashboard.processing')} value={processing} />
        <StatCard label={t('dashboard.approved')} value={approved} />
        <StatCard label={t('dashboard.categoriesCount')} value={categories?.length ?? 0} />
      </div>

      <Card title={t('dashboard.recentExpenses')}>
        {isLoading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}
        {!isLoading && <ExpenseList expenses={recent} />}
      </Card>
    </div>
  );
}
