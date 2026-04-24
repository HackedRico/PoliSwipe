import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

export function usePersistentState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    AsyncStorage.getItem(key).then(raw => {
      if (raw) setV(JSON.parse(raw));
      loaded.current = true;
    });
  }, [key]);
  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(key, JSON.stringify(v));
  }, [v, key]);
  return [v, setV] as const;
}
