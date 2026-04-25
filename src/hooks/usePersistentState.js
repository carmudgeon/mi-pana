import { useState, useEffect } from 'react';

export default function usePersistentState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = window.localStorage?.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading', key, e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage?.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving', key, e);
    }
  }, [state, key]);

  return [state, setState];
}
