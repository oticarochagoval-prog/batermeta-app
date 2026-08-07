-- 007_master_config.sql
-- Cria (se não existir) a tabela master_config e popula com defaults.
-- Estrutura chave/valor: 1 linha por configuração.
--
-- Usado pra:
--   janela_edicao_dias  -> quantos dias o gerente edita após virar o mês
--   senha_master         -> senha master (substitui o hard-coded)
--   nome_rede            -> nome exibido no header master
--
-- IDEMPOTENTE: rode quantas vezes quiser.

-- Tabela
CREATE TABLE IF NOT EXISTS master_config (
  chave text PRIMARY KEY,
  valor text NOT NULL,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Defaults (não sobrescreve se já existir)
INSERT INTO master_config (chave, valor) VALUES ('janela_edicao_dias', '5')
ON CONFLICT (chave) DO NOTHING;

INSERT INTO master_config (chave, valor) VALUES ('nome_rede', 'Óticas Rocha')
ON CONFLICT (chave) DO NOTHING;

-- A senha master NÃO é cadastrada por padrão. Enquanto não existir,
-- o sistema usa o fallback hard-coded ('rocha@master2024'). Quando o
-- master trocar a senha pela UI (Config > Conta), uma linha é criada
-- e passa a valer dali em diante.

-- RLS desligado conforme briefing (sem auth Supabase).
ALTER TABLE master_config DISABLE ROW LEVEL SECURITY;
