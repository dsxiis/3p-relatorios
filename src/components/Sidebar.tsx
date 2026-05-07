import type { Screen } from '../lib/types'

interface SidebarProps {
  screen: Screen
  onNavigate: (screen: Screen) => void
}

export function Sidebar({ screen, onNavigate }: SidebarProps) {
  const active = ['client', 'form', 'report'].includes(screen) ? 'dashboard' : screen

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-title">
          <span className="sidebar-logo-brand">3P</span>
          <span> Relatórios</span>
        </div>
        <div className="sidebar-logo-sub">v1.0</div>
      </div>

      <nav className="sidebar-nav">
        {([
          ['dashboard',  '📊', 'Dashboard'],
          ['templates',  '🎨', 'Templates'],
          ['historico',  '🕐', 'Histórico'],
        ] as const).map(([id, icon, label]) => (
          <button
            key={id}
            className={`sidebar-nav-btn${active === id ? ' active' : ''}`}
            onClick={() => {
              if (id === 'dashboard') onNavigate('dashboard')
              else if (id === 'templates') onNavigate('templates')
              else if (id === 'historico') {
                // TODO: implement historico screen
              }
            }}
            style={{ opacity: id === 'historico' ? 0.5 : 1 }}
          >
            <span style={{ marginRight: 8, fontSize: 13 }}>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        3P Marketing · Londrina
      </div>
    </div>
  )
}
