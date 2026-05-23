// Camada de acesso ao Supabase.
//
// Mapeia o schema do banco (snake_case + colunas planas) para o
// formato que o protótipo já consome (camelCase + objeto `metas`
// aninhado). Assim os componentes podem ser portados sem mudar.
//
// IMPORTANTE: se a estrutura real das suas tabelas no Supabase for
// diferente do esperado, ajustar APENAS aqui — os componentes não
// mudam.

import { supabase } from "./supabase.js";

/* ---------- LOJAS ---------- */

function mapLoja(row) {
  return {
    id: row.id,
    nome: row.nome,
    login: row.login,
    senha: row.senha,
    ativa: row.ativa !== false,
    tipoPeriodo: row.tipo_periodo || "diario",
    diasUteis: row.dias_uteis || 21,
    semanas: row.semanas || 4,
    metas: {
      contratado: {
        meta: Number(row.meta_contratado) || 0,
        superMeta: Number(row.super_contratado) || 0,
        gold: Number(row.gold_contratado) || 0,
      },
      faturado: {
        meta: Number(row.meta_faturado) || 0,
        superMeta: Number(row.super_faturado) || 0,
        gold: Number(row.gold_faturado) || 0,
      },
    },
    metaAbordador: Number(row.meta_abordador) || 0,
  };
}

export async function listarLojas() {
  const { data, error } = await supabase
    .from("lojas")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapLoja);
}

/* ---------- LANCAMENTOS (contratado / faturado) ---------- */

function mapLanc(row) {
  return {
    id: row.id,
    lojaId: row.loja_id,
    periodo: row.periodo,
    categoria: row.categoria,
    valor: Number(row.valor) || 0,
    qtdVendas: Number(row.qtd_vendas) || 0,
    obs: row.obs || "",
    naoTeve: !!row.nao_teve,
  };
}

export async function listarLancamentos(lojaId, mes, ano) {
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fim = `${ano}-${String(mes).padStart(2, "0")}-31`;
  let q = supabase
    .from("lancamentos")
    .select("*")
    .gte("periodo", inicio)
    .lte("periodo", fim);
  if (lojaId) q = q.eq("loja_id", lojaId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapLanc);
}

/* ---------- MIDIAS ---------- */

function mapMidia(row) {
  return {
    id: row.id,
    lojaId: row.loja_id,
    origemId: row.origem_id,
    periodo: row.periodo,
    quantidade: Number(row.quantidade) || 0,
    valor: Number(row.valor) || 0,
    naoTeve: !!row.nao_teve,
  };
}

export async function listarMidias(lojaId, mes, ano) {
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fim = `${ano}-${String(mes).padStart(2, "0")}-31`;
  let q = supabase
    .from("midias")
    .select("*")
    .gte("periodo", inicio)
    .lte("periodo", fim);
  if (lojaId) q = q.eq("loja_id", lojaId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapMidia);
}

/* ---------- ORIGENS ---------- */

function mapOrigem(row) {
  return {
    id: row.id,
    lojaId: row.loja_id,
    nome: row.nome,
    ativa: row.ativa !== false,
  };
}

export async function listarOrigens(lojaId) {
  let q = supabase.from("origens").select("*").order("id", { ascending: true });
  if (lojaId) q = q.eq("loja_id", lojaId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapOrigem);
}

/* ---------- ORÇAMENTOS ---------- */

function mapOrc(row) {
  return {
    id: row.id,
    lojaId: row.loja_id,
    nome: row.nome,
    dataChegou: row.data_chegou,
    dataComprou: row.data_comprou,
  };
}

export async function listarOrcamentos(lojaId, mes, ano) {
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fim = `${ano}-${String(mes).padStart(2, "0")}-31`;
  let q = supabase
    .from("orcamentos")
    .select("*")
    .gte("data_chegou", inicio)
    .lte("data_chegou", fim);
  if (lojaId) q = q.eq("loja_id", lojaId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapOrc);
}

/* ---------- ABORDADORES ---------- */

function mapAbord(row) {
  return {
    id: row.id,
    lojaId: row.loja_id,
    nome: row.nome,
    dataChegou: row.data_chegou,
    dataComprou: row.data_comprou,
    promocao: !!row.promocao,
  };
}

export async function listarAbordadores(lojaId, mes, ano) {
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fim = `${ano}-${String(mes).padStart(2, "0")}-31`;
  let q = supabase
    .from("abordadores")
    .select("*")
    .gte("data_chegou", inicio)
    .lte("data_chegou", fim);
  if (lojaId) q = q.eq("loja_id", lojaId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapAbord);
}
