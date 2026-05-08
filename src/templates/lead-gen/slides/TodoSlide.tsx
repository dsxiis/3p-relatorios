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
  eTodoVisible: EditState
}

export function TodoSlide({ clientName, todos3P, todosClient, e3P, eClient, eTodoVisible }: TodoSlideProps) {
  void todos3P
  void todosClient

  if (eTodoVisible.value === 'false') return null

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} position="top-right" />
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#8833ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          To Do — Próximo Mês
        </div>
        <button
          data-editor-only="true"
          onClick={() => {
            if (confirm('Remover o slide de To Do do relatório? Você pode restaurar depois.')) {
              eTodoVisible.change('false')
              eTodoVisible.save('false')
            }
          }}
          style={{
            position: 'absolute', top: -4, right: 0, zIndex: 5,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'none', border: '0.5px solid #999',
            borderRadius: 6, padding: '4px 10px',
            fontSize: 11, color: '#999', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.borderColor = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,107,107,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#999'; e.currentTarget.style.borderColor = '#999'; e.currentTarget.style.background = 'none' }}
          title="Remover slide de To Do"
        >
          × Remover slide
        </button>
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
