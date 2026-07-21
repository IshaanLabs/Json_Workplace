import { useState, useEffect } from 'react'

/**
 * Debounce a value — returns a version that only updates after the
 * specified delay has elapsed since the last change.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
