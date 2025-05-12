/**
 * Environment utilities to help safely detect the current environment
 */

/**
 * Checks if the code is running in a test environment
 */
export const isTestEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
};

/**
 * Checks if the code is running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Checks if the code is running in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Checks if the code is running during build time
 */
export const isBuildTime = (): boolean => {
  return process.env.NEXT_PUBLIC_BUILD_MODE === 'true';
};

/**
 * Gets the appropriate API URL based on environment
 */
export const getApiBaseUrl = (): string => {
  if (isTestEnvironment()) {
    return 'https://test-api.speasy.app';
  }
  
  if (isDevelopment()) {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'https://speasy.app';
}; 