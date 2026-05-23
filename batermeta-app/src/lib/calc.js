// Motor de cálculo — portado do protótipo (linhas 213-277).
// Mantém a semântica EXATA. Não alterar sem alinhar com Lucas.

import { CONFIG } from "./config.js";
import { COLORS } from "./colors.js";

export function calcMeta(loja, categoria, lancamentos) {
  const m = loja.metas[categoria];
  const divisor =
    loja.tipoPeriodo === "diario" ? loja.diasUteis : loja.semanas;
  const decorridos =
    loja.tipoPeriodo === "diario"
      ? CONFIG.diasUteisDecorridos
      : CONFIG.semanaAtual;
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
