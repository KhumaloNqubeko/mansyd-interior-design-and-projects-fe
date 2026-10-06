import { readFileSync, writeFileSync } from 'node:fs';
const settings = JSON.parse(readFileSync(new URL('../api-settings.json', import.meta.url), 'utf8'));
const configured = process.env.MOBILE_API_URL?.trim() || settings.hostedApiUrl;
if (!configured) throw new Error('Set MOBILE_API_URL or mobile/api-settings.json to the HTTPS backend URL ending in /api.');
const url = new URL(configured);
if (url.username || url.password || url.search || url.hash || !url.pathname.replace(/\/$/, '').endsWith('/api')) throw new Error('The API URL must end in /api and contain no credentials, query or fragment.');
if (url.protocol !== 'https:' && !(url.protocol === 'http:' && process.env.MOBILE_ALLOW_HTTP === '1')) throw new Error('Use HTTPS. MOBILE_ALLOW_HTTP=1 permits local Android debug testing only.');
writeFileSync(new URL('../src/api-config.ts', import.meta.url), `export const apiConfig = ${JSON.stringify({ baseUrl: configured.replace(/\/$/, '') })};\n`);
