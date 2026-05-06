/* Mock data matching DB seed — used for preview when raw_data is null */

export interface RizonVendedorData {
  id: string
  inv: string
  impressoes: string
  leads: string
  cpl: string
  cplPrev: string
  cliques: string
  leadsTop: string
  cplTop: string
  anotacoes: string
}

export interface RizonData {
  period: string
  investment: string
  alcance: string
  impressoes: string
  cliques: string
  leads: string
  cpl: string
  vendedores: RizonVendedorData[]
  todos3P: string[]
  todosCliente: string[]
}

export interface FolksUnitData {
  city: string
  impressoes: string
  alcance: string
  conversas: string
  cpc: string
  valor: string
  adCliques: string
  adMsg: string
  adCpl: string
  vidCliques: string
  vidMsg: string
  vidCpl: string
  anotacoes: string
}

export interface FolksData {
  units: FolksUnitData[]
}

export const MOCK_RIZON: RizonData = {
  period: '01/03 - 31/03',
  investment: '4.365,28',
  alcance: '95.031',
  impressoes: '249.649',
  cliques: '1.329',
  leads: '469',
  cpl: '8,61',
  vendedores: [
    {
      id: '0110',
      inv: 'R$851,22',
      impressoes: '70.526',
      leads: '220',
      cpl: 'R$ 3,87',
      cplPrev: 'FEV - R$3,38',
      cliques: '261',
      leadsTop: '152',
      cplTop: 'R$ 1,07',
      anotacoes:
        'Velocity Saga: 152 leads a R$1,07/lead (FEV: R$0,99).\n\nRefiladora Trimmer: 21 leads a R$7,82. Criativo com fundo de gráfica gerou custo melhor em fevereiro.\n\nPara Abril: adicionar vídeo no Plotter de Recorte para reduzir CPL. Demais máquinas aguardam takes.',
    },
    {
      id: '1816',
      inv: 'R$1.008,38',
      impressoes: '67.423',
      leads: '132',
      cpl: 'R$ 7,64',
      cplPrev: 'FEV - R$6,32',
      cliques: '19',
      leadsTop: '11',
      cplTop: 'R$ 3,19',
      anotacoes:
        'Solda Banner: 91 leads a R$7,73/lead (FEV: R$6,21). Criativo fundo gráfica em destaque.\n\nDobradeira + Gabarito: 41 leads a R$7,44. Mesmo criativo se destacou aqui também.\n\nAmbas as máquinas recebem vídeos em Abril.',
    },
    {
      id: '0117',
      inv: 'R$1.085,34',
      impressoes: '45.455',
      leads: '45',
      cpl: 'R$ 24,12',
      cplPrev: 'FEV - R$20,77',
      cliques: '7',
      leadsTop: '4',
      cplTop: 'R$ 4,37',
      anotacoes:
        'Impressora UV: 21 leads a R$18,79 (melhora vs R$33 anterior).\n\nMesa de Corte: 21 leads a R$24,53 (FEV: R$17,46).\n\nLaser: 3 leads a R$56,67 — entrega lenta por orçamento diário baixo.\n\nPara Abril: subir vídeos para Mesa de Corte inicialmente.',
    },
  ],
  todos3P: [
    'Subir vídeos — Plotter de Recorte (prioridade)',
    'Reavaliar distribuição de orçamento para máquinas top',
    'Avaliar pipeline de vendedores sem conversões ainda',
    'Conferir novas estratégias para máquinas sem retorno',
  ],
  todosCliente: ['Enviar feedback da feira', 'Marcar reunião de Abril'],
}

export const MOCK_FOLKS: FolksData = {
  units: [
    {
      city: 'Campinas',
      impressoes: '575.549',
      alcance: '236.010',
      conversas: '162',
      cpc: 'R$ 7,97',
      valor: 'R$3.919,24',
      adCliques: '91',
      adMsg: '22',
      adCpl: 'R$ 5,00',
      vidCliques: '52',
      vidMsg: '32',
      vidCpl: 'R$ 5,05',
      anotacoes:
        'Noite dos Solteiros performou pelo 2º mês consecutivo. Vídeo de aniversário trouxe conversas a custo muito bom — replicar esse formato!\n\nValidar alinhamento do público antes das próximas otimizações.',
    },
    {
      city: 'Florianópolis',
      impressoes: '1.844.456',
      alcance: '488.339',
      conversas: '748',
      cpc: 'R$ 7,47',
      valor: 'R$10.136,81',
      adCliques: '275',
      adMsg: '110',
      adCpl: 'R$ 4,18',
      vidCliques: '522',
      vidMsg: '145',
      vidCpl: 'R$ 6,02',
      anotacoes:
        'Maior verba no início do mês para aproveitar inauguração — +320 contatos para reservas.\n\nNo final de março segmentamos regiões de Floripa com mais assertividade buscando público mais qualificado.',
    },
    {
      city: 'Londrina',
      impressoes: '1.361.118',
      alcance: '198.544',
      conversas: '242',
      cpc: 'R$12,74',
      valor: 'R$5.852,58',
      adCliques: '274',
      adMsg: '61',
      adCpl: 'R$ 6,89',
      vidCliques: '97',
      vidMsg: '27',
      vidCpl: 'R$ 4,61',
      anotacoes:
        'Fluxo de conversas melhorou com barreiras de qualificação ativas. Em Abril, campanha BDAY migra para WhatsApp.\n\nAguardamos feedback das conversas para definir próximas otimizações.',
    },
    {
      city: 'Maringá',
      impressoes: '936.905',
      alcance: '281.312',
      conversas: '195',
      cpc: 'R$8,32',
      valor: 'R$5.946,20',
      adCliques: '153',
      adMsg: '45',
      adCpl: 'R$ 3,57',
      vidCliques: '16',
      vidMsg: '15',
      vidCpl: 'R$ 6,10',
      anotacoes:
        'Alcançamos número considerável de contas no período. Ambos criativos em destaque foram para campanha BDAY.\n\nPara Abril: subir campanha de nome na lista para movimentar a pista da casa.',
    },
  ],
}
