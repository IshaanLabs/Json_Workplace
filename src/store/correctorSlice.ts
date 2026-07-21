/**
 * correctorSlice — owns only the Corrector's own UI state.
 * The actual issue list and corrected output now live in workspaceSlice
 * so they are always in sync with rawInput regardless of active tab.
 */
export interface CorrectorState {
  // (reserved for future corrector-specific UI state)
  _correctorMounted: boolean
  setCorrectorMounted: (mounted: boolean) => void
}

export const createCorrectorSlice = (
  set: (fn: (state: CorrectorState) => Partial<CorrectorState>) => void
): CorrectorState => ({
  _correctorMounted: false,
  setCorrectorMounted: (mounted) => set(() => ({ _correctorMounted: mounted })),
})
