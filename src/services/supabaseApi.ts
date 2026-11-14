import { supabase } from '../lib/supabase';
import { Obra, Despesa, Trabalhador } from '../types';

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
      etapaId: 'etapa-alvenaria',
      fornecedorNome: row.descricao,
      compradorNome: 'Administração',
      data: row.data_despesa,
      formaPagamento: (row.forma_pagamento?.toLowerCase() === 'pix' ? 'pix'
        : row.forma_pagamento?.toLowerCase() === 'cartão' ? 'cartao_credito'
        : row.forma_pagamento?.toLowerCase() === 'boleto' ? 'boleto'
        : row.forma_pagamento?.toLowerCase() === 'transferência' ? 'transferencia'
        : 'dinheiro'),
      cartaoId: row.cartao_id || undefined,
      valorTotalNota: Number(row.valor_total || 0),
      valorSomaItens: Number(row.valor_total || 0),
      diferencaRateio: 0,
      statusConferencia: 'ok',
      comprovanteUrl: row.comprovante_url || undefined,
      itens: [],
      criadoPor: 'Sistema / Supabase',
      criadoEm: row.created_at,
    }));
  },

  async criar(despesa: Partial<Despesa>): Promise<Despesa | null> {
    const formaPagtoMapeada = despesa.formaPagamento === 'cartao_credito' ? 'Cartão'
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
      etapaId: despesa.etapaId || 'etapa-alvenaria',
      fornecedorNome: despesa.fornecedorNome || data.descricao,
      compradorNome: despesa.compradorNome || 'Administração',
      data: data.data_despesa,
      formaPagamento: despesa.formaPagamento || 'dinheiro',
      cartaoId: data.cartao_id || undefined,
      valorTotalNota: Number(data.valor_total),
      valorSomaItens: despesa.valorSomaItens || Number(data.valor_total),
      diferencaRateio: despesa.diferencaRateio || 0,
      statusConferencia: despesa.statusConferencia || 'ok',
      comprovanteUrl: data.comprovante_url || undefined,
      itens: despesa.itens || [],
      criadoPor: despesa.criadoPor || 'Sistema',
      criadoEm: data.created_at,
    };
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
