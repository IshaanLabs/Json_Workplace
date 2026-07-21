/**
 * viewerSlice — owns the viewer UI state while the tree itself stays in workspaceSlice.
 */
export interface ViewerState {
  expandedPaths: Record<string, boolean>
  searchQuery: string
  searchMatchCount: number
  searchCurrentIndex: number
  viewMode: 'editor' | 'tree' | 'split'
  selectedNodePath: string | null
  selectedNodeValue: string | null
  setExpandedPaths: (paths: Record<string, boolean>) => void
  togglePath: (path: string) => void
  expandAll: (paths: string[]) => void
  collapseAll: () => void
  setSearchQuery: (query: string) => void
  setSearchMatchCount: (count: number, currentIndex?: number) => void
  navigateSearchMatch: (direction: 'next' | 'prev') => void
  setViewMode: (mode: ViewerState['viewMode']) => void
  setSelectedNode: (path: string | null, value: string | null) => void
  clearSelectedNode: () => void
}

export const createViewerSlice = (
  set: (fn: (state: ViewerState) => Partial<ViewerState>) => void
): ViewerState => ({
  expandedPaths: {},
  searchQuery: '',
  searchMatchCount: 0,
  searchCurrentIndex: 0,
  viewMode: 'tree',
  selectedNodePath: null,
  selectedNodeValue: null,

  setExpandedPaths: (expandedPaths) => set(() => ({ expandedPaths })),

  togglePath: (path) =>
    set((state) => ({
      expandedPaths: {
        ...state.expandedPaths,
        [path]: !state.expandedPaths[path],
      },
    })),

  expandAll: (paths) =>
    set(() => ({
      expandedPaths: Object.fromEntries(paths.map((p) => [p, true])),
    })),

  collapseAll: () => set(() => ({ expandedPaths: {} })),

  setSearchQuery: (searchQuery) => set(() => ({ searchQuery, searchCurrentIndex: 0 })),

  setSearchMatchCount: (count, currentIndex = 0) =>
    set(() => ({ searchMatchCount: count, searchCurrentIndex: currentIndex })),

  navigateSearchMatch: (direction) =>
    set((state) => {
      if (state.searchMatchCount === 0) return {}
      const next =
        direction === 'next'
          ? (state.searchCurrentIndex + 1) % state.searchMatchCount
          : (state.searchCurrentIndex - 1 + state.searchMatchCount) % state.searchMatchCount
      return { searchCurrentIndex: next }
    }),

  setViewMode: (viewMode) => set(() => ({ viewMode })),
  setSelectedNode: (selectedNodePath, selectedNodeValue) =>
    set(() => ({ selectedNodePath, selectedNodeValue })),
  clearSelectedNode: () => set(() => ({ selectedNodePath: null, selectedNodeValue: null })),
})
