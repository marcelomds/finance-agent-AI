import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Receipt, Tags, Sparkles } from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';

export function Sidebar() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', label: t('nav.dashboard'), end: true, icon: LayoutDashboard },
    { to: '/expenses', label: t('nav.expenses'), icon: Receipt },
    { to: '/categories', label: t('nav.categories'), icon: Tags },
  ];

  return (
    <aside
      className="flex h-screen w-60 shrink-0 flex-col"
      style={{
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--hairline)',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm"
          style={{ background: 'var(--accent)', boxShadow: '0 1px 6px color-mix(in srgb, var(--accent) 40%, transparent)' }}
        >
          <Sparkles size={16} style={{ color: 'var(--accent-ink)' }} strokeWidth={2.25} />
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          FinanceAgent
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? '' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div
        className="space-y-3 px-5 py-4"
        style={{ borderTop: '1px solid var(--hairline)' }}
      >
        <LanguageSwitcher />
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Acme Inc
        </div>
      </div>
    </aside>
  );
}
