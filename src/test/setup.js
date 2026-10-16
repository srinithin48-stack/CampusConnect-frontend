import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';

// jsdom does not implement ResizeObserver, which LoginPage uses to size itself.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver || ResizeObserverStub;

afterEach(() => {
  // The API client keeps the token in module scope; reset it between tests.
  setAuthToken(null);
  setUnauthorizedHandler(null);
  window.localStorage.clear();
  window.sessionStorage.clear();
});
