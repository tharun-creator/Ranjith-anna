const TOKEN_KEY = 'finnex_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getGoogleLoginUrl = () => {
  const backendUrl = import.meta.env.VITE_API_URL || 'https://ranjith-anna.onrender.com/api/v1';
  return `${backendUrl}/auth/google/login`;
};
