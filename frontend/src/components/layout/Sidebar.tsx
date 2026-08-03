import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher';

export function Sidebar() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', label: t('nav.dashboard'), end: true },
    { to: '/expenses', label: t('nav.expenses') },
    { to: '/categories', label: t('nav.categories') },
  ];

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-gray-800 bg-gray-950 text-gray-300">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="h-6 w-6 rounded-md bg-purple-600" />
        <span className="text-sm font-semibold text-white">FinanceAgent</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600/15 text-purple-300'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-gray-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-gray-800 px-5 py-4">
        <LanguageSwitcher />
        <div className="text-xs text-gray-500">Acme Inc</div>
      </div>
    </aside>
  );
}
