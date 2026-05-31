// Token Manager - Handle JWT Token storage and retrieval
const TOKEN_KEY = 'accessToken';
const TOKEN_TYPE_KEY = 'tokenType';
const USER_KEY = 'user';

export const tokenManager = {
  // Save token
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Get token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Save token type
  setTokenType: (tokenType) => {
    localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
  },

  // Get token type
  getTokenType: () => {
    return localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';
  },

  // Save user info
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get user info
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Remove all auth data
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Check if token exists
  hasToken: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Get Authorization header
  getAuthHeader: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const tokenType = localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';
    return token ? `${tokenType} ${token}` : null;
  },

  // Decode JWT payload
  decodeToken: (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },
};
