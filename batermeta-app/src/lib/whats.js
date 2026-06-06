// Mensagem de WhatsApp — porte do protótipo (linhas 280-304).
//
// Monta o relatório de um período-alvo (data ISO ou 'S1'..'S4').
// Usado pelo modal de WhatsApp na tela inicial.
//
// FIX (01/06/2026): adicionado montaMsgMensal() pra gerar fechamento
// do mês todo (não só de um dia/semana específica).

import { calcMeta, calcMidia, calcOrc } from "./calc.js";
import { CONFIG, diasUteisAteHoje } from "./config.js";
import { fmtBRL, fmtCurto, fmtExtenso, MES } from "./format.js";

export function montaMsg(loja, lancamentos, midias, orcamentos, periodoAlvo) {
  const diario = loja.tipoPeriodo === "diario";
  const alvo = periodoAlvo || (diario ? CONFIG.hoje : `S${CONFIG.semanaAtual}`);

  // fix6.6.1: o "esperado até hoje" tem que ser proporcional aos dias
  // úteis até a DATA DO RELATÓRIO (alvo), não até a data real de hoje.
  // Sem isso, o relatório de um dia passado (ex: 03/06) usava os dias
  // decorridos até hoje (ex: 6 dias) e inflava o esperado.
  let viewCtx = null;
  if (diario && /^\d{4}-\d{2}-\d{2}$/.test(alvo)) {
    const [ay, am] = alvo.split("-").map((n) => parseInt(n, 10));
    // só ajusta se o alvo for do mês/ano corrente (mês fechado usa meta cheia)
    if (ay === CONFIG.ano && am === CONFIG.mes) {
      viewCtx = {
        ehMesAtual: true,
        diasUteisDecorridos: diasUteisAteHoje(ay, am, alvo),
      };
    }
  }
  const c = calcMeta(loja, "contratado", lancamentos, viewCtx);
  const f = calcMeta(loja, "faturado", lancamentos, viewCtx);

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

  // fix6.3: confere se o VALOR da mídia bate com o Contratado do alvo.
  // (Mesma regra da tela de lançar: só o valor precisa bater; nº de
  // clientes pode ser menor, pois 1 cliente pode gerar 2 vendas.)
  const valorMidiaAlvo = midias
    .filter((m) => m.lojaId === loja.id && m.periodo === alvo && !m.naoTeve)
    .reduce((s, m) => s + (m.valor || 0), 0);
  const contratadoAlvo = valorNoAlvo("contratado").v;
  const difMidia = valorMidiaAlvo - contratadoAlvo;
  const checaMidia = () => {
    if (contratadoAlvo <= 0) return "";
    if (Math.abs(difMidia) < 0.01) return "\n✅ Mídia confere com o Contratado";
    if (difMidia < 0)
      return `\n⚠️ Mídia R$ ${fmtBRL(valorMidiaAlvo).replace("R$ ", "")} x Contratado ${fmtBRL(contratadoAlvo)} — faltam ${fmtBRL(Math.abs(difMidia))} sem origem`;
    return `\n⚠️ Mídia ${fmtBRL(valorMidiaAlvo)} maior que o Contratado ${fmtBRL(contratadoAlvo)} — confira (diferença ${fmtBRL(difMidia)})`;
  };

  const linha = (x, cat) => {
    // fix6.6: formato igual ao Painel — Meta/dia, Esperado até hoje,
    // Acumulado e Débito/Crédito VS ESPERADO (não vs meta cheia).
    // x.metaPeriodo = meta/dia · x.metaAcumulada = esperado até a data
    // x.diferenca = acumulado − esperado
    const dif = x.diferenca;
    const cd =
      dif >= 0
        ? `🟢 Crédito ${fmtBRL(dif)} (vs esperado)`
        : `🔴 Débito ${fmtBRL(Math.abs(dif))} (vs esperado)`;
    const va = valorNoAlvo(cat);
    const tk =
      va.q > 0
        ? `\nTicket médio ${u}: ${fmtBRL(va.v / va.q)} (${va.q} vendas)`
        : "";
    return (
      `Vendido ${u}: ${fmtBRL(va.v)}${tk}\n` +
      `Meta/dia: ${fmtBRL(x.metaPeriodo)} · Esperado até hoje: ${fmtBRL(
        x.metaAcumulada
      )}\n` +
      `Acumulado: ${fmtBRL(x.acumulado)}\n` +
      `${cd}\n` +
      `Ticket médio do mês: ${x.qtdMes > 0 ? fmtBRL(x.ticketMes) : "—"}`
    );
  };

  const cabData = diario
    ? fmtExtenso(alvo)
    : `Semana ${alvo.slice(1)} — ${MES[CONFIG.mes - 1]}/${CONFIG.ano}`;

  return (
    `*BATERMETA — ${loja.nome}*\n${cabData}\n\n` +
    `*CONTRATADO*\n${linha(c, "contratado")}\n\n` +
    `*FATURADO (MOV. DIÁRIO)*\n${linha(f, "faturado")}\n\n` +
    `*MÍDIA*\n${midAlvo} cliente(s) por mídia${checaMidia()}\n\n` +
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
    // fix6.2: crédito/débito = acumulado − META CHEIA (não o esperado
    // proporcional). Se passou da meta → crédito; se faltou → débito.
    const metaCheia = x.metas.meta;
    const dif = x.acumulado - metaCheia;
    const cd =
      dif >= 0
        ? `🟢 Crédito ${fmtBRL(dif)}`
        : `🔴 Débito ${fmtBRL(Math.abs(dif))}`;
    const pctAtingida = metaCheia > 0 ? (x.acumulado / metaCheia) * 100 : 0;
    const pctFalta = Math.max(0, 100 - pctAtingida);
    const linhaPct =
      pctFalta <= 0
        ? `Atingido: ${pctAtingida.toFixed(1)}% — meta batida ✅`
        : `Atingido: ${pctAtingida.toFixed(1)}% — falta ${pctFalta.toFixed(1)}%`;
    const tk =
      x.qtdMes > 0
        ? `\nTicket médio: ${fmtBRL(x.ticketMes)} (${x.qtdMes} vendas)`
        : "\nSem vendas no mês";
    return `*${nome}*\nAcumulado: ${fmtBRL(
      x.acumulado
    )}\nMeta: ${fmtBRL(metaCheia)} (${cd})\n${linhaPct}${tk}`;
  };

  // Mídia: top 5 origens por quantidade
  const topMidia = midiaRank
    .filter((m) => m.qtd > 0)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5);
  const totalMidia = midiaRank.reduce((s, m) => s + m.qtd, 0);
  // fix6.3: confere VALOR total da mídia x Contratado acumulado do mês.
  const valorMidiaMes = midiaRank.reduce((s, m) => s + (m.valor || 0), 0);
  const difMidiaMes = valorMidiaMes - c.acumulado;
  let checaMidiaMes = "";
  if (c.acumulado > 0) {
    if (Math.abs(difMidiaMes) < 0.01)
      checaMidiaMes = "\n✅ Mídia confere com o Contratado do mês";
    else if (difMidiaMes < 0)
      checaMidiaMes = `\n⚠️ Faltam ${fmtBRL(Math.abs(difMidiaMes))} de vendas sem origem de mídia (Mídia ${fmtBRL(valorMidiaMes)} x Contratado ${fmtBRL(c.acumulado)})`;
    else
      checaMidiaMes = `\n⚠️ Mídia ${fmtBRL(valorMidiaMes)} acima do Contratado ${fmtBRL(c.acumulado)} — confira (diferença ${fmtBRL(difMidiaMes)})`;
  }
  const midiaTxt =
    topMidia.length === 0
      ? "Sem registros de mídia no mês"
      : topMidia.map((m) => `• ${m.nome}: ${m.qtd} clientes`).join("\n") +
        `\nTotal: ${totalMidia} clientes em mídia${checaMidiaMes}`;

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
