/**
 * Application route constants
 */
export const APP_ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  PROJECTS: '/projects',
  CREATE_PROJECT: '/create',
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
  PROFILE: '/profile',
  ADMIN: '/admin',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

/**
 * Project status constants
 */
export const PROJECT_STATUS = {
  NEW: 'new',
  PROCESSING: 'processing',
  READY: 'ready',
} as const;

/**
 * Workspace tab constants
 */
export const WORKSPACE_TABS = {
  OVERVIEW: 'overview',
  RESEARCH: 'research',
  SIMPLIFY: 'simplify',
  SCRIPTS: 'scripts',
  BROLL: 'broll',
  PROMPTS: 'prompts',
  ARTICLE: 'article',
  EXPORT: 'export',
} as const;

