/**
 * Shared TypeScript types for UI state.
 */

export type Theme = 'light' | 'dark'

export type ToolId = 'viewer' | 'formatter' | 'compare' | 'validator' | 'corrector'

export interface NavItem {
  id: ToolId
  label: string
  path: string
  iconName: string
}

export type FormatMode = 'pretty-2' | 'pretty-4' | 'minify' | 'sort-keys'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

export interface CursorPosition {
  line: number
  column: number
}
