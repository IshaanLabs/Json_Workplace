import { useState, useCallback } from 'react'

/**
 * Generic localStorage hook — reads, writes, and provides a setter that
 * keeps React state and localStorage in sync.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const next = value instanceof Function ? value(storedValue) : value
        setStoredValue(next)
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch (error) {
        console.warn(`useLocalStorage: failed to write key "${key}"`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}
