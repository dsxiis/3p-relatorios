import { useState } from 'react'
import type { Screen, Client, Report } from './lib/types'
import { Sidebar } from './components/Sidebar'
import { Toast } from './components/Toast'
import { Dashboard } from './screens/Dashboard'
import { ClientView } from './screens/ClientView'
import { FormView } from './screens/FormView'
import { GeneratingView } from './screens/GeneratingView'
import { ReportView } from './screens/ReportView'
import './styles/global.css'

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [client, setClient] = useState<Client | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [genStep, setGenStep] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const navigate = (sc: Screen, cl?: Client) => {
    setScreen(sc)
    if (cl !== undefined) setClient(cl)
  }

  const startGeneration = () => {
    setScreen('generating')
    setGenStep(0)
    ;([1, 2, 3, 4] as const).forEach((n, i) => {
      setTimeout(() => {
        setGenStep(n)
        if (n === 4) {
          setTimeout(() => {
            setScreen('report')
            setReport(null) // will use mock data
          }, 600)
        }
      }, (i + 1) * 1000)
    })
  }

  const showSidebar = ['dashboard', 'client', 'form'].includes(screen)

  return (
    <div className="app-layout">
      {showSidebar && (
        <Sidebar
          screen={screen}
          onNavigate={sc => {
            if (sc === 'dashboard') {
              setClient(null)
              setReport(null)
            }
            setScreen(sc)
          }}
        />
      )}

      <main key={screen} className="main-content">
        {screen === 'dashboard' && (
          <Dashboard
            onSelectClient={setClient}
            onNavigate={navigate}
          />
        )}

        {screen === 'client' && client && (
          <ClientView
            client={client}
            onNavigate={navigate}
            onSelectReport={setReport}
            showToast={showToast}
          />
        )}

        {screen === 'form' && client && (
          <FormView
            client={client}
            onNavigate={navigate}
            onGenerate={startGeneration}
            showToast={showToast}
          />
        )}

        {screen === 'generating' && (
          <GeneratingView step={genStep} client={client} />
        )}

        {screen === 'report' && client && (
          <ReportView
            client={client}
            report={report}
            onNavigate={navigate}
            showToast={showToast}
          />
        )}
      </main>

      {toast && <Toast message={toast} />}
    </div>
  )
}
