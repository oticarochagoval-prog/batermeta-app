// Mensagem de WhatsApp — porte do protótipo (linhas 280-304).
//
// Monta o relatório de um período-alvo (data ISO ou 'S1'..'S4').
// Usado pelo modal de WhatsApp na tela inicial.

import { calcMeta } from "./calc.js";
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
