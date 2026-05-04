export const API_BASE_URL = 'http://localhost:3000';
export const RECORDS_API_BASE_URL = 'http://localhost:3001';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/login',
    REGISTER: '/api/v1/register',
    LOGOUT: '/api/v1/logout',
  },
  RECORDS: {
    ALL_RECORDS: '/api/v1/records',
    CREATE: '/api/v1/',
    SUMMARY: '/api/v1/summary',
    GET_RECORD: '/api/v1/:id',
    UPDATE: '/api/v1/:id',
    DELETE: '/api/v1/:id',
    FILTER: '/api/v1/records',
  },
} as const;

export const USER_ROLES = ['Viewer', 'Analyst', 'Admin'] as const;
export const CATEGORIES = ['Income', 'Expense', 'Investment', 'Savings'] as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
