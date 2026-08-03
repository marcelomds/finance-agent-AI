import { useState, type FormEvent } from 'react';
import { useCreateExpense } from '../hooks/useCreateExpense';

export function ExpenseForm({ userId }: { userId: string }) {
  const [fileName, setFileName] = useState('');
  const { mutate, isPending, error } = useCreateExpense();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fileName) return;

    mutate(
      { userId, fileName, s3Key: `receipts/${Date.now()}-${fileName}` },
      { onSuccess: () => setFileName('') },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        placeholder="receipt.pdf"
        className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-purple-600 text-white rounded-md px-4 py-1.5 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
      >
        {isPending ? 'Adding...' : 'Add expense'}
      </button>
      {error && <span className="text-red-600 text-sm self-center">{error.message}</span>}
    </form>
  );
}
