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

/* ============================================================
   HELPER (01/06/2026): calcular último dia do mês corretamente.

   Bug crítico que travou o sistema em 01/06/2026: o código tinha
   `${ano}-${mes}-31` hardcoded em 4 lugares. Funcionou em maio
   (que tem 31 dias). Em junho virou "2026-06-31" — data inválida
   — e o Postgres retornou erro 400 em TODA query, derrubando o
   sistema inteiro.

   Esta função sempre retorna o último dia REAL do mês (28, 29, 30
   ou 31 conforme o caso, incluindo anos bissextos).
   ============================================================ */
function fimDoMesISO(mes, ano) {
  // Truque: dia 0 do MÊS SEGUINTE = último dia do mês atual.
  // Ex.: new Date(2026, 6, 0) = 30 de junho de 2026.
  const ultimoDia = new Date(ano, mes, 0).getDate();
  return `${ano}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
}

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
  // FIX (28/05/2026): bug do período semanal.
  // Lojas semanais (Rocha 9 e 11) salvam periodo como "S1"/"S2"/etc.
  // Comparar isso entre "2026-05-01" e "2026-05-31" exclui esses
  // registros (na ordem ASCII "S" > "2"). Resultado: a tela mostrava
  // "Sem lançamentos" mesmo a Rocha 9 lançando direitinho.
  //
  // Solução: buscar TODOS da loja e filtrar em JS. Volume é baixo
  // (uns 100 registros por loja/mês), não tem custo.
  // Periodos "S1"-"S4" entram sempre quando o filtro é do mês corrente
  // (porque o banco não armazena data pra lançamento semanal).
  let q = supabase.from("lancamentos").select("*");
  if (lojaId) q = q.eq("loja_id", lojaId);
  const { data, error } = await q;
  if (error) throw error;
  const ehMesAtual = mes === new Date().getMonth() + 1 && ano === new Date().getFullYear();
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fim = fimDoMesISO(mes, ano);
  const filtrados = (data || []).filter((r) => {
    const p = String(r.periodo || "");
    if (p.startsWith("S")) {
      // Lançamento semanal só faz sentido pro mês corrente.
      return ehMesAtual;
    }
    return p >= inicio && p <= fim;
  });
  return filtrados.map(mapLanc);
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
  // FIX (28/05/2026): mesmo bug do período semanal. Veja listarLancamentos.
  let q = supabase.from("midias").select("*");
  if (lojaId) q = q.eq("loja_id", lojaId);
  const { data, error } = await q;
  if (error) throw error;
  const ehMesAtual = mes === new Date().getMonth() + 1 && ano === new Date().getFullYear();
  const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const fim = fimDoMesISO(mes, ano);
  const filtrados = (data || []).filter((r) => {
    const p = String(r.periodo || "");
    if (p.startsWith("S")) return ehMesAtual;
    return p >= inicio && p <= fim;
  });
  return filtrados.map(mapMidia);
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
  const fim = fimDoMesISO(mes, ano);
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
  const fim = fimDoMesISO(mes, ano);
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

/* ============================================================
   ETAPA 3 — CONFIG DA LOJA (gerente)
   ============================================================ */

/* Salva configurações de meta de uma loja (todas as 6 metas + tipo).
   Forma camelCase do front -> snake_case do banco. */
export async function salvarConfigLoja(lojaId, cfg) {
  const payload = {};
  if (cfg.tipoPeriodo) payload.tipo_periodo = cfg.tipoPeriodo;
  if (cfg.divisor != null) {
    if (cfg.tipoPeriodo === "semanal") payload.semanas = Number(cfg.divisor);
    else payload.dias_uteis = Number(cfg.divisor);
  }
  if (cfg.metas) {
    if (cfg.metas.contratado) {
      payload.meta_contratado = Number(cfg.metas.contratado.meta) || 0;
      payload.super_contratado = Number(cfg.metas.contratado.superMeta) || 0;
      payload.gold_contratado = Number(cfg.metas.contratado.gold) || 0;
    }
    if (cfg.metas.faturado) {
      payload.meta_faturado = Number(cfg.metas.faturado.meta) || 0;
      payload.super_faturado = Number(cfg.metas.faturado.superMeta) || 0;
      payload.gold_faturado = Number(cfg.metas.faturado.gold) || 0;
    }
  }
  const { error } = await supabase.from("lojas").update(payload).eq("id", lojaId);
  if (error) throw error;
}

export async function salvarMetaAbordador(lojaId, valor) {
  const v = Math.max(0, parseInt(String(valor), 10) || 0);
  const { error } = await supabase
    .from("lojas")
    .update({ meta_abordador: v })
    .eq("id", lojaId);
  if (error) throw error;
}

/* --- ORIGENS (gerenciar) --- */
export async function addOrigem(lojaId, nome) {
  const nomeTrim = String(nome || "").trim();
  if (!nomeTrim) return;
  // ON CONFLICT (loja_id, nome) DO NOTHING garantido pelo índice criado na 005
  const { error } = await supabase
    .from("origens")
    .insert({ loja_id: lojaId, nome: nomeTrim, ativa: true });
  // Se já existir (conflito), reativa e devolve
  if (error && /duplicate|conflict|unique/i.test(error.message || "")) {
    await supabase
      .from("origens")
      .update({ ativa: true })
      .eq("loja_id", lojaId)
      .eq("nome", nomeTrim);
    return;
  }
  if (error) throw error;
}

export async function arquivarOrigem(origemId) {
  const { error } = await supabase
    .from("origens")
    .update({ ativa: false })
    .eq("id", origemId);
  if (error) throw error;
}

export async function reativarOrigem(origemId) {
  const { error } = await supabase
    .from("origens")
    .update({ ativa: true })
    .eq("id", origemId);
  if (error) throw error;
}

/* --- TROCAR SENHA DA LOJA (pelo gerente) --- */
export async function trocarSenhaLoja(lojaId, senhaAtual, senhaNova) {
  // Verifica senha atual primeiro
  const { data, error: e1 } = await supabase
    .from("lojas")
    .select("senha")
    .eq("id", lojaId)
    .single();
  if (e1) throw e1;
  if (!data || data.senha !== senhaAtual) {
    throw new Error("Senha atual incorreta.");
  }
  const { error: e2 } = await supabase
    .from("lojas")
    .update({ senha: senhaNova })
    .eq("id", lojaId);
  if (e2) throw e2;
}

/* ============================================================
   ETAPA 3 — CONFIG MASTER
   ============================================================ */

/* --- LOJAS (CRUD master) --- */
export async function renomearLoja(lojaId, novoNome) {
  const n = String(novoNome || "").trim();
  if (!n) return;
  const { error } = await supabase
    .from("lojas")
    .update({ nome: n })
    .eq("id", lojaId);
  if (error) throw error;
}

export async function redefinirSenhaLoja(lojaId, novaSenha) {
  const s = String(novaSenha || "").trim();
  if (!s) return;
  const { error } = await supabase
    .from("lojas")
    .update({ senha: s })
    .eq("id", lojaId);
  if (error) throw error;
}

export async function toggleLojaAtiva(lojaId) {
  // Primeiro busca o estado atual
  const { data, error: e1 } = await supabase
    .from("lojas")
    .select("ativa")
    .eq("id", lojaId)
    .single();
  if (e1) throw e1;
  const novoEstado = data?.ativa === false ? true : false;
  const { error: e2 } = await supabase
    .from("lojas")
    .update({ ativa: novoEstado })
    .eq("id", lojaId);
  if (e2) throw e2;
}

export async function addLoja({ nome, login, senha, tipoPeriodo = "diario" }) {
  const payload = {
    nome: String(nome || "").trim(),
    login: String(login || "").toLowerCase().trim(),
    senha: String(senha || "").trim(),
    tipo_periodo: tipoPeriodo,
    dias_uteis: 21,
    semanas: 4,
    ativa: true,
    meta_contratado: 0,
    super_contratado: 0,
    gold_contratado: 0,
    meta_faturado: 0,
    super_faturado: 0,
    gold_faturado: 0,
    meta_abordador: 0,
  };
  const { error } = await supabase.from("lojas").insert(payload);
  if (error) throw error;
}

/* ============================================================
   MASTER_CONFIG (chave/valor único)
   Estrutura: tabela com colunas chave (text) e valor (text), 1 linha por config.
   ============================================================ */

export async function listarMasterConfig() {
  const { data, error } = await supabase.from("master_config").select("*");
  if (error) {
    // Se a tabela ainda não existir, retorna defaults
    // eslint-disable-next-line no-console
    console.warn("[master_config] não disponível, usando defaults:", error.message);
    return {};
  }
  const out = {};
  (data || []).forEach((row) => {
    out[row.chave] = row.valor;
  });
  return out;
}

export async function salvarMasterConfig(chave, valor) {
  // Upsert por chave
  const { data: existentes, error: e1 } = await supabase
    .from("master_config")
    .select("chave")
    .eq("chave", chave);
  if (e1) throw e1;
  if (existentes && existentes.length > 0) {
    const { error: e2 } = await supabase
      .from("master_config")
      .update({ valor: String(valor) })
      .eq("chave", chave);
    if (e2) throw e2;
  } else {
    const { error: e3 } = await supabase
      .from("master_config")
      .insert({ chave, valor: String(valor) });
    if (e3) throw e3;
  }
}

/* --- HISTÓRICO MENSAL (para card "Melhor mês") ---
   Retorna [{ mes, ano, total }] dos últimos N meses anteriores
   (sem o mês atual). */
export async function listarHistoricoMensal(lojaId, mesAtual, anoAtual, n = 3) {
  // Calcula janelas de N meses ANTES do mês atual.
  const out = [];
  for (let i = n; i >= 1; i--) {
    let mes = mesAtual - i;
    let ano = anoAtual;
    while (mes <= 0) {
      mes += 12;
      ano -= 1;
    }
    const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
    // Ultimo dia do mês: usar Date com day=0 do mês seguinte
    const fim = new Date(ano, mes, 0); // mes em base 1; Date com mes em base 0 = mes-1; +1 mes = mes => day 0 = ultimo dia
    const fimISO = `${ano}-${String(mes).padStart(2, "0")}-${String(fim.getDate()).padStart(2, "0")}`;
    // Lança data-only periodos. Para semanais, S1/S2/etc não tem data; o mês anterior
    // semanal não bate por aqui — aproximação: pegamos lançamentos com periodo LIKE 'S%'
    // só do mês atual. Pra anteriores, ignoramos semanais (raro nas Rocha 9/11).
    let q = supabase
      .from("lancamentos")
      .select("valor, categoria, periodo, nao_teve")
      .gte("periodo", inicio)
      .lte("periodo", fimISO);
    if (lojaId) q = q.eq("loja_id", lojaId);
    const { data, error } = await q;
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[hist] erro buscando mês", mes, ano, error.message);
      out.push({ mes, ano, total: 0 });
      continue;
    }
    const total = (data || [])
      .filter((r) => !r.nao_teve)
      .reduce((s, r) => s + (Number(r.valor) || 0), 0);
    out.push({ mes, ano, total });
  }
  return out;
}
