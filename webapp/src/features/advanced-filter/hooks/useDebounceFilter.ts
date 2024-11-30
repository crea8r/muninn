// hooks/useDebounceFilter.ts
import { useEffect, useState } from 'react';
import { FilterConfig } from 'src/types/FilterConfig';

export function useDebounceFilter(value: FilterConfig, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
