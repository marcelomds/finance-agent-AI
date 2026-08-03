import { useExpenses } from '../hooks/useExpenses';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';

export function ExpensesDashboard({ userId }: { userId: string }) {
  const { data: expenses, isLoading, error } = useExpenses(userId);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Expenses</h1>

      <div className="mb-6">
        <ExpenseForm userId={userId} />
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error.message}</p>}
      {expenses && <ExpenseList expenses={expenses} />}
    </div>
  );
}
