import { Slide } from '../components/Slide'
import { SLIDE } from '../styles/tokens'

const OTIMIZACOES = [
  'Em todas as unidades subimos conjunto de "Não Seguidores" na campanha de visita ao perfil para aumentar seguidores.',
  'Trocamos e otimizamos as legendas das campanhas de conversão e conjuntos de Neutro Reserva, buscando urgência e escassez nos anúncios.',
  'Ajustamos o modelo de mensagem de conversão em todas as unidades e em cada campanha.',
  'Adicionamos conjunto de "Público Sertanejo" nas unidades de Curitiba, Maringá e Ribeirão Preto.',
]

interface FolksFranqueadoraProps {
  periodLabel: string
}

export function FolksFranqueadora({ periodLabel }: FolksFranqueadoraProps) {
  const month = periodLabel.split('/')[0].trim()

  return (
    <Slide bg={SLIDE.coverBg} padding="28px 36px">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#777', letterSpacing: '0.05em', marginBottom: 2 }}>
          Relatório Franqueadora
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: SLIDE.brand }}>
          Todas as unidades — {month}
        </div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Folks | 3P.</div>
      </div>

      <div style={{
        background: SLIDE.coverOverlay,
        border: `1px solid ${SLIDE.coverBorderOverlay}`,
        borderRadius: 10, padding: '16px 20px',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          Histórico de Otimizações e Testes
        </div>
        {OTIMIZACOES.map((t, i) => (
          <div key={i} style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            marginBottom: i < OTIMIZACOES.length - 1 ? 10 : 0,
          }}>
            <span style={{ color: SLIDE.brand, flexShrink: 0, marginTop: 1, fontSize: 12 }}>→</span>
            <span style={{ color: '#ccc', fontSize: 12, lineHeight: 1.6 }}>{t}</span>
          </div>
        ))}
      </div>
    </Slide>
  )
}
