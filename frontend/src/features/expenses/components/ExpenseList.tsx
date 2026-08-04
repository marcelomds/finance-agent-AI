import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Loader2, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { formatDateTime } from '../../../utils/formatDate';
import { fetchExpenseFileUrl } from '../services/expenseService';
import type { Expense } from '../types/expense';

const STATUS_META: Record<string, { icon: typeof Loader2; color: string; spin?: boolean }> = {
  processing: { icon: Loader2, color: 'var(--text-muted)', spin: true },
  extracted: { icon: Loader2, color: 'var(--text-muted)', spin: true },
  classified: { icon: Loader2, color: 'var(--text-muted)', spin: true },
  validated: { icon: Loader2, color: 'var(--text-muted)', spin: true },
  approved: { icon: CheckCircle2, color: 'var(--status-good)' },
  rejected: { icon: XCircle, color: 'var(--status-critical)' },
  escalated: { icon: AlertTriangle, color: 'var(--status-serious)' },
};

function formatAmount(amount: number | null | undefined, currency: string | null | undefined, locale: string) {
  if (amount == null) return null;
  try {
    return new Intl.NumberFormat(locale, {
      style: currency ? 'currency' : 'decimal',
      currency: currency ?? undefined,
    }).format(amount);
  } catch {
    return `${amount}`;
  }
}

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const { t, i18n } = useTranslation();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleView(expenseId: string) {
    setLoadingId(expenseId);
    try {
      const url = await fetchExpenseFileUrl(expenseId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setLoadingId(null);
    }
  }

  if (expenses.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed py-10 text-center text-sm"
        style={{ borderColor: 'var(--hairline)', color: 'var(--text-muted)' }}
      >
        {t('expenses.noExpenses')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--hairline)' }}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
              {t('expenses.columns.file')}
            </th>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
              {t('expenses.columns.status')}
            </th>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
              {t('expenses.columns.amount')}
            </th>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
              {t('expenses.columns.category')}
            </th>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>
              {t('expenses.columns.created')}
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => {
            const amount = formatAmount(
              expense.extractedData?.amount,
              expense.extractedData?.currency,
              i18n.language,
            );
            const meta = STATUS_META[expense.status] ?? STATUS_META.processing;
            const StatusIcon = meta.icon;

            return (
              <tr key={expense.id} style={{ borderBottom: '1px solid var(--hairline)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <FileText size={15} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
                    {expense.fileName}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: meta.color }}>
                    <StatusIcon size={14} strokeWidth={2.25} className={meta.spin ? 'animate-spin' : undefined} />
                    {t(`expenses.status.${expense.status}`, expense.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {amount ? (
                    <span style={{ color: 'var(--text-primary)' }}>{amount}</span>
                  ) : expense.extractedData ? (
                    <span style={{ color: 'var(--status-warning)' }}>{t('expenses.notRecognized')}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {expense.category?.name ?? '—'}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                  {formatDateTime(expense.createdAt, i18n.language)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleView(expense.id)}
                    disabled={loadingId === expense.id}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] disabled:opacity-50"
                  >
                    <Eye size={14} strokeWidth={2.25} />
                    {t('expenses.viewFile')}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
