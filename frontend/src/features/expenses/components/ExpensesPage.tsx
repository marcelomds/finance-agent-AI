import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { Card } from '../../../components/Card';
import { useExpenses } from '../hooks/useExpenses';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';

export function ExpensesPage() {
  const { t } = useTranslation();
  const { organizationId } = useOrganization();
  const { data: expenses, isLoading, error } = useExpenses(organizationId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('expenses.title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('expenses.subtitle')}
        </p>
      </div>

      <Card>
        <ExpenseForm />
      </Card>

      {isLoading && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>}
      {error && <p className="text-sm" style={{ color: 'var(--status-critical)' }}>{error.message}</p>}
      {expenses && <ExpenseList expenses={expenses} />}
    </div>
  );
}
