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

/* ============================================================
   FUNÇÕES DE ESCRITA (Etapa 2 — Lançar)
   ============================================================ */

import { fmtBRL } from "./format.js";

/* --- LANCAMENTOS (Contratado / Faturado) ---
   Um por (loja, periodo, categoria). Se já existir, substitui e
   registra log. */
export async function upsertVenda({
  lojaId,
  periodo,
  categoria,
  valor,
  qtdVendas,
  obs,
  naoTeve,
  quem = "loja", // 'loja' | 'master'
}) {
  // Procura existente
  const { data: existentes, error: e1 } = await supabase
    .from("lancamentos")
    .select("*")
    .eq("loja_id", lojaId)
    .eq("periodo", periodo)
    .eq("categoria", categoria);
  if (e1) throw e1;
  const existente = (existentes || [])[0];

  const payload = {
    loja_id: lojaId,
    periodo,
    categoria,
    valor: naoTeve ? 0 : valor,
    qtd_vendas: naoTeve ? 0 : qtdVendas,
    obs: naoTeve ? "" : obs || "",
    nao_teve: !!naoTeve,
  };

  if (existente) {
    const { error: e2 } = await supabase
      .from("lancamentos")
      .update(payload)
      .eq("id", existente.id);
    if (e2) throw e2;
    await registrarLog({
      lojaId,
      tipo: categoria,
      periodo,
      de: existente.nao_teve ? "não teve" : fmtBRL(Number(existente.valor)),
      para: naoTeve ? "não teve" : fmtBRL(valor),
      quem,
    });
  } else {
    const { error: e3 } = await supabase.from("lancamentos").insert(payload);
    if (e3) throw e3;
  }
}

/* --- MIDIA EM LOTE ---
   Substitui TODOS os registros da loja+periodo pelos itens informados.
   "Não teve" cria um único registro com nao_teve=true. */
export async function setMidiaLote(lojaId, periodo, itens) {
  // Apaga tudo da loja+periodo
  const { error: eDel } = await supabase
    .from("midias")
    .delete()
    .eq("loja_id", lojaId)
    .eq("periodo", periodo);
  if (eDel) throw eDel;

  if (!itens || itens.length === 0) return;

  const payload = itens.map((it) => ({
    loja_id: lojaId,
    periodo,
    origem_id: it.origemId,
    quantidade: it.quantidade,
    valor: it.valor,
    nao_teve: false,
  }));

  const { error: eIns } = await supabase.from("midias").insert(payload);
  if (eIns) throw eIns;
}

export async function naoTeveMidia(lojaId, periodo) {
  const { error: eDel } = await supabase
    .from("midias")
    .delete()
    .eq("loja_id", lojaId)
    .eq("periodo", periodo);
  if (eDel) throw eDel;
  const { error: eIns } = await supabase.from("midias").insert({
    loja_id: lojaId,
    periodo,
    origem_id: null,
    quantidade: 0,
    valor: 0,
    nao_teve: true,
  });
  if (eIns) throw eIns;
}

/* --- ORCAMENTOS (lista de clientes) --- */
export async function addClienteOrcamento({ lojaId, nome, dataChegou }) {
  const { error } = await supabase.from("orcamentos").insert({
    loja_id: lojaId,
    nome,
    data_chegou: dataChegou,
    data_comprou: null,
  });
  if (error) throw error;
}

export async function toggleClienteOrcamento(id, dataComprou) {
  const { error } = await supabase
    .from("orcamentos")
    .update({ data_comprou: dataComprou })
    .eq("id", id);
  if (error) throw error;
}

export async function removeClienteOrcamento(id) {
  const { error } = await supabase.from("orcamentos").delete().eq("id", id);
  if (error) throw error;
}

/* --- ABORDADORES (lista de clientes com flag promocao) --- */
export async function addClienteAbord({ lojaId, nome, dataChegou, promocao }) {
  const { error } = await supabase.from("abordadores").insert({
    loja_id: lojaId,
    nome,
    data_chegou: dataChegou,
    data_comprou: null,
    promocao: !!promocao,
  });
  if (error) throw error;
}

export async function toggleClienteAbord(id, dataComprou) {
  const { error } = await supabase
    .from("abordadores")
    .update({ data_comprou: dataComprou })
    .eq("id", id);
  if (error) throw error;
}

export async function togglePromocaoAbord(id, novoValor) {
  const { error } = await supabase
    .from("abordadores")
    .update({ promocao: !!novoValor })
    .eq("id", id);
  if (error) throw error;
}

export async function removeClienteAbord(id) {
  const { error } = await supabase.from("abordadores").delete().eq("id", id);
  if (error) throw error;
}

/* --- EDIT_LOG --- */
async function registrarLog({ lojaId, tipo, periodo, de, para, quem }) {
  // Tabela edit_log: id, loja_id, tipo, periodo, de, para, quem, quando
  // Se schema diferente, ajustar aqui. Falha silenciosa para não bloquear
  // o save principal — log é "best effort".
  try {
    await supabase.from("edit_log").insert({
      loja_id: lojaId,
      tipo,
      periodo,
      de,
      para,
      quem,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[edit_log] falha ao registrar (ignorando):", e);
  }
}
