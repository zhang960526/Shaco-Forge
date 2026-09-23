import { useCallback, useSyncExternalStore } from 'react'

// Read-through subscription only; no business snapshot is retained here.
export function useSource(source) {
  return useSyncExternalStore(
    useCallback(listener => source?.subscribe(listener) ?? (() => {}), [source]),
    useCallback(() => source?.getSnapshot(), [source]),
  )
}
