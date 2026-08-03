import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { fetchExpenseFileUrl } from '../services/expenseService';
import type { Expense } from '../types/expense';

const statusStyle: Record<string, string> = {
  processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  escalated: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const { t } = useTranslation();
  const { organizationId } = useOrganization();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleView(expenseId: string) {
    setLoadingId(expenseId);
    try {
      const url = await fetchExpenseFileUrl(organizationId, expenseId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setLoadingId(null);
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        {t('expenses.noExpenses')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-400">
            <th className="px-4 py-3 font-medium">{t('expenses.columns.file')}</th>
            <th className="px-4 py-3 font-medium">{t('expenses.columns.status')}</th>
            <th className="px-4 py-3 font-medium">{t('expenses.columns.category')}</th>
            <th className="px-4 py-3 font-medium">{t('expenses.columns.created')}</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="border-b border-gray-100 last:border-0 dark:border-gray-800"
            >
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{expense.fileName}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusStyle[expense.status] ??
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {t(`expenses.status.${expense.status}`, expense.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {expense.category?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-500">
                {new Date(expense.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleView(expense.id)}
                  disabled={loadingId === expense.id}
                  className="text-xs font-medium text-purple-600 hover:text-purple-800 disabled:opacity-50"
                >
                  {t('expenses.viewFile')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
