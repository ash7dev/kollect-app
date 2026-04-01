// Fallback pour le web - expo-secure-store n'est pas supporté sur le web
export const getItemAsync = async (key: string): Promise<string | null> => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return null;
};

export const setItemAsync = async (key: string, value: string): Promise<void> => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  }
};

export const deleteItemAsync = async (key: string): Promise<void> => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
  }
};
