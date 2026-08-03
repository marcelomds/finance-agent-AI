import type { Expense } from '../types/expense';

const statusColor: Record<string, string> = {
  processing: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  escalated: 'bg-orange-100 text-orange-800',
};

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return <p className="text-gray-500 text-sm">No expenses yet.</p>;
  }

  return (
    <table className="w-full text-sm text-left border-collapse">
      <thead>
        <tr className="border-b border-gray-200 text-gray-500">
          <th className="py-2 pr-4 font-medium">File</th>
          <th className="py-2 pr-4 font-medium">Status</th>
          <th className="py-2 pr-4 font-medium">Category</th>
          <th className="py-2 font-medium">Created</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <tr key={expense.id} className="border-b border-gray-100">
            <td className="py-2 pr-4">{expense.fileName}</td>
            <td className="py-2 pr-4">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  statusColor[expense.status] ?? 'bg-gray-100 text-gray-800'
                }`}
              >
                {expense.status}
              </span>
            </td>
            <td className="py-2 pr-4">{expense.category ?? '—'}</td>
            <td className="py-2 text-gray-500">
              {new Date(expense.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
