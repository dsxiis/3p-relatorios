import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { EditableField } from '../../../components/slides/EditableField'
import { useTheme } from '../../../lib/themeContext'
import type { EditState } from '../../../lib/types'

interface CoverProps {
  eClient: EditState
  ePeriod: EditState
}

export function Cover({ eClient, ePeriod }: CoverProps) {
  const t = useTheme()
  return (
    <SlideShell dark style={{
      background: t.coverBg,
      minHeight: 260,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <SlideLogo clientName={eClient.value} dark position="top-right" />
      <div style={{ fontSize: 13, color: t.coverAccentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>
        Relatório de Performance
      </div>
      <h1 style={{ fontSize: 42, fontWeight: 900, color: t.coverTitleColor, margin: 0, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
        <EditableField e={eClient} dark style={{ fontSize: 42, fontWeight: 900, color: t.coverTitleColor, letterSpacing: '-1.5px' }} placeholder="Nome do cliente" />
      </h1>
      <div style={{ display: 'flex', gap: 16, marginTop: 14, alignItems: 'center' }}>
        <EditableField e={ePeriod} dark style={{ fontSize: 16, color: t.coverSubColor, fontWeight: 500 }} placeholder="Período" />
        <div style={{
          padding: '4px 12px', borderRadius: 20,
          background: t.coverBadgeBg, color: t.coverBadgeText,
          fontSize: 12, fontWeight: 700, letterSpacing: '0.5px',
        }}>
          Lead Gen
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: t.coverBarGradient,
      }} />
    </SlideShell>
  )
}
