import { useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Loader2 } from 'lucide-react';
import { useUploadExpense } from '../hooks/useUploadExpense';

export function ExpenseForm() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending, error } = useUploadExpense();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;

    mutate(file, {
      onSuccess: () => {
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="flex-1 rounded-lg px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:px-3 file:py-1 file:text-sm"
          style={{
            border: '1px solid var(--hairline)',
            background: 'var(--surface-1)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="submit"
          disabled={isPending || !file}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {isPending ? t('common.adding') : t('expenses.addExpense')}
        </button>
      </div>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {t('expenses.uploadHint')}
      </span>
      {error && <span className="text-sm" style={{ color: 'var(--status-critical)' }}>{error.message}</span>}
    </form>
  );
}
