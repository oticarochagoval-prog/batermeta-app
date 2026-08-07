-- 005_seed_origens.sql
-- Cadastra 6 origens padrão (Abordador, Cliente, Indicação, Passando,
-- Google, Instagram) para TODAS as lojas existentes na tabela `lojas`.
--
-- IDEMPOTENTE: se a origem já existir para a loja, ignora.
-- Rode no SQL Editor do Supabase.
--
-- Schema esperado da tabela `origens`:
--   id        (PK)
--   loja_id   (FK lojas.id)
--   nome      (text)
--   ativa     (boolean default true)

-- Cria índice de unicidade pra suportar o ON CONFLICT.
-- Sem ele, a constraint ON CONFLICT (loja_id, nome) não funciona.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'origens_loja_nome_key'
  ) THEN
    CREATE UNIQUE INDEX origens_loja_nome_key ON origens (loja_id, nome);
  END IF;
END$$;

-- Garante coluna `ativa`.
ALTER TABLE origens
  ADD COLUMN IF NOT EXISTS ativa boolean NOT NULL DEFAULT true;

-- Inserir 6 origens padrão pra CADA loja existente.
INSERT INTO origens (loja_id, nome, ativa)
SELECT l.id, nome, true
FROM lojas l
CROSS JOIN (
  VALUES
    ('Abordador'),
    ('Cliente'),
    ('Indicação'),
    ('Passando'),
    ('Google'),
    ('Instagram')
) AS o(nome)
ON CONFLICT (loja_id, nome) DO NOTHING;
