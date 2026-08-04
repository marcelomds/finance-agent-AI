import type { ComponentType } from 'react';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string; color?: string }>;
  tint?: string;
};

export function StatCard({ label, value, icon: Icon, tint = 'var(--cat-1)' }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-5 shadow-sm"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--hairline)' }}
    >
      <div className="flex items-start justify-between">
        <p
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in srgb, ${tint} 15%, transparent)` }}
        >
          <Icon size={16} strokeWidth={2.25} color={tint} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}
