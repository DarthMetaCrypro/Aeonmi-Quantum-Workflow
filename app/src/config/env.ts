// Environment configuration
// DO NOT COMMIT .env.local - add to .gitignore

// API Base URL - defaults to localhost for development
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';

// Feature flags
export const ENABLE_LOGGING = IS_DEVELOPMENT;
export const ENABLE_QUANTUM_HARDWARE = true;
export const ENABLE_CONSTRUCTOR_AI = true;
