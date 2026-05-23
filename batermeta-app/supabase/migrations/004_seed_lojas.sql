-- 004_seed_lojas.sql
-- Seed das 12 lojas iniciais (Rocha 1-11 + GV Optical).
-- Valores extraídos do protótipo (NOMES, BASE_METAS, META_ABORDADOR_INICIAL,
-- SEMANAIS — linhas 95-118).
--
-- IDEMPOTENTE: usa ON CONFLICT(login) DO NOTHING — pode rodar várias
-- vezes sem duplicar. Se você quiser SOBRESCREVER metas existentes,
-- troque por DO UPDATE.
--
-- RODE APÓS as migrações 001, 002 e 003.

INSERT INTO lojas
  (nome, login, senha, ativa, tipo_periodo, dias_uteis, semanas,
   meta_contratado, super_contratado, gold_contratado,
   meta_faturado, super_faturado, gold_faturado,
   meta_abordador)
VALUES
  ('Rocha 1',  'rocha1',  'rocha1',  true, 'diario',  21, 4, 72000, 108000, 144000, 81000, 122000, 162000, 50),
  ('Rocha 2',  'rocha2',  'rocha2',  true, 'diario',  21, 4, 58000,  87000, 116000, 64000,  96000, 128000, 40),
  ('Rocha 3',  'rocha3',  'rocha3',  true, 'diario',  21, 4, 85000, 128000, 170000, 92000, 138000, 184000,  0),
  ('Rocha 4',  'rocha4',  'rocha4',  true, 'diario',  21, 4, 63000,  95000, 126000, 70000, 105000, 140000, 30),
  ('Rocha 5',  'rocha5',  'rocha5',  true, 'diario',  21, 4, 77000, 116000, 154000, 83000, 125000, 166000,  0),
  ('Rocha 6',  'rocha6',  'rocha6',  true, 'diario',  21, 4, 55000,  83000, 110000, 60000,  90000, 120000,  0),
  ('Rocha 7',  'rocha7',  'rocha7',  true, 'diario',  21, 4, 69000, 104000, 138000, 75000, 113000, 150000,  0),
  ('Rocha 8',  'rocha8',  'rocha8',  true, 'diario',  21, 4, 91000, 137000, 182000, 98000, 147000, 196000, 35),
  ('Rocha 9',  'rocha9',  'rocha9',  true, 'semanal', 21, 4, 60000,  90000, 120000, 66000,  99000, 132000,  0),
  ('Rocha 10', 'rocha10', 'rocha10', true, 'diario',  21, 4, 74000, 111000, 148000, 80000, 120000, 160000,  0),
  ('Rocha 11', 'rocha11', 'rocha11', true, 'semanal', 21, 4, 66000,  99000, 132000, 72000, 108000, 144000,  0),
  ('GV Optical', 'gvoptical', 'gvoptical', true, 'diario', 21, 4, 88000, 132000, 176000, 95000, 143000, 190000, 0)
ON CONFLICT (login) DO NOTHING;
