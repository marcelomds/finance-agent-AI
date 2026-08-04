import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/Card';
import { useCategories } from '../hooks/useCategories';
import { CategoryForm } from './CategoryForm';
import { CategoryList } from './CategoryList';

export function CategoriesPage() {
  const { t } = useTranslation();
  const { data: categories, isLoading, error } = useCategories();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('categories.title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('categories.subtitle')}
        </p>
      </div>

      <Card>
        <CategoryForm />
      </Card>

      {isLoading && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('common.loading')}</p>}
      {error && <p className="text-sm" style={{ color: 'var(--status-critical)' }}>{error.message}</p>}
      {categories && <CategoryList categories={categories} />}
    </div>
  );
}
