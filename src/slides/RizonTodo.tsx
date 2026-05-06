import { Slide } from '../components/Slide'
import type { RizonData } from '../lib/mockData'
import { SLIDE } from '../styles/tokens'

interface RizonTodoProps {
  data: RizonData
  mkEdit?: (id: string, defaultValue: string) => void
}

export function RizonTodo({ data }: RizonTodoProps) {
  return (
    <Slide bg={SLIDE.coverBg} padding="34px 44px">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: SLIDE.brand }}>To Do:</div>

        {/* Full list */}
        <div style={{
          background: SLIDE.coverOverlay,
          border: `1px solid ${SLIDE.coverBorderOverlay}`,
          borderRadius: 12, padding: '18px 24px',
          width: '100%', maxWidth: 560,
        }}>
          {data.todos3P.map((t, i) => (
            <div key={i} style={{
              display: 'flex', gap: 9, alignItems: 'flex-start',
              marginBottom: i < data.todos3P.length - 1 ? 11 : 0,
            }}>
              <span style={{ color: '#22C55E', flexShrink: 0, marginTop: 1 }}>✅</span>
              <span style={{ color: '#fff', fontSize: 13, lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </div>

        {/* Responsibility split */}
        <div style={{
          display: 'flex', gap: 48,
          width: '100%', maxWidth: 560, justifyContent: 'center',
        }}>
          {[
            ['3P:', data.todos3P.slice(0, 2)],
            ['Rizon:', data.todosCliente],
          ].map(([title, items]) => (
            <div key={String(title)}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 7 }}>{title}</div>
              {(items as string[]).map((t, i) => (
                <div key={i} style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{t}</div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 800, color: '#444' }}>rizon | 3P. Marketing</div>
      </div>
    </Slide>
  )
}
