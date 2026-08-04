import type { ComponentType, ReactNode } from 'react';

type CardProps = {
  title?: string;
  icon?: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  children: ReactNode;
};

export function Card({ title, icon: Icon, children }: CardProps) {
  return (
    <div
      className="rounded-xl p-5 shadow-sm"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--hairline)',
      }}
    >
      {title && (
        <h2
          className="mb-4 flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--text-secondary)' }}
        >
          {Icon && <Icon size={15} strokeWidth={2.25} />}
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
