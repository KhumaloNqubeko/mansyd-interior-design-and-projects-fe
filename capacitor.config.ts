import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'za.co.mansyd.projects', appName: 'Mansyd Projects', webDir: 'dist/mansyd-mobile/browser',
  server: { androidScheme: 'https', cleartext: process.env['MOBILE_ALLOW_HTTP'] === '1' },
  plugins: { CapacitorHttp: { enabled: true }, CapacitorCookies: { enabled: true } }
};
export default config;
