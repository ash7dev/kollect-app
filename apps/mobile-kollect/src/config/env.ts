import Constants from 'expo-constants';

type ExpoExtra = {
  apiBaseUrl?: string;
  apiUrl?: string;
  publicUrl?: string;
  ngrokSkipBrowserWarning?: string;
};

const extra = (Constants.expoConfig?.extra ??
  Constants.manifest?.extra ??
  {}) as ExpoExtra;

const envApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
const envPublicUrl = process.env.EXPO_PUBLIC_PUBLIC_URL;
const envNgrokSkip = process.env.EXPO_PUBLIC_NGROK_SKIP_BROWSER_WARNING;

const apiBaseUrl =
  envApiBaseUrl ??
  extra.apiBaseUrl ??
  'https://maurice-unfelicitous-semisuccessfully.ngrok-free.dev';
const apiUrl = envApiUrl ?? extra.apiUrl ?? `${apiBaseUrl}/api`;
const publicUrl = envPublicUrl ?? extra.publicUrl ?? apiBaseUrl;
const ngrokSkipBrowserWarning =
  envNgrokSkip ?? extra.ngrokSkipBrowserWarning ?? 'true';

export { apiBaseUrl, apiUrl, publicUrl, ngrokSkipBrowserWarning };
