export interface Obra {
  id: string;
  nome: string;
  endereco: string;
  dataInicio: string;
  orcamentoTotal: number;
  tetoMaoDeObra: number; // R$ 32.000,00 na Obra Juscelino Mola
  etapaAtualId: string;
  status: 'em_andamento' | 'planejamento' | 'concluida' | 'andamento' | 'cancelada';
  valorVenda?: number;
  etapaAtual?: string;
  observacoes?: string;
}

export interface Etapa {
  id: string;
  numero: number;
  nome: string;
  orcamentoPrevisto?: number;
  status: 'pendente' | 'em_andamento' | 'concluida';
}

export type CategoriaDespesa = 
  | 'materiais' 
  | 'mao_de_obra' 
  | 'trilhos_producao' 
  | 'abastecimentos' 
  | 'equipamentos' 
  | 'outros';

export type DestinoItem = 
  | 'obra' 
  | 'producao_trilhos' 
  | 'outra_obra' 
  | 'estoque_geral';

export type FormaPagamento = 
  | 'pix' 
  | 'dinheiro' 
  | 'cartao_credito' 
  | 'cartao_debito' 
  | 'boleto' 
  | 'transferencia' 
  | 'nao_informado';

export interface ItemDespesa {
  id: string;
  materialId: string;
  materialNome: string;
  quantidade: number;
  unidade: string; // kg, m, m², un, saco, milheiro, etc.
  valorUnitario: number;
  valorTotal: number;
  etapaId: string;
  destino: DestinoItem;
  observacoes?: string;
}

export interface Despesa {
  id: string;
  obraId: string;
  descricao: string;
  data: string; // YYYY-MM-DD
  categoria: CategoriaDespesa;
  fornecedorNome: string;
  etapaId: string;
  compradorNome: string;
  formaPagamento: FormaPagamento;
  cartaoId?: string;
  parcelasTotal?: number;
  parcelasStatus?: 'pendente' | 'geradas' | 'nao_aplicavel';
  valorTotalNota: number;
  valorSomaItens: number;
  diferencaRateio: number; // valorTotalNota - valorSomaItens
  itens: ItemDespesa[];
  comprovanteUrl?: string; // Link OneDrive ou anexo
  statusConferencia: 'ok' | 'pendente_info' | 'diferenca_rateio';
  observacoes?: string;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface Material {
  id: string;
  nome: string;
  unidadePadrao: string;
  categoriaSugerida?: string;
  dataCadastro: string;
}

export interface Trabalhador {
  id: string;
  nome: string;
  funcao: string; // Pedreiro, Servente, Eletricista, Encarregado, Carpinteiro
  cpf?: string;
  telefone?: string;
  chavePix?: string;
  valorDiariaPadrao: number;
  ativo: boolean;
  dataAdmissao: string;
}

export interface Diaria {
  id: string;
  obraId: string;
  trabalhadorId: string;
  trabalhadorNome: string;
  data: string; // YYYY-MM-DD
  fracao: number; // 0.5, 1.0, 1.5
  valorDiariaBase: number;
  valorCalculado: number; // fracao * valorDiariaBase
  valorAdicional: number; // serviço extra ou bônus
  descricaoAdicional?: string;
  justificativaAjuste?: string;
  valorTotal: number; // valorCalculado + valorAdicional
  etapaId: string;
  statusPagamento: 'pendente' | 'pago';
  dataPagamento?: string;
  reciboId?: string;
  comprovanteUrl?: string;
  criadoPor: string;
}

export interface ReciboPagamento {
  id: string;
  obraId: string;
  numeroRecibo: string;
  trabalhadorId: string;
  trabalhadorNome: string;
  trabalhadorCpf: string;
  trabalhadorFuncao: string;
  responsavelNome: string; // Quem pagou (Natanael / Obra Juscelino Mola)
  periodoInicio: string;
  periodoFim: string;
  diasEspecificos?: string[];
  valorTotal: number;
  valorPorExtenso: string;
  motivo: string;
  diariasIds: string[];
  dataEmissao: string;
  localCidade: string; // Goiânia - GO
  observacoes?: string;
}

export interface ItemOrcamento {
  id: string;
  materialId?: string;
  materialNome: string;
  quantidade: number;
  unidade: string;
  precoUnitarioCotado: number;
  valorTotalCotado: number;
}

export interface Orcamento {
  id: string;
  obraId: string;
  fornecedorEmpresa: string;
  identificacao: string; // Número ou título da cotação
  data: string;
  prazoValidade?: string;
  condicoesPagamento?: string;
  valorTotal: number;
  itens: ItemOrcamento[];
  status: 'em_cotacao' | 'aprovado' | 'recusado' | 'convertido_em_compra';
  despesaConvertidaId?: string;
  comprovanteOuPdfUrl?: string;
  observacoes?: string;
  criadoEm: string;
}

export interface ProducaoItem {
  id: string;
  obraId: string;
  produto: 'trilho' | 'placa_cimento' | 'outro';
  quantidade: number;
  comprimentoMetros?: number; // Ex: 1.5, 2.5, 3.2, 4.0 metros (trilhos)
  especificacao?: string;
  data: string;
  destino: string;
  observacoes?: string;
  criadoPor: string;
}

export interface CartaoConta {
  id: string;
  apelido: string; // Ex: Nubank Natanael, Inter Obra, Bradesco Alberto
  tipo: 'credito' | 'debito' | 'conta_corrente';
  bandeira?: string; // Visa, Mastercard, Elo
  ultimosDigitos?: string;
  diaFechamento?: number;
  diaVencimento?: number;
  limite?: number;
  titular: string;
}

export interface Parcela {
  id: string;
  despesaId: string;
  descricao: string;
  cartaoId?: string;
  numeroParcela: number;
  totalParcelas: number;
  valorParcela: number;
  dataVencimento: string;
  status: 'a_vencer' | 'paga' | 'em_atraso';
  dataPagamento?: string;
}

export type PerfilUsuario = 
  | 'master' 
  | 'admin' 
  | 'operador';

export interface PermissaoModulo {
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  avatarColor: string;
  ativo: boolean;
  dataCadastro?: string;
  permissoes: {
    dashboard: PermissaoModulo;
    despesas: PermissaoModulo;
    materiais: PermissaoModulo;
    maoDeObra: PermissaoModulo;
    recibos: PermissaoModulo;
    orcamentos: PermissaoModulo;
    producao: PermissaoModulo;
    cartoes: PermissaoModulo;
    usuarios: PermissaoModulo;
    relatorios: PermissaoModulo;
  };
}

export interface AlertaPendencia {
  id: string;
  tipo: 'diferenca_rateio' | 'sem_cartao' | 'sem_comprovante' | 'diarias_pendentes' | 'teto_orcamento';
  titulo: string;
  descricao: string;
  severidade: 'alta' | 'media' | 'baixa';
  entidadeId: string;
  moduloDestino: string;
  dataGerado: string;
}

export interface SolicitacaoAcesso {
  id: string;
  nome: string;
  email: string;
  mensagem: string;
  data: string; // YYYY-MM-DD HH:mm
  status: 'pendente' | 'aprovado' | 'recusado';
}

