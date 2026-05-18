import type { ReactNode } from 'react'

import Sidebar from './Sidebar'

type LayoutProps = {
  children: ReactNode
}

function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 32%), #080d18',
        color: '#e5e7eb',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          minHeight: '100vh'
        }}
      >
        <Sidebar />
        {children}
      </div>
    </main>
  )
}

export default Layout
