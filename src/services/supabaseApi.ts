import { supabase } from '../lib/supabase';
import { Obra, Trabalhador } from '../types';

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
  }
};

export const DespesasService = {
  async listarPorObra(obraId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('despesas')
      .select('*')
      .eq('obra_id', obraId)
      .order('data_despesa', { ascending: false });

    if (error) {
      console.error('Erro ao buscar despesas no Supabase:', error);
      return [];
    }

    return data || [];
  },

  async criar(despesa: {
    obraId: string;
    descricao: string;
    valorTotal: number;
    categoria: string;
    formaPagamento: string;
    dataDespesa?: string;
  }): Promise<any | null> {
    const { data, error } = await supabase
      .from('despesas')
      .insert({
        obra_id: despesa.obraId,
        descricao: despesa.descricao,
        valor_total: despesa.valorTotal,
        categoria: despesa.categoria,
        forma_pagamento: despesa.formaPagamento,
        data_despesa: despesa.dataDespesa || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar despesa no Supabase:', error);
      return null;
    }

    return data;
  }
};

export const TrabalhadoresService = {
  async listarPorObra(obraId: string): Promise<Trabalhador[]> {
    const { data, error } = await supabase
      .from('trabalhadores')
      .select('*')
      .eq('obra_id', obraId)
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar trabalhadores no Supabase:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      obraId: row.obra_id,
      nome: row.nome,
      funcao: row.funcao,
      telefone: row.telefone || '',
      chavePix: row.chave_pix || '',
      valorDiariaPadrao: Number(row.valor_diaria_padrao || 0),
      ativo: row.ativo,
      dataAdmissao: row.created_at || '',
    }));
  }
};
