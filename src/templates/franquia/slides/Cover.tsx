import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { EditableField } from '../../../components/slides/EditableField'
import { useTheme } from '../../../lib/themeContext'
import type { EditState } from '../../../lib/types'

interface CoverProps {
  eClient: EditState
  ePeriod: EditState
  unitCount: number
}

export function Cover({ eClient, ePeriod, unitCount }: CoverProps) {
  const t = useTheme()
  return (
    <SlideShell dark style={{
      background: t.coverBg,
      minHeight: 200,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <SlideLogo clientName={eClient.value} dark position="top-right" />
      <div style={{ fontSize: 11, color: t.coverAccentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>
        Relatório de Performance — Franquia
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: t.coverTitleColor, margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>
        <EditableField e={eClient} dark style={{ fontSize: 32, fontWeight: 900, color: t.coverTitleColor, letterSpacing: '-1px' }} placeholder="Nome do cliente" />
      </h1>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center' }}>
        <EditableField e={ePeriod} dark style={{ fontSize: 14, color: t.coverSubColor, fontWeight: 500 }} placeholder="Período" />
        <div style={{
          padding: '3px 10px', borderRadius: 20,
          background: t.coverBadgeBg, color: t.coverBadgeText,
          fontSize: 11, fontWeight: 700,
        }}>
          {unitCount} unidades
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: t.coverBarGradient,
      }} />
    </SlideShell>
  )
}
