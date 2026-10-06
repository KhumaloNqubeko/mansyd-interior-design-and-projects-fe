import { apiConfig } from 'mobile/src/api-config';
export const environment = { production: true, apiBaseUrl: apiConfig.baseUrl } as const;
