import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateCategory } from '../hooks/useCategoryMutations';

function slugify(name: string): string {
  return name
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents (á -> a, ç -> c, etc)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function CategoryForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const { mutate, isPending, error } = useCreateCategory();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name) return;

    mutate({ name, slug: slugify(name) }, { onSuccess: () => setName('') });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('categories.namePlaceholder')}
        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {isPending ? t('common.adding') : t('categories.addCategory')}
      </button>
      {error && <span className="self-center text-sm text-red-600">{error.message}</span>}
    </form>
  );
}
