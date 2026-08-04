export type BreakdownItem = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export function BreakdownBar({ items, emptyLabel }: { items: BreakdownItem[]; emptyLabel: string }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const visible = items.filter((item) => item.value > 0);

  if (total === 0) {
    return (
      <div
        className="flex h-8 items-center justify-center rounded-full text-xs"
        style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-7 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
        {visible.map((item, i) => (
          <div
            key={item.key}
            title={`${item.label}: ${item.value}`}
            className="h-full transition-opacity hover:opacity-80"
            style={{
              width: `${(item.value / total) * 100}%`,
              background: item.color,
              borderRight: i < visible.length - 1 ? '2px solid var(--surface-1)' : undefined,
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {visible.map((item) => (
          <div key={item.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: item.color }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
