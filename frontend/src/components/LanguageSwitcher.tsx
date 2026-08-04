import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
      <Globe size={14} strokeWidth={2} />
      <span className="sr-only">{t('language.label')}</span>
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="w-full rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        style={{ border: '1px solid var(--hairline)', background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
