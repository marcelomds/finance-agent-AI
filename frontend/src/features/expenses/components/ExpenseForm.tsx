import { useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:file:bg-gray-800 dark:file:text-gray-200"
        />
        <button
          type="submit"
          disabled={isPending || !file}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {isPending ? t('common.adding') : t('expenses.addExpense')}
        </button>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">{t('expenses.uploadHint')}</span>
      {error && <span className="text-sm text-red-600">{error.message}</span>}
    </form>
  );
}
