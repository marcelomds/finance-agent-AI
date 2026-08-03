import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types/category';
import {
  useDeleteCategory,
  useSetCategoryActive,
  useUpdateCategory,
} from '../hooks/useCategoryMutations';

function Row({ category }: { category: Category }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const update = useUpdateCategory();
  const remove = useDeleteCategory();
  const setActive = useSetCategoryActive();

  function save() {
    if (!name || name === category.name) {
      setEditing(false);
      return;
    }
    update.mutate(
      { id: category.id, input: { name } },
      { onSuccess: () => setEditing(false) },
    );
  }

  return (
    <tr
      className={`border-b border-gray-100 last:border-0 dark:border-gray-800 ${
        category.isActive ? '' : 'opacity-50'
      }`}
    >
      <td className="px-4 py-3">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900"
          />
        ) : (
          <span className="text-gray-900 dark:text-gray-100">{category.name}</span>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
        {category.slug}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => setActive.mutate({ id: category.id, isActive: !category.isActive })}
          disabled={setActive.isPending}
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            category.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {category.isActive ? t('common.active') : t('common.inactive')}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
          <div className="inline-flex gap-2">
            <button
              onClick={save}
              disabled={update.isPending}
              className="text-xs font-medium text-purple-600 hover:text-purple-800"
            >
              {t('common.save')}
            </button>
            <button
              onClick={() => {
                setName(category.name);
                setEditing(false);
              }}
              className="text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              {t('common.cancel')}
            </button>
          </div>
        ) : (
          <div className="inline-flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {t('common.edit')}
            </button>
            <button
              onClick={() => remove.mutate(category.id)}
              disabled={remove.isPending}
              className="text-xs font-medium text-red-500 hover:text-red-700"
            >
              {t('common.delete')}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export function CategoryList({ categories }: { categories: Category[] }) {
  const { t } = useTranslation();

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        {t('categories.noCategories')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
            <th className="px-4 py-3 font-medium">{t('categories.columns.name')}</th>
            <th className="px-4 py-3 font-medium">{t('categories.columns.slug')}</th>
            <th className="px-4 py-3 font-medium">{t('categories.columns.status')}</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <Row key={category.id} category={category} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
