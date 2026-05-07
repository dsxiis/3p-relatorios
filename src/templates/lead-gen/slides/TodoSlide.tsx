import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { EditableText } from '../../../components/slides/EditableText'
import type { EditState } from '../../../lib/types'

interface TodoSlideProps {
  clientName: string
  todos3P: string[]
  todosClient: string[]
  e3P: EditState
  eClient: EditState
}

export function TodoSlide({ clientName, todos3P, todosClient, e3P, eClient }: TodoSlideProps) {
  // Unused props kept for API compatibility — EditableText handles display via defaultValue
  void todos3P
  void todosClient

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} position="top-right" />
      <div style={{ fontSize: 11, color: '#8833ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
        To Do — Próximo Mês
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
            background: 'rgba(136,51,255,0.12)', color: '#8833ff',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 10,
          }}>
            3P Marketing
          </div>
          <EditableText e={e3P} placeholder="Claude vai gerar os to-dos da 3P..." />
        </div>

        <div>
          <div style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
            background: 'rgba(52,211,153,0.12)', color: '#059669',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 10,
          }}>
            {clientName}
          </div>
          <EditableText e={eClient} placeholder="Claude vai gerar os to-dos do cliente..." />
        </div>
      </div>
    </SlideShell>
  )
}
