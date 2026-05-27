// Motor de cálculo — portado do protótipo (linhas 213-277).
// Mantém a semântica EXATA. Não alterar sem alinhar com Lucas.

import { CONFIG } from "./config.js";
import { COLORS } from "./colors.js";

export function calcMeta(loja, categoria, lancamentos) {
  const m = loja.metas[categoria];
  const divisor =
    loja.tipoPeriodo === "diario" ? loja.diasUteis : loja.semanas;
  // FIX (27/05/2026): decorridos NUNCA pode ser maior que divisor.
  // Antes: se a loja configurava 20 dias úteis e o sistema contava 23
  // (incluindo sábados), o "esperado" estourava acima da meta. Resultado:
  // débito de R$ 109k em loja que tinha meta de R$ 100k. Capando em
  // `divisor`, no fim do mês esperado = meta (comportamento correto).
  const decorridosBrutos =
    loja.tipoPeriodo === "diario"
      ? CONFIG.diasUteisDecorridos
      : CONFIG.semanaAtual;
  const decorridos = Math.min(decorridosBrutos, divisor);
  const metaPeriodo = m.meta / divisor;
  const metaAcumulada = metaPeriodo * decorridos;
  const doMes = lancamentos.filter(
    (l) => l.lojaId === loja.id && l.categoria === categoria
  );
  const acumulado = doMes.reduce((s, l) => s + l.valor, 0);
  const periodoHoje =
    loja.tipoPeriodo === "diario" ? CONFIG.hoje : `S${CONFIG.semanaAtual}`;
  const lancHoje = doMes.filter((l) => l.periodo === periodoHoje);
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
