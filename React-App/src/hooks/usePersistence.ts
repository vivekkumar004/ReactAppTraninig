import { useState, useEffect } from "react";

function usePersistence(
  localStorageKey: string,
  initValue: string
): [string, (e: string) => void] {
  const [value, setValue] = useState(
    localStorage.getItem(localStorageKey) ?? initValue
  );

  useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [value]);

  return [value, setValue];
}

export default usePersistence;