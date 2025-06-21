// API configuration and constants

export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.medalertpro.com' 
    : 'http://localhost:3001',
  VERSION: 'v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },
  
  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    PREFERENCES: '/users/preferences'
  },
  
  // Patients
  PATIENTS: {
    BASE: '/patients',
    SEARCH: '/patients/search',
    MEDICAL_HISTORY: '/patients/:id/medical-history',
    EMERGENCY_CONTACTS: '/patients/:id/emergency-contacts',
    INSURANCE: '/patients/:id/insurance',
    VITALS: '/patients/:id/vitals',
    ALERTS: '/patients/:id/alerts'
  },
  
  // Vital Signs
  VITALS: {
    BASE: '/vitals',
    BATCH: '/vitals/batch',
    LATEST: '/vitals/latest',
    TRENDS: '/vitals/trends',
    VALIDATE: '/vitals/validate',
    EXPORT: '/vitals/export'
  },
  
  // Alerts
  ALERTS: {
    BASE: '/alerts',
    ACKNOWLEDGE: '/alerts/:id/acknowledge',
    RESOLVE: '/alerts/:id/resolve',
    ESCALATE: '/alerts/:id/escalate',
    HISTORY: '/alerts/:id/history',
    CONFIGURATIONS: '/alerts/configurations',
    THRESHOLDS: '/alerts/thresholds'
  },
  
  // Devices
  DEVICES: {
    BASE: '/devices',
    STATUS: '/devices/:id/status',
    CALIBRATE: '/devices/:id/calibrate',
    MAINTENANCE: '/devices/:id/maintenance'
  },
  
  // Reports
  REPORTS: {
    BASE: '/reports',
    PATIENT_SUMMARY: '/reports/patient-summary',
    VITAL_TRENDS: '/reports/vital-trends',
    ALERT_SUMMARY: '/reports/alert-summary',
    COMPLIANCE: '/reports/compliance'
  },
  
  // System
  SYSTEM: {
    HEALTH: '/system/health',
    STATUS: '/system/status',
    AUDIT: '/system/audit'
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const;