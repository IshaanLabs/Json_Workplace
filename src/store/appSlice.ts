import type { Theme, Notification } from '@/types/ui'

export interface AppState {
  theme: Theme
  notifications: Notification[]
  setTheme: (theme: Theme) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

export const createAppSlice = (
  set: (fn: (state: AppState) => Partial<AppState>) => void
): AppState => ({
  theme: 'light',
  notifications: [],

  setTheme: (theme) => set(() => ({ theme })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now().toString() },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
})
