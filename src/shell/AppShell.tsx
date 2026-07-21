import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { ToolNav } from './ToolNav'
import { StatusBar } from './StatusBar'
import { NotificationList } from '@/components/NotificationList'

export function AppShell() {
  return (
    <div className="app-shell">
      <TopBar />
      <ToolNav />
      <main
        className="flex-1 overflow-hidden"
        role="main"
        id="main-content"
        aria-label="Tool workspace"
      >
        <Outlet />
      </main>
      <StatusBar />
      <NotificationList />
    </div>
  )
}
