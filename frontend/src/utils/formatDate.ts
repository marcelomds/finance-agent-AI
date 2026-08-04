const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

export function formatDateTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    timeZone: DEFAULT_TIMEZONE,
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
