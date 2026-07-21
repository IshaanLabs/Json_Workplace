import type { DiffDelta } from '@/types/json'

export interface DiffSummary {
  added: number
  removed: number
  changed: number
}

export interface CompareState {
  leftInput: string
  rightInput: string
  diffDelta: DiffDelta
  diffSummary: DiffSummary | null
  leftIsValid: boolean
  rightIsValid: boolean
  setLeftInput: (input: string) => void
  setRightInput: (input: string) => void
  setDiffDelta: (delta: DiffDelta) => void
  setDiffSummary: (summary: DiffSummary | null) => void
  setLeftIsValid: (valid: boolean) => void
  setRightIsValid: (valid: boolean) => void
  swapInputs: () => void
  clearAll: () => void
}

export const createCompareSlice = (
  set: (fn: (state: CompareState) => Partial<CompareState>) => void
): CompareState => ({
  leftInput: '',
  rightInput: '',
  diffDelta: null,
  diffSummary: null,
  leftIsValid: true,
  rightIsValid: true,

  setLeftInput: (leftInput) => set(() => ({ leftInput })),
  setRightInput: (rightInput) => set(() => ({ rightInput })),
  setDiffDelta: (diffDelta) => set(() => ({ diffDelta })),
  setDiffSummary: (diffSummary) => set(() => ({ diffSummary })),
  setLeftIsValid: (leftIsValid) => set(() => ({ leftIsValid })),
  setRightIsValid: (rightIsValid) => set(() => ({ rightIsValid })),

  swapInputs: () =>
    set((state) => ({
      leftInput: state.rightInput,
      rightInput: state.leftInput,
    })),

  clearAll: () =>
    set(() => ({
      leftInput: '',
      rightInput: '',
      diffDelta: null,
      diffSummary: null,
    })),
})
