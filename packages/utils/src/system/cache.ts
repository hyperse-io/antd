const storageKey = 'flatbiz';

export const localStorageCache = {
  set: (key: string, value: Record<string, unknown>) => {
    localStorage.setItem(`${storageKey}_${key}`, JSON.stringify(value));
  },
  get: (key: string) => {
    try {
      const value = localStorage.getItem(`${storageKey}_${key}`);
      if (value) {
        return JSON.parse(value) as Record<string, unknown>;
      }
    } catch (_error) {
      //
    }
    return {} as Record<string, unknown>;
  },
  remove: (key: string) => {
    localStorage.removeItem(`${storageKey}_${key}`);
  },
};

export const sessionStorageCache = {
  set: (key: string, value: Record<string, unknown>) => {
    sessionStorage.setItem(`${storageKey}_${key}`, JSON.stringify(value));
  },
  get: (key: string) => {
    try {
      const value = sessionStorage.getItem(`${storageKey}_${key}`);
      if (value) {
        return JSON.parse(value) as Record<string, unknown>;
      }
    } catch (_error) {
      //
    }
    return {} as Record<string, unknown>;
  },
  remove: (key: string) => {
    sessionStorage.removeItem(`${storageKey}_${key}`);
  },
};
