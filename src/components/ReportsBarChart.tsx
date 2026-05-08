import type { MonthlyCount } from '../lib/types'
import { T } from '../styles/tokens'

interface ReportsBarChartProps {
  months: MonthlyCount[]
}

function getLast6Months(): string[] {
  const result: string[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    result.push(`${y}-${m}`)
  }
  return result
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '')
    .replace(/^\w/, c => c.toUpperCase())
}

export function ReportsBarChart({ months }: ReportsBarChartProps) {
  const slots = getLast6Months()
  const countMap = new Map(months.map(m => [m.month, Number(m.count)]))
  const data = slots.map(s => ({ month: s, count: countMap.get(s) ?? 0 }))
  const maxCount = Math.max(...data.map(d => d.count), 1)

  // SVG layout
  const W = 480
  const H = 160
  const PADDING_LEFT = 8
  const PADDING_RIGHT = 8
  const CHART_TOP = 28
  const CHART_BOTTOM = 120
  const LABEL_Y = 145
  const chartWidth = W - PADDING_LEFT - PADDING_RIGHT
  const barCount = data.length
  const barWidth = Math.floor(chartWidth / barCount * 0.55)
  const step = chartWidth / barCount
  const maxBarH = CHART_BOTTOM - CHART_TOP

  return (
    <div style={{
      background: T.surface,
      border: `0.5px solid ${T.border}`,
      borderRadius: 14,
      padding: '16px 18px 12px',
      height: '100%',
      minHeight: 220,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: T.hint,
        letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Relatórios por mês
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', flex: 1 }}
        aria-label="Gráfico de relatórios por mês"
      >
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B44FF" />
            <stop offset="100%" stopColor="#5B18A8" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = CHART_BOTTOM - frac * maxBarH
          return (
            <line
              key={frac}
              x1={PADDING_LEFT} y1={y}
              x2={W - PADDING_RIGHT} y2={y}
              stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3"
            />
          )
        })}

        {data.map((d, i) => {
          const barH = d.count === 0 ? 0 : Math.max((d.count / maxCount) * maxBarH, 4)
          const x = PADDING_LEFT + i * step + (step - barWidth) / 2
          const y = CHART_BOTTOM - barH
          const delay = i * 60

          return (
            <g key={d.month}>
              {/* Bar */}
              {d.count > 0 && (
                <rect
                  x={x} y={y}
                  width={barWidth} height={barH}
                  rx={4} ry={4}
                  fill="url(#bar-grad)"
                  style={{
                    transformOrigin: `${x + barWidth / 2}px ${CHART_BOTTOM}px`,
                    animation: `bar-grow 0.5s cubic-bezier(.25,.46,.45,.94) ${delay}ms both`,
                  }}
                />
              )}
              {/* Empty bar placeholder */}
              {d.count === 0 && (
                <rect
                  x={x} y={CHART_BOTTOM - 2}
                  width={barWidth} height={2}
                  rx={1} fill="var(--border)"
                />
              )}
              {/* Count label */}
              {d.count > 0 && (
                <text
                  x={x + barWidth / 2} y={y - 5}
                  textAnchor="middle"
                  fontSize="11" fontWeight="700"
                  fill="var(--muted)"
                  style={{ animation: `fadein 0.4s ease ${delay + 300}ms both` }}
                >
                  {d.count}
                </text>
              )}
              {/* Month label */}
              <text
                x={x + barWidth / 2} y={LABEL_Y}
                textAnchor="middle"
                fontSize="11" fontWeight="600"
                fill="var(--hint)"
              >
                {monthLabel(d.month)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
