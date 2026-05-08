import { useState, useEffect } from 'react'
import type { Screen } from '../lib/types'

interface AppHeaderProps {
  screen: Screen
  onNavigate: (screen: Screen) => void
  embedded: boolean
}

function getCurrentTheme(): 'dark' | 'light' {
  const t = document.documentElement.getAttribute('data-theme')
  return t === 'light' ? 'light' : 'dark'
}

function setTheme(t: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', t)
  try { localStorage.setItem('rel-theme', t) } catch {}
}

/**
 * Header horizontal usado tanto standalone quanto embedado dentro do hub.
 * Em standalone: mostra brand (3P Relatórios) + nav + theme toggle.
 * Em embed: só nav (hub controla brand e tema).
 */
export function AppHeader({ screen, onNavigate, embedded }: AppHeaderProps) {
  const active = ['client', 'form', 'report'].includes(screen) ? 'dashboard' : screen
  const [theme, setLocalTheme] = useState<'dark' | 'light'>(getCurrentTheme())

  // Observa mudanças externas (postMessage do hub) e mantém estado em sync
  useEffect(() => {
    const obs = new MutationObserver(() => setLocalTheme(getCurrentTheme()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setLocalTheme(next)
  }

  return (
    <header className={`app-header${embedded ? ' app-header-embed' : ''}`}>
      <div className="app-header-inner">
        {!embedded && (
          <div className="app-header-brand">
            <span className="app-header-brand-mark">3P</span>
            <span className="app-header-brand-name">Relatórios</span>
          </div>
        )}

        <nav className="app-header-nav">
          {([
            ['dashboard', '📊', 'Dashboard'],
            ['templates', '🎨', 'Templates'],
            ['settings',  '⚙️', 'Configurações'],
          ] as const).map(([id, icon, label]) => (
            <button
              key={id}
              className={`app-header-tab${active === id ? ' active' : ''}`}
              onClick={() => onNavigate(id)}
            >
              <span className="app-header-tab-icon">{icon}</span>
              <span className="app-header-tab-label">{label}</span>
            </button>
          ))}
        </nav>

        {!embedded && (
          <button
            className="app-header-theme-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}
      </div>
    </header>
  )
}
