import { NavLink } from 'react-router-dom'

const menuItems = [
  { label: 'Home', path: '/', end: true },
  { label: 'Tools', path: '/tools', end: false },
  { label: 'Profile', path: '/profile', end: false },
  { label: 'Settings', path: '/settings', end: false }
]

function Sidebar(): React.JSX.Element {
  return (
    <aside
      style={{
        borderRight: '1px solid rgba(148, 163, 184, 0.16)',
        background: 'rgba(15, 23, 42, 0.72)',
        padding: '24px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minWidth: 220
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #2563eb, #22c55e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}
          >
            D
          </div>

          <div>
            <strong style={{ display: 'block', fontSize: 18 }}>DevClone</strong>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>v0.1 local</span>
          </div>
        </div>

        <nav style={{ display: 'grid', gap: 10 }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: 'block',
                textAlign: 'left',
                border: 'none',
                borderRadius: 12,
                padding: '12px 14px',
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'rgba(37, 99, 235, 0.95)' : 'transparent',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'inherit',
                fontSize: 'inherit'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

    </aside>
  )
}

export default Sidebar
