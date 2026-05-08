import type { Screen } from '../lib/types'

interface EmbedHeaderProps {
  screen: Screen
  onNavigate: (screen: Screen) => void
}

/**
 * Header horizontal usado quando o app está embedado dentro do hub.
 * Substitui a Sidebar — usa as mesmas opções de navegação em formato de tabs.
 */
export function EmbedHeader({ screen, onNavigate }: EmbedHeaderProps) {
  const active = ['client', 'form', 'report'].includes(screen) ? 'dashboard' : screen

  return (
    <header className="embed-header">
      <nav className="embed-header-nav">
        {([
          ['dashboard', '📊', 'Dashboard'],
          ['templates', '🎨', 'Templates'],
          ['settings',  '⚙️', 'Configurações'],
        ] as const).map(([id, icon, label]) => (
          <button
            key={id}
            className={`embed-header-tab${active === id ? ' active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <span className="embed-header-tab-icon">{icon}</span>
            <span className="embed-header-tab-label">{label}</span>
          </button>
        ))}
      </nav>
    </header>
  )
}
