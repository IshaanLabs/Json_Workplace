import { create } from 'zustand'
import { createAppSlice, type AppState } from './appSlice'
import { createWorkspaceSlice, type WorkspaceState } from './workspaceSlice'
import { createViewerSlice, type ViewerState } from './viewerSlice'
import { createFormatterSlice, type FormatterState } from './formatterSlice'
import { createCompareSlice, type CompareState } from './compareSlice'
import { createValidatorSlice, type ValidatorState } from './validatorSlice'
import { createCorrectorSlice, type CorrectorState } from './correctorSlice'

export type StoreState = AppState &
  WorkspaceState &
  ViewerState &
  FormatterState &
  CompareState &
  ValidatorState &
  CorrectorState

export const useStore = create<StoreState>()((set) => ({
  ...createAppSlice(set as Parameters<typeof createAppSlice>[0]),
  ...createWorkspaceSlice(set as Parameters<typeof createWorkspaceSlice>[0]),
  ...createViewerSlice(set as Parameters<typeof createViewerSlice>[0]),
  ...createFormatterSlice(set as Parameters<typeof createFormatterSlice>[0]),
  ...createCompareSlice(set as Parameters<typeof createCompareSlice>[0]),
  ...createValidatorSlice(set as Parameters<typeof createValidatorSlice>[0]),
  ...createCorrectorSlice(set as Parameters<typeof createCorrectorSlice>[0]),
}))
