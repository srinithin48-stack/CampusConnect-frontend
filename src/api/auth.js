const TOKEN_KEY = 'campusconnect.token';

// "Remember me" keeps the token in localStorage; otherwise it lasts for the browser session.
const stores = () => [window.localStorage, window.sessionStorage];

export const getToken = () => {
  try {
    return stores().map((store) => store.getItem(TOKEN_KEY)).find(Boolean) || null;
  } catch {
    return null;
  }
};

export const clearToken = () => {
  try {
    stores().forEach((store) => store.removeItem(TOKEN_KEY));
  } catch {
    // Storage unavailable; nothing to clear.
  }
};

export const setToken = (token, remember) => {
  clearToken();
  try {
    (remember ? window.localStorage : window.sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    // Storage unavailable; the user will need to log in again.
  }
};

export const getTokenRole = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(payload)).role || null;
  } catch {
    return null;
  }
};
