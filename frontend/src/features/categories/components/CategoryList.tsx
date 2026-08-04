import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, Check, X, Tag } from 'lucide-react';
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
      style={{ borderBottom: '1px solid var(--hairline)', opacity: category.isActive ? 1 : 0.5 }}
    >
      <td className="px-4 py-3">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="w-full rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            style={{ border: '1px solid var(--hairline)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
          />
        ) : (
          <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Tag size={14} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
            {category.name}
          </div>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
        {category.slug}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => setActive.mutate({ id: category.id, isActive: !category.isActive })}
          disabled={setActive.isPending}
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            background: category.isActive
              ? 'color-mix(in srgb, var(--status-good) 15%, transparent)'
              : 'var(--surface-2)',
            color: category.isActive ? 'var(--status-good)' : 'var(--text-muted)',
          }}
        >
          {category.isActive ? t('common.active') : t('common.inactive')}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
          <div className="inline-flex gap-3">
            <button
              onClick={save}
              disabled={update.isPending}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              <Check size={14} strokeWidth={2.5} />
              {t('common.save')}
            </button>
            <button
              onClick={() => {
                setName(category.name);
                setEditing(false);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={14} strokeWidth={2.5} />
              {t('common.cancel')}
            </button>
          </div>
        ) : (
          <div className="inline-flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 text-xs font-medium hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Pencil size={13} strokeWidth={2} />
              {t('common.edit')}
            </button>
            <button
              onClick={() => remove.mutate(category.id)}
              disabled={remove.isPending}
              className="inline-flex items-center gap-1 text-xs font-medium hover:opacity-80"
              style={{ color: 'var(--status-critical)' }}
            >
              <Trash2 size={13} strokeWidth={2} />
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
      <div
        className="rounded-xl border border-dashed py-10 text-center text-sm"
        style={{ borderColor: 'var(--hairline)', color: 'var(--text-muted)' }}
      >
        {t('categories.noCategories')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--hairline)' }}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
              {t('categories.columns.name')}
            </th>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
              {t('categories.columns.slug')}
            </th>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
              {t('categories.columns.status')}
            </th>
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
