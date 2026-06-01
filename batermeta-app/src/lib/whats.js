// Mensagem de WhatsApp — porte do protótipo (linhas 280-304).
//
// Monta o relatório de um período-alvo (data ISO ou 'S1'..'S4').
// Usado pelo modal de WhatsApp na tela inicial.
//
// FIX (01/06/2026): adicionado montaMsgMensal() pra gerar fechamento
// do mês todo (não só de um dia/semana específica).

import { calcMeta, calcMidia, calcOrc } from "./calc.js";
import { CONFIG } from "./config.js";
import { fmtBRL, fmtCurto, fmtExtenso, MES } from "./format.js";

export function montaMsg(loja, lancamentos, midias, orcamentos, periodoAlvo) {
  const c = calcMeta(loja, "contratado", lancamentos);
  const f = calcMeta(loja, "faturado", lancamentos);
  const diario = loja.tipoPeriodo === "diario";
  const alvo = periodoAlvo || (diario ? CONFIG.hoje : `S${CONFIG.semanaAtual}`);

  const orcAlvo = orcamentos.find(
    (o) => o.lojaId === loja.id && o.dataChegou === alvo
  );
  const midAlvo = midias
    .filter((m) => m.lojaId === loja.id && m.periodo === alvo && !m.naoTeve)
    .reduce((s, m) => s + m.quantidade, 0);

  const u = diario ? `em ${fmtCurto(alvo)}` : `semana ${alvo.slice(1)}`;
  const valorNoAlvo = (cat) => {
    const e = lancamentos.find(
      (l) =>
        l.lojaId === loja.id &&
        l.categoria === cat &&
        l.periodo === alvo &&
        !l.naoTeve
    );
    return e ? { v: e.valor, q: e.qtdVendas || 0 } : { v: 0, q: 0 };
  };

  const linha = (x, cat) => {
    const cd =
      x.diferenca >= 0
        ? `Crédito ${fmtBRL(x.diferenca)}`
        : `Débito ${fmtBRL(Math.abs(x.diferenca))}`;
    const va = valorNoAlvo(cat);
    const tk =
      va.q > 0
        ? `\nTicket médio ${u}: ${fmtBRL(va.v / va.q)} (${va.q} vendas)`
        : "";
    return `Vendido ${u}: ${fmtBRL(va.v)}${tk}\nAcumulado: ${fmtBRL(
      x.acumulado
    )}\nMeta: ${x.pctMeta.toFixed(1)}% — ${cd}\nTicket médio do mês: ${
      x.qtdMes > 0 ? fmtBRL(x.ticketMes) : "—"
    }`;
  };

  const cabData = diario
    ? fmtExtenso(alvo)
    : `Semana ${alvo.slice(1)} — ${MES[CONFIG.mes - 1]}/${CONFIG.ano}`;

  return (
    `*BATERMETA — ${loja.nome}*\n${cabData}\n\n` +
    `*CONTRATADO*\n${linha(c, "contratado")}\n\n` +
    `*FATURADO (MOV. DIÁRIO)*\n${linha(f, "faturado")}\n\n` +
    `*MÍDIA*\n${midAlvo} cliente(s) por mídia\n\n` +
    `*ORÇAMENTOS*\n${
      orcAlvo ? `Cliente registrado em ${fmtCurto(orcAlvo.dataChegou)}` : "Sem registro"
    }\n\n` +
    `_Bata suas metas todo dia_`
  );
}

/**
 * Monta relatório de FECHAMENTO MENSAL (todo o mês selecionado).
 *
 * Usado quando o gerente clica em "Mês" no WhatsModal.
 * Diferente de montaMsg() que pega um único dia/semana, esta função
 * traz os totais consolidados do mês INTEIRO + ranking de mídia
 * (top 5) + resumo de orçamentos.
 *
 * Os arrays `lancamentos`, `midias`, `orcamentos` e `origens` devem
 * já estar filtrados pro mês/ano correto. Quem chama é responsável
 * por essa filtragem (normalmente o WhatsModal chamando listar* com
 * o (mes, ano) escolhido).
 *
 * Params:
 *   loja           — objeto loja
 *   lancamentos    — lançamentos do mês alvo
 *   midias         — midias do mês alvo
 *   orcamentos     — orçamentos do mês alvo
 *   origens        — origens da loja (não filtra por mês — origem é cadastro)
 *   mes, ano       — pra exibir no cabeçalho ("Maio/2026")
 */
export function montaMsgMensal(
  loja,
  lancamentos,
  midias,
  orcamentos,
  origens,
  mes,
  ano
) {
  const c = calcMeta(loja, "contratado", lancamentos);
  const f = calcMeta(loja, "faturado", lancamentos);
  const midiaRank = calcMidia(loja, midias, origens);
  const orc = calcOrc(loja, orcamentos);

  const linha = (x, nome) => {
    const cd =
      x.diferenca >= 0
        ? `Crédito ${fmtBRL(x.diferenca)}`
        : `Débito ${fmtBRL(Math.abs(x.diferenca))}`;
    const tk =
      x.qtdMes > 0
        ? `\nTicket médio: ${fmtBRL(x.ticketMes)} (${x.qtdMes} vendas)`
        : "\nSem vendas no mês";
    return `*${nome}*\nAcumulado: ${fmtBRL(
      x.acumulado
    )}\nMeta: ${fmtBRL(x.metas.meta)} — ${x.pctMeta.toFixed(1)}% (${cd})${tk}`;
  };

  // Mídia: top 5 origens por quantidade
  const topMidia = midiaRank
    .filter((m) => m.qtd > 0)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5);
  const totalMidia = midiaRank.reduce((s, m) => s + m.qtd, 0);
  const midiaTxt =
    topMidia.length === 0
      ? "Sem registros de mídia no mês"
      : topMidia.map((m) => `• ${m.nome}: ${m.qtd} clientes`).join("\n") +
        `\nTotal: ${totalMidia} clientes em mídia`;

  // Orçamentos
  const orcTxt =
    orc.total === 0
      ? "Sem orçamentos registrados"
      : `Atendidos: ${orc.total}\nCompraram: ${orc.compraram} (${orc.taxa.toFixed(0)}%)`;

  return (
    `*BATERMETA — ${loja.nome}*\n` +
    `Fechamento de ${MES[mes - 1]}/${ano}\n\n` +
    `${linha(c, "CONTRATADO")}\n\n` +
    `${linha(f, "FATURADO")}\n\n` +
    `*MÍDIA*\n${midiaTxt}\n\n` +
    `*ORÇAMENTOS*\n${orcTxt}\n\n` +
    `_Bata suas metas todo dia_`
  );
}
