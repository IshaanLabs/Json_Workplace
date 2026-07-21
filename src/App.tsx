import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/shell/AppShell'
import { ViewerPage } from '@/features/viewer/ViewerPage'
import { FormatterPage } from '@/features/formatter/FormatterPage'
import { ComparePage } from '@/features/compare/ComparePage'
import { ValidatorPage } from '@/features/validator/ValidatorPage'
import { CorrectorPage } from '@/features/corrector/CorrectorPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/viewer" replace />} />
          <Route path="viewer" element={<ViewerPage />} />
          <Route path="formatter" element={<FormatterPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="validator" element={<ValidatorPage />} />
          <Route path="corrector" element={<CorrectorPage />} />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/viewer" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
