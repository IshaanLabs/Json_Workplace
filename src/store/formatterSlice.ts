import type { FormatMode } from '@/types/ui'

export interface FormatterState {
  output: string
  activeMode: FormatMode | null
  isPrettierReady: boolean
  setOutput: (output: string) => void
  setActiveMode: (mode: FormatMode | null) => void
  setPrettierReady: (ready: boolean) => void
}

export const createFormatterSlice = (
  set: (fn: (state: FormatterState) => Partial<FormatterState>) => void
): FormatterState => ({
  output: '',
  activeMode: null,
  isPrettierReady: false,

  setOutput: (output) => set(() => ({ output })),
  setActiveMode: (activeMode) => set(() => ({ activeMode })),
  setPrettierReady: (isPrettierReady) => set(() => ({ isPrettierReady })),
})
