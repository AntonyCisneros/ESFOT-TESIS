import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

type UseStateAction<S> = S | ((prevState: S) => S);

/**
 * `useStorageState` can be used to persist the user's preferences across app restarts.
 * It wraps AsyncStorage and provides an interface similar to the `useState` React hook.
 */
export function useStorageState(
  key: string,
): [string | null, (value: UseStateAction<string | null>) => void, boolean] {
  const [state, setState] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const readState = async () => {
      try {
        const value = await AsyncStorage.getItem(key);
        setState(value);
      } finally {
        setIsReady(true);
      }
    };

    readState();
  }, [key]);

  const dispatch = (value: UseStateAction<string | null>) => {
    setState((prev) => {
      const newValue = typeof value === "function" ? (value as (prev: string | null) => string | null)(prev) : value;
      if (newValue === null) {
        AsyncStorage.removeItem(key);
      } else {
        AsyncStorage.setItem(key, newValue);
      }
      return newValue;
    });
  };

  return [state, dispatch, !isReady];
}
