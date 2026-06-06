// Motor de cálculo — portado do protótipo (linhas 213-277).
// Mantém a semântica EXATA. Não alterar sem alinhar com Lucas.

import { CONFIG } from "./config.js";
import { COLORS } from "./colors.js";
import { pad, parseISO, fmtCurto } from "./format.js";

/**
 * Calcula KPIs de uma loja+categoria pro mês em visualização.
 *
 * @param loja          objeto loja
 * @param categoria     "contratado" | "faturado"
 * @param lancamentos   lançamentos já filtrados pelo mês
 * @param viewCtx       (opcional) — pra quando exibe MÊS DIFERENTE do atual.
 *                      { ehMesAtual, diasUteisDecorridos }
 *                      Se omitido, comportamento clássico (assume mês atual).
 *
 * Quando ehMesAtual=false (vendo mês passado), o "decorridos" vira o
 * mês inteiro — afinal, o mês já terminou. Sem isso, o cálculo de meta
 * acumulada ficaria projetando "esperado até o dia X" pra um mês que
 * já fechou.
 */
export function calcMeta(loja, categoria, lancamentos, viewCtx = null) {
  const m = loja.metas[categoria];
  const divisor =
    loja.tipoPeriodo === "diario" ? loja.diasUteis : loja.semanas;

  // FIX (01/06/2026 - fix6): quando vendo mês PASSADO, esperado = meta cheia.
  // Quando vendo mês atual, mantém lógica antiga (esperado proporcional).
  const ehMesAtual = viewCtx ? viewCtx.ehMesAtual : true;
  let decorridosBrutos;
  if (!ehMesAtual) {
    // Mês passado fechado: usa o divisor inteiro (esperado = meta cheia)
    decorridosBrutos = divisor;
  } else if (loja.tipoPeriodo === "diario") {
    // fix6.6.1: se veio diasUteisDecorridos no viewCtx (ex: relatório de
    // um dia específico), usa ele; senão, os dias até hoje (data real).
    decorridosBrutos =
      viewCtx && typeof viewCtx.diasUteisDecorridos === "number"
        ? viewCtx.diasUteisDecorridos
        : CONFIG.diasUteisDecorridos;
  } else {
    decorridosBrutos = CONFIG.semanaAtual;
  }
  // decorridos NUNCA pode ser maior que divisor (cap fix 27/05/2026)
  const decorridos = Math.min(decorridosBrutos, divisor);

  const metaPeriodo = m.meta / divisor;
  const metaAcumulada = metaPeriodo * decorridos;
  const doMes = lancamentos.filter(
    (l) => l.lojaId === loja.id && l.categoria === categoria
  );
  const acumulado = doMes.reduce((s, l) => s + l.valor, 0);
  // "Vendido hoje" só faz sentido pro mês atual; em mês passado, força 0.
  const periodoHoje =
    loja.tipoPeriodo === "diario" ? CONFIG.hoje : `S${CONFIG.semanaAtual}`;
  const lancHoje = ehMesAtual
    ? doMes.filter((l) => l.periodo === periodoHoje)
    : [];
  const vendidoHoje = lancHoje.reduce((s, l) => s + l.valor, 0);
  const qtdMes = doMes.reduce((s, l) => s + (l.qtdVendas || 0), 0);
  const qtdHoje = lancHoje.reduce((s, l) => s + (l.qtdVendas || 0), 0);
  const ticketMes = qtdMes > 0 ? acumulado / qtdMes : 0;
  const ticketHoje = qtdHoje > 0 ? vendidoHoje / qtdHoje : 0;
  const diferenca = acumulado - metaAcumulada;
  return {
    metaPeriodo,
    metaAcumulada,
    acumulado,
    vendidoHoje,
    diferenca,
    qtdMes,
    qtdHoje,
    ticketMes,
    ticketHoje,
    pctMeta: m.meta > 0 ? (acumulado / m.meta) * 100 : 0,
    pctSuper: m.superMeta > 0 ? (acumulado / m.superMeta) * 100 : 0,
    pctGold: m.gold ? (acumulado / m.gold) * 100 : 0,
    metas: m,
    lancamentos: doMes,
    divisor,
    decorridos,
    unidade: loja.tipoPeriodo === "diario" ? "dia" : "semana",
    ehMesAtual,
  };
}

// statusDia — quais dos 4 itens do dia já foram lançados.
export function statusDia(loja, periodo, lancamentos, midias, orcamentos) {
  const has = (cat) =>
    lancamentos.some(
      (l) =>
        l.lojaId === loja.id && l.periodo === periodo && l.categoria === cat
    );
  const hasMidia = midias.some(
    (m) => m.lojaId === loja.id && m.periodo === periodo
  );
  const hasOrc = orcamentos.some(
    (o) => o.lojaId === loja.id && o.dataChegou === periodo
  );
  const itens = {
    contratado: has("contratado"),
    faturado: has("faturado"),
    midia: hasMidia,
    orcamento: hasOrc,
  };
  const faltam = Object.keys(itens).filter((k) => !itens[k]);
  return { itens, faltam, completo: faltam.length === 0 };
}

export const barColor = (_pct) => COLORS.primary;

/* ============================================================
   ETAPA 3 — agregações para a tela Relatórios da loja
   ============================================================ */

// calcMidia — para a loja, lista cada origem com qtd, valor e ticket.
// Resultado já ordenado por valor desc.
export function calcMidia(loja, midias, origens) {
  const ori = origens.filter((o) => o.lojaId === loja.id);
  const ms = midias.filter((m) => m.lojaId === loja.id && !m.naoTeve);
  return ori
    .map((o) => {
      const e = ms.filter((m) => m.origemId === o.id);
      const qtd = e.reduce((s, m) => s + (m.quantidade || 0), 0);
      const valor = e.reduce((s, m) => s + (m.valor || 0), 0);
      return { ...o, qtd, valor, ticket: qtd > 0 ? valor / qtd : 0 };
    })
    .sort((a, b) => b.valor - a.valor);
}

// calcOrc — totais e lista ordenada de orçamentos do mês.
export function calcOrc(loja, orcamentos) {
  const list = orcamentos
    .filter((o) => o.lojaId === loja.id)
    .sort(
      (a, b) =>
        b.dataChegou.localeCompare(a.dataChegou) || b.id - a.id
    );
  const total = list.length;
  const compraram = list.filter((o) => !!o.dataComprou).length;
  const taxa = total > 0 ? (compraram / total) * 100 : 0;
  return { list, total, compraram, pendentes: total - compraram, taxa };
}

// calcAbord — totais + meta de clientes (paraMeta = total - promoção).
export function calcAbord(loja, abordadores) {
  const list = abordadores
    .filter((a) => a.lojaId === loja.id)
    .sort(
      (a, b) =>
        b.dataChegou.localeCompare(a.dataChegou) || b.id - a.id
    );
  const total = list.length;
  const compraram = list.filter((a) => !!a.dataComprou).length;
  const promocao = list.filter((a) => !!a.promocao).length;
  const paraMeta = total - promocao;
  const meta = loja.metaAbordador || 0;
  const taxa = total > 0 ? (compraram / total) * 100 : 0;
  const pctMeta = meta > 0 ? Math.min(100, (paraMeta / meta) * 100) : 0;
  return {
    list,
    total,
    compraram,
    pendentes: total - compraram,
    promocao,
    paraMeta,
    meta,
    taxa,
    pctMeta,
  };
}

// diasAtrasados — lista os dias ÚTEIS (segunda a sexta) do mês atual que
// ficaram SEM lançamento completo, do dia 1 até ONTEM (hoje nunca entra,
// porque o dia ainda não acabou).
//
// Regra acordada com Lucas (fix6.1):
//   • Cobra só segunda a sexta. Sábado e domingo nunca aparecem
//     (sábado é meio período, lançado junto com a segunda).
//   • O dia de hoje nunca é cobrado.
//   • Feriado: a loja lança "Não teve" — como há lançamento, não cobra.
//   • Um dia conta como atrasado se faltar QUALQUER das 4 categorias
//     (contratado, faturado, mídia, orçamento).
//
// Só roda no mês atual; em mês passado o master corrige pelo seletor.
export function diasAtrasados(loja, lancamentos, midias, orcamentos, ehMesAtual = true) {
  if (!ehMesAtual) return [];
  const hoje = parseISO(CONFIG.hoje);
  const diaHoje = hoje.getDate();
  const out = [];
  for (let d = 1; d < diaHoje; d++) {
    const dt = new Date(CONFIG.ano, CONFIG.mes - 1, d);
    const dow = dt.getDay(); // 0=dom, 6=sáb
    if (dow === 0 || dow === 6) continue; // pula sábado e domingo
    const periodo = `${CONFIG.ano}-${pad(CONFIG.mes)}-${pad(d)}`;
    const st = statusDia(loja, periodo, lancamentos, midias, orcamentos);
    // fix6.6: Orçamento NÃO é diário — não conta como pendência.
    // O dia só é atrasado se faltar Contratado, Faturado ou Mídia.
    const faltamReais = st.faltam.filter((k) => k !== "orcamento");
    if (faltamReais.length > 0) {
      out.push({ periodo, label: fmtCurto(periodo), faltam: faltamReais });
    }
  }
  return out;
}
