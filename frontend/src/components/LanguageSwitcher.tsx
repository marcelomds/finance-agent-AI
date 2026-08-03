import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <label className="flex flex-col gap-1 text-xs text-gray-500">
      <span className="sr-only">{t('language.label')}</span>
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="rounded-md border border-gray-800 bg-gray-900 px-2 py-1 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
