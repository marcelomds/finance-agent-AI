import type { ReactNode } from 'react';

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {title && (
        <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h2>
      )}
      {children}
    </div>
  );
}
