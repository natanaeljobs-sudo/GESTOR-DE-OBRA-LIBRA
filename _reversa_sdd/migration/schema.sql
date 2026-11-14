-- ==============================================================================
-- SISTEMA LIBRA - OBRAS: SCHEMA DDL COMPLETO (PostgreSQL / Supabase)
-- Origem: _reversa_sdd/migration/target_data_model.md
-- ==============================================================================

-- 0. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE OBRAS
CREATE TABLE IF NOT EXISTS public.obras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    orcamento_previsto NUMERIC(15,2) DEFAULT 0.00,
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'pausada')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE PERFIS DE USUÁRIOS (vinculada ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.usuarios_perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'operador' CHECK (role IN ('admin', 'engenheiro', 'mestre', 'operador')),
    obra_padrao_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CARTOES DE CRÉDITO CORPORATIVOS
CREATE TABLE IF NOT EXISTS public.cartoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    ultimos_digitos VARCHAR(4),
    limite_total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    dia_fechamento INT NOT NULL CHECK (dia_fechamento BETWEEN 1 AND 31),
    dia_vencimento INT NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DESPESAS GERAIS DA OBRA
CREATE TABLE IF NOT EXISTS public.despesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor_total NUMERIC(15,2) NOT NULL CHECK (valor_total > 0),
    data_despesa DATE NOT NULL DEFAULT CURRENT_DATE,
    categoria VARCHAR(100) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL CHECK (forma_pagamento IN ('Dinheiro', 'Pix', 'Transferência', 'Boleto', 'Cartão')),
    cartao_id UUID REFERENCES public.cartoes(id) ON DELETE SET NULL,
    comprovante_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRABALHADORES (MÃO DE OBRA)
CREATE TABLE IF NOT EXISTS public.trabalhadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    funcao VARCHAR(100) NOT NULL,
    telefone VARCHAR(50),
    chave_pix VARCHAR(150),
    valor_diaria_padrao NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RECIBOS EMITIDOS (declarado antes para integridade de foreign keys)
CREATE TABLE IF NOT EXISTS public.recibos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    trabalhador_id UUID NOT NULL REFERENCES public.trabalhadores(id) ON DELETE RESTRICT,
    numero_recibo SERIAL,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    valor_bruto NUMERIC(15,2) NOT NULL,
    descontos NUMERIC(15,2) DEFAULT 0.00,
    valor_liquido NUMERIC(15,2) NOT NULL,
    data_emissao TIMESTAMPTZ DEFAULT NOW(),
    emitido_por UUID REFERENCES auth.users(id)
);

-- 7. DIÁRIAS DE TRABALHO
CREATE TABLE IF NOT EXISTS public.diarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    trabalhador_id UUID NOT NULL REFERENCES public.trabalhadores(id) ON DELETE CASCADE,
    data_diaria DATE NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
    recibo_id UUID REFERENCES public.recibos(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_trabalhador_data UNIQUE (trabalhador_id, data_diaria)
);

-- 8. MATERIAIS & ESTOQUE
CREATE TABLE IF NOT EXISTS public.materiais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL,
    saldo_atual NUMERIC(12,2) DEFAULT 0.00,
    estoque_minimo NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PRODUÇÃO DE OBRA (APONTAMENTOS / METAS)
CREATE TABLE IF NOT EXISTS public.producao_apontamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    data_apontamento DATE NOT NULL DEFAULT CURRENT_DATE,
    item_etapa VARCHAR(255) NOT NULL,
    quantidade_executada NUMERIC(10,2) NOT NULL,
    unidade VARCHAR(20) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & POLÍTICAS DE ACESSO
-- ==============================================================================
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trabalhadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recibos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producao_apontamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários autenticados
CREATE POLICY "Acesso a obras por autenticados" ON public.obras FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso a perfis por autenticados" ON public.usuarios_perfis FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso a despesas por autenticados" ON public.despesas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso a trabalhadores por autenticados" ON public.trabalhadores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso a diarias por autenticados" ON public.diarias FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso a recibos por autenticados" ON public.recibos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso a cartoes por autenticados" ON public.cartoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso a materiais por autenticados" ON public.materiais FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Acesso a producao por autenticados" ON public.producao_apontamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

