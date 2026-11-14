import { supabase } from '../lib/supabase';
import { Obra, Despesa, Trabalhador, Diaria, ReciboPagamento, Material, ProducaoItem, CartaoConta, Usuario, PerfilUsuario } from '../types';

export const ObrasService = {
  async listar(): Promise<Obra[]> {
    const { data, error } = await supabase
      .from('obras')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar obras no Supabase:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      nome: row.nome,
      endereco: row.endereco || '',
      orcamentoTotal: Number(row.orcamento_previsto || 0),
      tetoMaoDeObra: 32000,
      etapaAtualId: 'etapa-alvenaria',
      dataInicio: row.data_inicio || '',
      status: 'em_andamento',
    }));
  },

  async criar(obra: Partial<Obra>): Promise<Obra | null> {
    const { data, error } = await supabase
      .from('obras')
      .insert({
        nome: obra.nome,
        endereco: obra.endereco,
        orcamento_previsto: obra.orcamentoTotal || 0,
        status: 'ativa',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar obra no Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      nome: data.nome,
      endereco: data.endereco || '',
      orcamentoTotal: Number(data.orcamento_previsto || 0),
      tetoMaoDeObra: 32000,
      etapaAtualId: 'etapa-alvenaria',
      dataInicio: data.data_inicio || '',
      status: 'em_andamento',
    };
  },

  async atualizar(id: string, obra: Partial<Obra>): Promise<boolean> {
    const payload: any = {};
    if (obra.nome !== undefined) payload.nome = obra.nome;
    if (obra.endereco !== undefined) payload.endereco = obra.endereco;
    if (obra.orcamentoTotal !== undefined) payload.orcamento_previsto = obra.orcamentoTotal;

    const { error } = await supabase
      .from('obras')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar obra no Supabase:', error);
      return false;
    }
    return true;
  },

  async remover(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('obras')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar obra no Supabase:', error);
      return false;
    }
    return true;
  }
};

export const DespesasService = {
  async listarPorObra(obraId: string): Promise<Despesa[]> {
    const { data, error } = await supabase
      .from('despesas')
      .select('*')
      .eq('obra_id', obraId)
      .order('data_despesa', { ascending: false });

    if (error) {
      console.error('Erro ao buscar despesas no Supabase:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      obraId: row.obra_id,
      descricao: row.descricao,
      categoria: (row.categoria as any) || 'outros',
      etapaId: row.etapa_id || 'etapa-alvenaria',
      fornecedorNome: row.fornecedor_nome || row.descricao,
      compradorNome: row.comprador_nome || 'Administração',
      data: row.data_despesa,
      formaPagamento: (row.forma_pagamento?.toLowerCase() === 'pix' ? 'pix'
        : row.forma_pagamento?.toLowerCase() === 'cartão' ? 'cartao_credito'
        : row.forma_pagamento?.toLowerCase() === 'cartao_debito' ? 'cartao_debito'
        : row.forma_pagamento?.toLowerCase() === 'boleto' ? 'boleto'
        : row.forma_pagamento?.toLowerCase() === 'transferência' ? 'transferencia'
        : row.forma_pagamento?.toLowerCase() === 'dinheiro' ? 'dinheiro'
        : 'dinheiro'),
      cartaoId: row.cartao_id || undefined,
      valorTotalNota: Number(row.valor_total || 0),
      valorSomaItens: Number(row.valor_total || 0),
      diferencaRateio: 0,
      statusConferencia: 'ok',
      comprovanteUrl: row.comprovante_url || undefined,
      observacoes: row.observacoes || undefined,
      itens: Array.isArray(row.itens) ? row.itens : [],
      criadoPor: row.comprador_nome || 'Sistema / Supabase',
      criadoEm: row.created_at,
    }));
  },

  async criar(despesa: Partial<Despesa>): Promise<Despesa | null> {
    const formaPagtoMapeada = despesa.formaPagamento === 'cartao_credito' ? 'Cartão'
      : despesa.formaPagamento === 'cartao_debito' ? 'Cartão'
      : despesa.formaPagamento === 'pix' ? 'Pix'
      : despesa.formaPagamento === 'dinheiro' ? 'Dinheiro'
      : despesa.formaPagamento === 'transferencia' ? 'Transferência'
      : despesa.formaPagamento === 'boleto' ? 'Boleto'
      : 'Dinheiro';

    const { data, error } = await supabase
      .from('despesas')
      .insert({
        obra_id: despesa.obraId,
        descricao: despesa.descricao,
        valor_total: despesa.valorTotalNota || 0,
        categoria: despesa.categoria || 'outros',
        forma_pagamento: formaPagtoMapeada,
        data_despesa: despesa.data || new Date().toISOString().split('T')[0],
        comprovante_url: despesa.comprovanteUrl,
        cartao_id: despesa.cartaoId || null,
        etapa_id: despesa.etapaId,
        fornecedor_nome: despesa.fornecedorNome,
        comprador_nome: despesa.compradorNome,
        observacoes: despesa.observacoes,
        itens: despesa.itens || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar despesa no Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      obraId: data.obra_id,
      descricao: data.descricao,
      categoria: data.categoria as any,
      etapaId: data.etapa_id || despesa.etapaId || 'etapa-alvenaria',
      fornecedorNome: data.fornecedor_nome || despesa.fornecedorNome || data.descricao,
      compradorNome: data.comprador_nome || despesa.compradorNome || 'Administração',
      data: data.data_despesa,
      formaPagamento: despesa.formaPagamento || 'dinheiro',
      cartaoId: data.cartao_id || undefined,
      valorTotalNota: Number(data.valor_total),
      valorSomaItens: despesa.valorSomaItens || Number(data.valor_total),
      diferencaRateio: despesa.diferencaRateio || 0,
      statusConferencia: despesa.statusConferencia || 'ok',
      comprovanteUrl: data.comprovante_url || undefined,
      observacoes: data.observacoes || despesa.observacoes,
      itens: Array.isArray(data.itens) ? data.itens : (despesa.itens || []),
      criadoPor: despesa.criadoPor || 'Sistema',
      criadoEm: data.created_at,
    };
  },

  async atualizar(id: string, despesa: Partial<Despesa>): Promise<boolean> {
    const payload: any = {};
    if (despesa.descricao !== undefined) payload.descricao = despesa.descricao;
    if (despesa.valorTotalNota !== undefined) payload.valor_total = despesa.valorTotalNota;
    if (despesa.categoria !== undefined) payload.categoria = despesa.categoria;
    if (despesa.data !== undefined) payload.data_despesa = despesa.data;
    if (despesa.comprovanteUrl !== undefined) payload.comprovante_url = despesa.comprovanteUrl;
    if (despesa.cartaoId !== undefined) payload.cartao_id = despesa.cartaoId || null;
    if (despesa.etapaId !== undefined) payload.etapa_id = despesa.etapaId;
    if (despesa.fornecedorNome !== undefined) payload.fornecedor_nome = despesa.fornecedorNome;
    if (despesa.compradorNome !== undefined) payload.comprador_nome = despesa.compradorNome;
    if (despesa.observacoes !== undefined) payload.observacoes = despesa.observacoes;
    if (despesa.itens !== undefined) payload.itens = despesa.itens;
    if (despesa.formaPagamento !== undefined) {
      payload.forma_pagamento = despesa.formaPagamento === 'cartao_credito' ? 'Cartão'
        : despesa.formaPagamento === 'cartao_debito' ? 'Cartão'
        : despesa.formaPagamento === 'pix' ? 'Pix'
        : despesa.formaPagamento === 'dinheiro' ? 'Dinheiro'
        : despesa.formaPagamento === 'transferencia' ? 'Transferência'
        : despesa.formaPagamento === 'boleto' ? 'Boleto'
        : 'Dinheiro';
    }

    const { error } = await supabase
      .from('despesas')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar despesa no Supabase:', error);
      return false;
    }
    return true;
  },

  async remover(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('despesas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar despesa no Supabase:', error);
      return false;
    }
    return true;
  }
};

export const TrabalhadoresService = {
  async listarPorObra(obraId?: string): Promise<Trabalhador[]> {
    let query = supabase.from('trabalhadores').select('*');
    if (obraId) {
      query = query.eq('obra_id', obraId);
    }
    const { data, error } = await query.order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar trabalhadores no Supabase:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      nome: row.nome,
      funcao: row.funcao,
      telefone: row.telefone || '',
      chavePix: row.chave_pix || '',
      valorDiariaPadrao: Number(row.valor_diaria_padrao || 0),
      ativo: row.ativo,
      dataAdmissao: row.created_at || '',
    }));
  },

  async criar(trab: Omit<Trabalhador, 'id' | 'dataAdmissao'>, obraId?: string): Promise<Trabalhador | null> {
    const payload: any = {
      nome: trab.nome,
      funcao: trab.funcao,
      telefone: trab.telefone,
      chave_pix: trab.chavePix,
      valor_diaria_padrao: trab.valorDiariaPadrao || 0,
      ativo: trab.ativo ?? true,
    };
    if (obraId) {
      payload.obra_id = obraId;
    }

    const { data, error } = await supabase
      .from('trabalhadores')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar trabalhador no Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      nome: data.nome,
      funcao: data.funcao,
      telefone: data.telefone || '',
      chavePix: data.chave_pix || '',
      valorDiariaPadrao: Number(data.valor_diaria_padrao || 0),
      ativo: data.ativo,
      dataAdmissao: data.created_at || '',
    };
  },

  async atualizar(id: string, trab: Partial<Trabalhador>): Promise<boolean> {
    const payload: any = {};
    if (trab.nome !== undefined) payload.nome = trab.nome;
    if (trab.funcao !== undefined) payload.funcao = trab.funcao;
    if (trab.telefone !== undefined) payload.telefone = trab.telefone;
    if (trab.chavePix !== undefined) payload.chave_pix = trab.chavePix;
    if (trab.valorDiariaPadrao !== undefined) payload.valor_diaria_padrao = trab.valorDiariaPadrao;
    if (trab.ativo !== undefined) payload.ativo = trab.ativo;

    const { error } = await supabase
      .from('trabalhadores')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar trabalhador no Supabase:', error);
      return false;
    }
    return true;
  }
};

export const DiariasService = {
  async listarPorObra(obraId: string): Promise<Diaria[]> {
    const { data, error } = await supabase
      .from('diarias')
      .select('*, trabalhadores(nome)')
      .eq('obra_id', obraId)
      .order('data_diaria', { ascending: false });

    if (error) {
      console.error('Erro ao buscar diárias no Supabase:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      obraId: row.obra_id,
      trabalhadorId: row.trabalhador_id,
      trabalhadorNome: row.trabalhadores?.nome || 'Trabalhador',
      data: row.data_diaria,
      fracao: Number(row.fracao || 1.0),
      valorDiariaBase: Number(row.valor_diaria_base || row.valor || 0),
      valorCalculado: Number(row.valor || 0),
      valorAdicional: Number(row.valor_adicional || 0),
      descricaoAdicional: row.descricao_adicional || undefined,
      justificativaAjuste: row.justificativa_ajuste || undefined,
      valorTotal: Number(row.valor || 0) + Number(row.valor_adicional || 0),
      etapaId: row.etapa_id || 'etapa-alvenaria',
      statusPagamento: row.status === 'pago' ? 'pago' : 'pendente',
      reciboId: row.recibo_id || undefined,
      comprovanteUrl: row.comprovante_url || undefined,
      criadoPor: row.criado_por || 'Sistema',
    }));
  },

  async criar(diaria: Partial<Diaria>): Promise<Diaria | null> {
    const { data, error } = await supabase
      .from('diarias')
      .insert({
        obra_id: diaria.obraId,
        trabalhador_id: diaria.trabalhadorId,
        data_diaria: diaria.data,
        valor: diaria.valorCalculado || diaria.valorTotal || 0,
        fracao: diaria.fracao || 1.0,
        valor_diaria_base: diaria.valorDiariaBase || 0,
        valor_adicional: diaria.valorAdicional || 0,
        descricao_adicional: diaria.descricaoAdicional,
        justificativa_ajuste: diaria.justificativaAjuste,
        etapa_id: diaria.etapaId,
        status: diaria.statusPagamento || 'pendente',
        recibo_id: diaria.reciboId,
        comprovante_url: diaria.comprovanteUrl,
        criado_por: diaria.criadoPor,
      })
      .select('*, trabalhadores(nome)')
      .single();

    if (error) {
      console.error('Erro ao criar diária no Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      obraId: data.obra_id,
      trabalhadorId: data.trabalhador_id,
      trabalhadorNome: data.trabalhadores?.nome || diaria.trabalhadorNome || 'Trabalhador',
      data: data.data_diaria,
      fracao: Number(data.fracao || 1.0),
      valorDiariaBase: Number(data.valor_diaria_base || 0),
      valorCalculado: Number(data.valor || 0),
      valorAdicional: Number(data.valor_adicional || 0),
      descricaoAdicional: data.descricao_adicional || undefined,
      justificativaAjuste: data.justificativa_ajuste || undefined,
      valorTotal: Number(data.valor || 0) + Number(data.valor_adicional || 0),
      etapaId: data.etapa_id || diaria.etapaId || 'etapa-alvenaria',
      statusPagamento: data.status === 'pago' ? 'pago' : 'pendente',
      reciboId: data.recibo_id || undefined,
      comprovanteUrl: data.comprovante_url || undefined,
      criadoPor: data.criado_por || 'Sistema',
    };
  },

  async atualizar(id: string, diaria: Partial<Diaria>): Promise<boolean> {
    const payload: any = {};
    if (diaria.statusPagamento !== undefined) payload.status = diaria.statusPagamento;
    if (diaria.reciboId !== undefined) payload.recibo_id = diaria.reciboId;
    if (diaria.valorTotal !== undefined) payload.valor = diaria.valorTotal;
    if (diaria.valorAdicional !== undefined) payload.valor_adicional = diaria.valorAdicional;
    if (diaria.fracao !== undefined) payload.fracao = diaria.fracao;
    if (diaria.data !== undefined) payload.data_diaria = diaria.data;
    if (diaria.comprovanteUrl !== undefined) payload.comprovante_url = diaria.comprovanteUrl;

    const { error } = await supabase
      .from('diarias')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar diária no Supabase:', error);
      return false;
    }
    return true;
  },

  async remover(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('diarias')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir diária no Supabase:', error);
      return false;
    }
    return true;
  }
};

export const RecibosService = {
  async listarPorObra(obraId: string): Promise<ReciboPagamento[]> {
    const { data, error } = await supabase
      .from('recibos')
      .select('*')
      .eq('obra_id', obraId)
      .order('data_emissao', { ascending: false });

    if (error) {
      console.error('Erro ao buscar recibos no Supabase:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      obraId: row.obra_id,
      numeroRecibo: String(row.numero_recibo || row.id.substring(0, 8)),
      trabalhadorId: row.trabalhador_id,
      trabalhadorNome: row.trabalhador_nome || 'Trabalhador',
      trabalhadorCpf: row.trabalhador_cpf || '',
      trabalhadorFuncao: row.trabalhador_funcao || '',
      responsavelNome: row.responsavel_nome || 'Administração',
      periodoInicio: row.periodo_inicio,
      periodoFim: row.periodo_fim,
      valorTotal: Number(row.valor_liquido || row.valor_bruto || 0),
      valorPorExtenso: row.valor_extenso || '',
      motivo: row.motivo || 'Pagamento de diárias de mão de obra',
      diariasIds: Array.isArray(row.diarias_ids) ? row.diarias_ids : [],
      dataEmissao: row.data_emissao || new Date().toISOString(),
      localCidade: row.local_cidade || 'Goiânia - GO',
      observacoes: row.observacoes || undefined,
    }));
  },

  async criar(recibo: Partial<ReciboPagamento>): Promise<ReciboPagamento | null> {
    const { data, error } = await supabase
      .from('recibos')
      .insert({
        obra_id: recibo.obraId,
        trabalhador_id: recibo.trabalhadorId,
        periodo_inicio: recibo.periodoInicio,
        periodo_fim: recibo.periodoFim,
        valor_bruto: recibo.valorTotal || 0,
        valor_liquido: recibo.valorTotal || 0,
        trabalhador_nome: recibo.trabalhadorNome,
        trabalhador_cpf: recibo.trabalhadorCpf,
        trabalhador_funcao: recibo.trabalhadorFuncao,
        responsavel_nome: recibo.responsavelNome,
        valor_extenso: recibo.valorPorExtenso,
        motivo: recibo.motivo,
        local_cidade: recibo.localCidade,
        diarias_ids: recibo.diariasIds || [],
        observacoes: recibo.observacoes,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao emitir recibo no Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      obraId: data.obra_id,
      numeroRecibo: String(data.numero_recibo || data.id.substring(0, 8)),
      trabalhadorId: data.trabalhador_id,
      trabalhadorNome: data.trabalhador_nome || recibo.trabalhadorNome || '',
      trabalhadorCpf: data.trabalhador_cpf || '',
      trabalhadorFuncao: data.trabalhador_funcao || '',
      responsavelNome: data.responsavel_nome || '',
      periodoInicio: data.periodo_inicio,
      periodoFim: data.periodo_fim,
      valorTotal: Number(data.valor_liquido || data.valor_bruto || 0),
      valorPorExtenso: data.valor_extenso || '',
      motivo: data.motivo || '',
      diariasIds: Array.isArray(data.diarias_ids) ? data.diarias_ids : [],
      dataEmissao: data.data_emissao,
      localCidade: data.local_cidade || 'Goiânia - GO',
      observacoes: data.observacoes || undefined,
    };
  },

  async remover(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('recibos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir recibo no Supabase:', error);
      return false;
    }
    return true;
  }
};

export const MateriaisService = {
  async listarPorObra(obraId?: string): Promise<Material[]> {
    let query = supabase.from('materiais').select('*');
    if (obraId) {
      query = query.eq('obra_id', obraId);
    }
    const { data, error } = await query.order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar materiais no Supabase:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      nome: row.nome,
      unidadePadrao: row.unidade_medida || 'un',
      categoriaSugerida: row.categoria_sugerida || undefined,
      dataCadastro: row.created_at ? row.created_at.split('T')[0] : '',
    }));
  },

  async criar(mat: Omit<Material, 'id' | 'dataCadastro'>, obraId?: string): Promise<Material | null> {
    const payload: any = {
      nome: mat.nome,
      unidade_medida: mat.unidadePadrao,
      categoria_sugerida: mat.categoriaSugerida,
    };
    if (obraId) {
      payload.obra_id = obraId;
    }

    const { data, error } = await supabase
      .from('materiais')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Erro ao cadastrar material no Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      nome: data.nome,
      unidadePadrao: data.unidade_medida,
      categoriaSugerida: data.categoria_sugerida || undefined,
      dataCadastro: data.created_at ? data.created_at.split('T')[0] : '',
    };
  },

  async atualizar(id: string, mat: Partial<Material>): Promise<boolean> {
    const payload: any = {};
    if (mat.nome !== undefined) payload.nome = mat.nome;
    if (mat.unidadePadrao !== undefined) payload.unidade_medida = mat.unidadePadrao;
    if (mat.categoriaSugerida !== undefined) payload.categoria_sugerida = mat.categoriaSugerida;

    const { error } = await supabase
      .from('materiais')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar material no Supabase:', error);
      return false;
    }
    return true;
  },

  async remover(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('materiais')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover material no Supabase:', error);
      return false;
    }
    return true;
  }
};

export const ProducaoService = {
  async listarPorObra(obraId: string): Promise<ProducaoItem[]> {
    const { data, error } = await supabase
      .from('producao_apontamentos')
      .select('*')
      .eq('obra_id', obraId)
      .order('data_apontamento', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produção no Supabase:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      obraId: row.obra_id,
      produto: row.produto || row.item_etapa,
      quantidade: Number(row.quantidade_executada || 0),
      comprimentoMetros: row.comprimento_metros ? Number(row.comprimento_metros) : undefined,
      especificacao: row.especificacao || undefined,
      data: row.data_apontamento,
      destino: row.destino || 'Obra Juscelino Mola',
      observacoes: row.observacoes || undefined,
      criadoPor: row.criado_por || 'Sistema',
    }));
  },

  async criar(item: Partial<ProducaoItem>): Promise<ProducaoItem | null> {
    const { data, error } = await supabase
      .from('producao_apontamentos')
      .insert({
        obra_id: item.obraId,
        data_apontamento: item.data || new Date().toISOString().split('T')[0],
        item_etapa: item.produto || 'Produção',
        quantidade_executada: item.quantidade || 0,
        unidade: 'un',
        produto: item.produto,
        comprimento_metros: item.comprimentoMetros,
        especificacao: item.especificacao,
        destino: item.destino,
        observacoes: item.observacoes,
        criado_por: item.criadoPor,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar produção no Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      obraId: data.obra_id,
      produto: data.produto || data.item_etapa,
      quantidade: Number(data.quantidade_executada || 0),
      comprimentoMetros: data.comprimento_metros ? Number(data.comprimento_metros) : undefined,
      especificacao: data.especificacao || undefined,
      data: data.data_apontamento,
      destino: data.destino || 'Obra',
      observacoes: data.observacoes || undefined,
      criadoPor: data.criado_por || 'Sistema',
    };
  },

  async atualizar(id: string, item: Partial<ProducaoItem>): Promise<boolean> {
    const payload: any = {};
    if (item.produto !== undefined) {
      payload.produto = item.produto;
      payload.item_etapa = item.produto;
    }
    if (item.quantidade !== undefined) payload.quantidade_executada = item.quantidade;
    if (item.comprimentoMetros !== undefined) payload.comprimento_metros = item.comprimentoMetros;
    if (item.especificacao !== undefined) payload.especificacao = item.especificacao;
    if (item.data !== undefined) payload.data_apontamento = item.data;
    if (item.destino !== undefined) payload.destino = item.destino;
    if (item.observacoes !== undefined) payload.observacoes = item.observacoes;

    const { error } = await supabase
      .from('producao_apontamentos')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar produção no Supabase:', error);
      return false;
    }
    return true;
  },

  async remover(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('producao_apontamentos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir apontamento de produção no Supabase:', error);
      return false;
    }
    return true;
  }
};

export const CartoesService = {
  async listarPorObra(obraId?: string): Promise<CartaoConta[]> {
    let query = supabase
      .from('cartoes')
      .select('*')
      .order('created_at', { ascending: true });

    if (obraId) {
      query = query.eq('obra_id', obraId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar cartões no Supabase:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      apelido: row.nome,
      tipo: row.tipo || (row.limite_total > 0 ? 'credito' : 'conta_corrente'),
      bandeira: row.bandeira || 'Mastercard',
      ultimosDigitos: row.ultimos_digitos || '',
      diaFechamento: row.dia_fechamento || 25,
      diaVencimento: row.dia_vencimento || 5,
      limite: Number(row.limite_total || 0),
      titular: row.titular || 'Natanael Master',
    }));
  },

  async criar(cartao: Partial<CartaoConta>, obraId?: string): Promise<CartaoConta | null> {
    const payload: any = {
      nome: cartao.apelido || 'Novo Cartão',
      ultimos_digitos: cartao.ultimosDigitos || '',
      limite_total: cartao.limite || 0,
      dia_fechamento: cartao.diaFechamento || 25,
      dia_vencimento: cartao.diaVencimento || 5,
      ativo: true,
    };

    if (obraId) {
      payload.obra_id = obraId;
    }

    const { data, error } = await supabase
      .from('cartoes')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Erro ao cadastrar cartão no Supabase:', error);
      return null;
    }

    return {
      id: data.id,
      apelido: data.nome,
      tipo: data.tipo || (data.limite_total > 0 ? 'credito' : 'conta_corrente'),
      bandeira: data.bandeira || cartao.bandeira || 'Mastercard',
      ultimosDigitos: data.ultimos_digitos || '',
      diaFechamento: data.dia_fechamento || 25,
      diaVencimento: data.dia_vencimento || 5,
      limite: Number(data.limite_total || 0),
      titular: data.titular || cartao.titular || 'Natanael Master',
    };
  },

  async atualizar(id: string, cartao: Partial<CartaoConta>): Promise<boolean> {
    const payload: any = {};
    if (cartao.apelido !== undefined) payload.nome = cartao.apelido;
    if (cartao.ultimosDigitos !== undefined) payload.ultimos_digitos = cartao.ultimosDigitos;
    if (cartao.limite !== undefined) payload.limite_total = cartao.limite;
    if (cartao.diaFechamento !== undefined) payload.dia_fechamento = cartao.diaFechamento;
    if (cartao.diaVencimento !== undefined) payload.dia_vencimento = cartao.diaVencimento;

    const { error } = await supabase
      .from('cartoes')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar cartão no Supabase:', error);
      return false;
    }
    return true;
  },

  async remover(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('cartoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover cartão no Supabase:', error);
      return false;
    }
    return true;
  }
};

export const UsuariosService = {
  async listar(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios_perfis')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao listar perfis de usuários no Supabase:', error);
      return [];
    }

    return (data || []).map(row => {
      const perfilRole = row.role === 'admin' ? 'admin' : row.role === 'operador' ? 'operador' : 'master';
      return {
        id: row.id,
        nome: row.nome,
        email: row.email,
        perfil: perfilRole,
        avatarColor: '#0085db',
        ativo: true,
        dataCadastro: row.created_at ? row.created_at.split('T')[0] : '2026-01-01',
        permissoes: {
          dashboard: { visualizar: true, criar: perfilRole !== 'operador', editar: perfilRole !== 'operador', excluir: perfilRole === 'master' },
          despesas: { visualizar: true, criar: true, editar: true, excluir: perfilRole === 'master' },
          materiais: { visualizar: true, criar: true, editar: true, excluir: perfilRole === 'master' },
          maoDeObra: { visualizar: true, criar: true, editar: true, excluir: perfilRole === 'master' },
          recibos: { visualizar: true, criar: true, editar: true, excluir: perfilRole === 'master' },
          orcamentos: { visualizar: true, criar: true, editar: true, excluir: perfilRole === 'master' },
          producao: { visualizar: true, criar: true, editar: true, excluir: perfilRole === 'master' },
          cartoes: { visualizar: true, criar: perfilRole !== 'operador', editar: perfilRole !== 'operador', excluir: perfilRole === 'master' },
          usuarios: { visualizar: perfilRole !== 'operador', criar: perfilRole === 'master', editar: perfilRole === 'master', excluir: perfilRole === 'master' },
          relatorios: { visualizar: true, criar: true, editar: true, excluir: perfilRole === 'master' },
        },
      };
    });
  },

  async sincronizarPerfil(usuario: Partial<Usuario>): Promise<boolean> {
    if (!usuario.id || !usuario.email) return false;

    const roleMap = usuario.perfil === 'master' ? 'admin' : usuario.perfil === 'admin' ? 'admin' : 'operador';
    const payload = {
      id: usuario.id,
      nome: usuario.nome || usuario.email.split('@')[0],
      email: usuario.email,
      role: roleMap,
    };

    const { error } = await supabase
      .from('usuarios_perfis')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Erro ao sincronizar perfil de usuário no Supabase:', error);
      return false;
    }
    return true;
  },

  async atualizarRole(id: string, perfil: PerfilUsuario): Promise<boolean> {
    const roleMap = perfil === 'master' ? 'admin' : perfil === 'admin' ? 'admin' : 'operador';
    const { error } = await supabase
      .from('usuarios_perfis')
      .update({ role: roleMap })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar papel do usuário no Supabase:', error);
      return false;
    }
    return true;
  },

  async remover(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('usuarios_perfis')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao remover perfil de usuário no Supabase:', error);
      return false;
    }
    return true;
  }
};
