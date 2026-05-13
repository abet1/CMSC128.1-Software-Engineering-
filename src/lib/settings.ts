export const SETTINGS_KEY = 'paymamaya_settings';
export const SETTINGS_EVENT = 'paymamaya_settings_updated';

export const THEME_KEY = 'paymamaya_theme';
export const THEME_EVENT = 'paymamaya_theme_updated';

export type AppTheme = 'dark' | 'light';

export function isAppTheme(value: unknown): value is AppTheme {
  return value === 'dark' || value === 'light';
}
