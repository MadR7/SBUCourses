import axios from 'axios';

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
 