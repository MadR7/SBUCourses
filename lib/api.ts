import axios from 'axios';

/**
 * Pre-configured Axios instance for making requests to the application's internal API routes.
 * 
 * - Sets the `baseURL` to `/api`.
 * - Includes a custom parameter serializer that appends `[]` to array keys in query strings
 *   (e.g., `sbcs[]=ESI&sbcs[]=TECH`) for robust array parameter handling.
 */
const api = axios.create({
  baseURL: '/api',
  paramsSerializer: {
    serialize: params => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(`${key}[]`, v));
        } else {
          searchParams.append(key, value);
        }
      });
      return searchParams.toString();
    }
  }
});

export default api;