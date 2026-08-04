import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Loader2 } from 'lucide-react';
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
        className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        style={{ border: '1px solid var(--hairline)', background: 'var(--surface-1)', color: 'var(--text-primary)' }}
      />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
        {isPending ? t('common.adding') : t('categories.addCategory')}
      </button>
      {error && (
        <span className="self-center text-sm" style={{ color: 'var(--status-critical)' }}>
          {error.message}
        </span>
      )}
    </form>
  );
}
