import { useState, useEffect } from 'react'
import type { Screen, Client, Report } from './lib/types'
import { apiClients, apiReports } from './lib/api'
import { Sidebar } from './components/Sidebar'
import { Toast } from './components/Toast'
import { Dashboard } from './screens/Dashboard'
import { ClientView } from './screens/ClientView'
import { FormView } from './screens/FormView'
import { GeneratingView } from './screens/GeneratingView'
import { ReportView } from './screens/ReportView'
import { TemplatesScreen } from './screens/TemplatesScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import './styles/global.css'

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const parts = hash.split('/')
  return { route: parts[0] || '', id: parts[1] || '', id2: parts[2] || '' }
}

function setHash(path: string) {
  history.replaceState(null, '', `#/${path}`)
}

// Detecta se está embedado (dentro de iframe / hub)
const IS_EMBEDDED = (() => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  if (params.get('embedded') === '1') return true
  try { return window.self !== window.top } catch { return true }
})()

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [client, setClient] = useState<Client | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [reportId, setReportId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(true)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  // Restore state from URL hash on mount
  useEffect(() => {
    const { route, id } = parseHash()

    const restore = async () => {
      try {
        if (route === 'client' && id) {
          const c = await apiClients.get(id)
          setClient(c)
          setScreen('client')
        } else if (route === 'form' && id) {
          const c = await apiClients.get(id)
          setClient(c)
          setScreen('form')
        } else if (route === 'report' && id) {
          const r = await apiReports.get(id)
          const c = await apiClients.get(r.client_id)
          setReport(r)
          setClient(c)
          setScreen('report')
        } else if (route === 'templates') {
          setScreen('templates')
        } else if (route === 'settings') {
          setScreen('settings')
        }
      } catch {
        setHash('')
      } finally {
        setRestoring(false)
      }
    }

    restore()
  }, [])

  const navigate = (sc: Screen, cl?: Client) => {
    setScreen(sc)
    if (cl !== undefined) setClient(cl)
    const c = cl ?? client

    if (sc === 'dashboard') { setClient(null); setReport(null); setHash('') }
    else if (sc === 'client' && c) setHash(`client/${c.id}`)
    else if (sc === 'form' && c) setHash(`form/${c.id}`)
    else if (sc === 'templates') setHash('templates')
    else if (sc === 'settings') setHash('settings')
  }

  const startGeneration = (id: string) => {
    setReportId(id)
    setScreen('generating')
    setHash(`generating/${id}`)
  }

  const handleReportReady = (r: Report) => {
    setReport(r)
    setScreen('report')
    setHash(`report/${r.id}`)
  }

  if (restoring) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--hint)', fontSize: 14 }}>
        Carregando...
      </div>
    )
  }

  // Em embed: nunca mostra sidebar (hub já tem a sua)
  const showSidebar = !IS_EMBEDDED && ['dashboard', 'client', 'form', 'templates', 'settings'].includes(screen)

  return (
    <div className="app-layout">
      {showSidebar && (
        <Sidebar
          screen={screen}
          onNavigate={sc => {
            if (sc === 'dashboard') { setClient(null); setReport(null) }
            setScreen(sc)
            if (sc === 'dashboard') setHash('')
            else setHash(sc)
          }}
        />
      )}

      <main key={screen} className="main-content">
        {screen === 'dashboard' && (
          <Dashboard onSelectClient={setClient} onNavigate={navigate} showToast={showToast} />
        )}

        {screen === 'templates' && (
          <TemplatesScreen onBack={() => navigate('dashboard')} />
        )}

        {screen === 'settings' && (
          <SettingsScreen showToast={showToast} />
        )}

        {screen === 'client' && client && (
          <ClientView
            client={client}
            onNavigate={navigate}
            onSelectReport={async (r) => {
              // Navegar primeiro com null pra evitar flash de dados antigos
              setReport(null)
              setHash(`report/${r.id}`)
              setScreen('report')
              // Fetch completo (lista não inclui raw_data + edits)
              try {
                const full = await apiReports.get(r.id)
                setReport(full)
              } catch {
                showToast('Erro ao carregar relatório')
                setReport(r) // fallback metadata-only
              }
            }}
            showToast={showToast}
            onClientUpdated={updated => setClient(updated)}
          />
        )}

        {screen === 'form' && client && (
          <FormView
            client={client}
            onNavigate={navigate}
            onGenerate={startGeneration}
            showToast={showToast}
            onClientUpdated={updated => setClient(updated)}
          />
        )}

        {screen === 'generating' && reportId && (
          <GeneratingView
            reportId={reportId}
            client={client}
            onReady={handleReportReady}
            onError={(msg) => { showToast(msg); setScreen('form'); if (client) setHash(`form/${client.id}`) }}
          />
        )}

        {screen === 'report' && client && (
          report ? (
            <ReportView
              client={client}
              report={report}
              onNavigate={navigate}
              showToast={showToast}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--hint)', fontSize: 14 }}>
              Carregando relatório...
            </div>
          )
        )}
      </main>

      {toast && <Toast message={toast} />}
    </div>
  )
}
