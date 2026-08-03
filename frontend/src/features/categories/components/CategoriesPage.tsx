import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { Card } from '../../../components/Card';
import { useCategories } from '../hooks/useCategories';
import { CategoryForm } from './CategoryForm';
import { CategoryList } from './CategoryList';

export function CategoriesPage() {
  const { t } = useTranslation();
  const { organizationId } = useOrganization();
  const { data: categories, isLoading, error } = useCategories(organizationId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('categories.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('categories.subtitle')}</p>
      </div>

      <Card>
        <CategoryForm />
      </Card>

      {isLoading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      {categories && <CategoryList categories={categories} />}
    </div>
  );
}
