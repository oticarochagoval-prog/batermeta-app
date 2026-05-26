// Relatórios Consolidados (Master) — porte do protótipo (linhas 2398-2697).
//
// 3 sub-abas: Vendas (resumo da rede), Mídia (todas as origens) e
// Comparativo (linha por loja). Botão "Copiar relatório" gera texto
// formatado pra WhatsApp.

import React, { useState } from "react";
import { BarChart3, Check, FileText, Megaphone } from "lucide-react";
import { Card } from "../../ui/components.jsx";
import { COLORS } from "../../lib/colors.js";
import { CONFIG } from "../../lib/config.js";
import { MES, fmtBRL } from "../../lib/format.js";
import { barColor, calcMeta, statusDia } from "../../lib/calc.js";
import { btn } from "../../ui/Field.jsx";

export default function RelatoriosConsolidados({
  lojasState,
  lancamentos,
  midias,
  orcamentos,
  origens,
}) {
  const [sub, setSub] = useState("vendas");
  const [ordemComp, setOrdemComp] = useState("loja");
  const [copiado, setCopiado] = useState(false);

  const lojasAtivas = lojasState.filter((l) => l.ativa !== false);

  const dadosLoja = lojasAtivas.map((loja) => {
    const c = calcMeta(loja, "contratado", lancamentos);
    const f = calcMeta(loja, "faturado", lancamentos);
    const periodoHoje =
      loja.tipoPeriodo === "diario" ? CONFIG.hoje : `S${CONFIG.semanaAtual}`;
    const status = statusDia(loja, periodoHoje, lancamentos, midias, orcamentos);
    return {
      loja,
      contratado: c.acumulado,
      faturado: f.acumulado,
      total: c.acumulado + f.acumulado,
      metaTotal: (c.metas.meta || 0) + (f.metas.meta || 0),
      pctMeta: (c.pctMeta + f.pctMeta) / 2,
      diferenca: c.diferenca + f.diferenca,
      qtdVendas: c.qtdMes + f.qtdMes,
      ticket:
        c.qtdMes + f.qtdMes > 0
          ? (c.acumulado + f.acumulado) / (c.qtdMes + f.qtdMes)
          : 0,
      status,
    };
  });

  const totalContratado = dadosLoja.reduce((s, d) => s + d.contratado, 0);
  const totalFaturado = dadosLoja.reduce((s, d) => s + d.faturado, 0);
  const totalRede = totalContratado + totalFaturado;
  const metaRede = dadosLoja.reduce((s, d) => s + d.metaTotal, 0);
  const qtdRede = dadosLoja.reduce((s, d) => s + d.qtdVendas, 0);
  const ticketRede = qtdRede > 0 ? totalRede / qtdRede : 0;
  const diffRede = dadosLoja.reduce((s, d) => s + d.diferenca, 0);
  const lojasNoCredito = dadosLoja.filter((d) => d.diferenca >= 0).length;

  // mídia consolidada
  const mapaMidia = {};
  for (const o of origens) {
    const ms = midias.filter(
      (m) => m.lojaId === o.lojaId && m.origemId === o.id && !m.naoTeve
    );
    const qtd = ms.reduce((s, m) => s + (m.quantidade || 0), 0);
    const val = ms.reduce((s, m) => s + (m.valor || 0), 0);
    if (qtd === 0 && val === 0) continue;
    const chave = o.nome.trim().toLowerCase();
    if (!mapaMidia[chave])
      mapaMidia[chave] = { nome: o.nome, qtd: 0, valor: 0, lojas: new Set() };
    mapaMidia[chave].qtd += qtd;
    mapaMidia[chave].valor += val;
    mapaMidia[chave].lojas.add(o.lojaId);
  }
  const midiasConsolidadas = Object.values(mapaMidia)
    .map((x) => ({
      ...x,
      ticket: x.qtd > 0 ? x.valor / x.qtd : 0,
      lojas: x.lojas.size,
    }))
    .sort((a, b) => b.valor - a.valor);
  const totalMidiaQtd = midiasConsolidadas.reduce((s, m) => s + m.qtd, 0);
  const totalMidiaVal = midiasConsolidadas.reduce((s, m) => s + m.valor, 0);
  const ticketMidiaGeral = totalMidiaQtd > 0 ? totalMidiaVal / totalMidiaQtd : 0;

  const dadosOrdenados = [...dadosLoja].sort((a, b) => {
    if (ordemComp === "fat") return b.total - a.total;
    if (ordemComp === "pct") return b.pctMeta - a.pctMeta;
    if (ordemComp === "ticket") return b.ticket - a.ticket;
    return a.loja.id - b.loja.id;
  });

  const montaTexto = () => {
    const cab = `*BATERMETA — Relatório Consolidado*\n${MES[CONFIG.mes - 1]} / ${CONFIG.ano} · ${lojasAtivas.length} loja(s)\n`;
    if (sub === "vendas") {
      return `${cab}\n*VENDAS DA REDE*\nFaturamento total: ${fmtBRL(totalRede)}\nContratado: ${fmtBRL(totalContratado)}\nFaturado: ${fmtBRL(totalFaturado)}\nMeta da rede: ${fmtBRL(metaRede)}\nTicket médio geral: ${fmtBRL(ticketRede)}\nQtd. vendas: ${qtdRede}\nLojas no crédito: ${lojasNoCredito}/${lojasAtivas.length}\n${diffRede >= 0 ? `Crédito vs esperado: ${fmtBRL(diffRede)}` : `Débito vs esperado: ${fmtBRL(Math.abs(diffRede))}`}`;
    }
    if (sub === "midia") {
      const top = midiasConsolidadas
        .slice(0, 10)
        .map(
          (m, i) =>
            `${i + 1}. ${m.nome} — ${m.qtd} clientes · ${fmtBRL(m.valor)} · ticket ${fmtBRL(m.ticket)}`
        )
        .join("\n");
      return `${cab}\n*MÍDIA DA REDE*\nTotal: ${totalMidiaQtd} clientes · ${fmtBRL(totalMidiaVal)}\nTicket médio: ${fmtBRL(ticketMidiaGeral)}\n\nTop 10 origens:\n${top}`;
    }
    const linhas = dadosOrdenados
      .map(
        (d) =>
          `${d.loja.nome}: ${fmtBRL(d.total)} · ${d.pctMeta.toFixed(0)}% · ticket ${fmtBRL(d.ticket)} · ${d.diferenca >= 0 ? "+" : ""}${fmtBRL(d.diferenca)}`
      )
      .join("\n");
    return `${cab}\n*COMPARATIVO ENTRE LOJAS*\n${linhas}`;
  };

  const copiar = async () => {
    try {
      const t = montaTexto();
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(t);
      else {
        const ta = document.createElement("textarea");
        ta.value = t;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      setCopiado(false);
    }
  };

  const subs = [
    ["vendas", "Vendas", FileText],
    ["midia", "Mídia", Megaphone],
    ["comp", "Comparativo", BarChart3],
  ];

  return (
    <div style={{ padding: 16, background: COLORS.bg, minHeight: "100%" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {subs.map(([k, lbl, Ico]) => (
          <button
            key={k}
            onClick={() => setSub(k)}
            style={{
              flex: 1,
              padding: "9px 4px",
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
              border: `1.5px solid ${COLORS.primary}`,
              background: sub === k ? COLORS.primary : "#fff",
              color: sub === k ? "#fff" : COLORS.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Ico size={13} strokeWidth={1.8} /> {lbl}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 10 }}>
        Período:{" "}
        <b style={{ color: COLORS.fg }}>
          {MES[CONFIG.mes - 1]} / {CONFIG.ano}
        </b>
      </div>

      {/* VENDAS */}
      {sub === "vendas" && (
        <Card style={{ overflow: "hidden", marginBottom: 12, border: "none" }}>
          <div
            style={{
              background: COLORS.inkDark,
              color: "#fff",
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.6,
                color: COLORS.inkSub,
              }}
            >
              VENDAS DA REDE
            </div>
            <div style={{ fontSize: 12, color: "#fff", marginTop: 2 }}>
              {lojasAtivas.length} loja(s) ativas
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1,
              background: COLORS.border,
            }}
          >
            {[
              ["FATURAMENTO TOTAL", fmtBRL(totalRede), COLORS.fg],
              ["META DA REDE", fmtBRL(metaRede), COLORS.fg],
              ["CONTRATADO", fmtBRL(totalContratado), COLORS.roxo],
              ["FATURADO", fmtBRL(totalFaturado), COLORS.primary],
              ["TICKET MÉDIO", fmtBRL(ticketRede), COLORS.fg],
              ["VENDAS", String(qtdRede), COLORS.fg],
              [
                diffRede >= 0 ? "CRÉDITO" : "DÉBITO",
                fmtBRL(Math.abs(diffRede)),
                diffRede >= 0 ? COLORS.success : COLORS.error,
              ],
              [
                "LOJAS NO CRÉDITO",
                `${lojasNoCredito} de ${lojasAtivas.length}`,
                COLORS.fg,
              ],
            ].map(([k, v, cor], idx) => (
              <div key={idx} style={{ background: "#fff", padding: 14 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: COLORS.muted,
                    letterSpacing: 0.5,
                  }}
                >
                  {k}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: "Sora",
                    color: cor,
                    marginTop: 2,
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MÍDIA */}
      {sub === "midia" && (
        <>
          <Card
            style={{ overflow: "hidden", marginBottom: 12, border: "none" }}
          >
            <div
              style={{
                background: COLORS.inkDark,
                color: "#fff",
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  color: COLORS.inkSub,
                }}
              >
                MÍDIA DA REDE
              </div>
              <div style={{ fontSize: 12, color: "#fff", marginTop: 2 }}>
                todas as origens, todas as lojas
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 1,
                background: COLORS.border,
              }}
            >
              {[
                ["CLIENTES", String(totalMidiaQtd)],
                ["VALOR", fmtBRL(totalMidiaVal)],
                ["TICKET MÉDIO", fmtBRL(ticketMidiaGeral)],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "#fff", padding: 14 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: COLORS.muted,
                      letterSpacing: 0.5,
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      fontFamily: "Sora",
                      color: COLORS.fg,
                      marginTop: 2,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ overflow: "hidden" }}>
            <div
              style={{
                padding: "10px 14px",
                borderBottom: `1px solid ${COLORS.border}`,
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              ORIGENS CONSOLIDADAS · {midiasConsolidadas.length}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 60px 100px 80px",
                padding: "8px 14px",
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <span>ORIGEM</span>
              <span style={{ textAlign: "right" }}>CLIENTES</span>
              <span style={{ textAlign: "right" }}>VALOR</span>
              <span style={{ textAlign: "right" }}>TICKET</span>
            </div>
            {midiasConsolidadas.length === 0 && (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: COLORS.muted,
                  fontSize: 12,
                }}
              >
                Sem lançamentos de mídia.
              </div>
            )}
            {midiasConsolidadas.map((m, i) => (
              <div
                key={m.nome}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 60px 100px 80px",
                  padding: "10px 14px",
                  borderBottom:
                    i < midiasConsolidadas.length - 1
                      ? `1px solid ${COLORS.border}`
                      : "none",
                  background: i % 2 === 1 ? "#FAFAFB" : "#fff",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: COLORS.fg,
                    }}
                  >
                    {m.nome}
                  </div>
                  <div style={{ fontSize: 10, color: COLORS.muted }}>
                    {m.lojas} loja{m.lojas > 1 ? "s" : ""}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: "Sora",
                    fontWeight: 700,
                    color: COLORS.fg,
                    textAlign: "right",
                  }}
                >
                  {m.qtd}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "Sora",
                    fontWeight: 700,
                    color: COLORS.fg,
                    textAlign: "right",
                  }}
                >
                  {fmtBRL(m.valor)}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "Sora",
                    color: COLORS.muted,
                    textAlign: "right",
                  }}
                >
                  {fmtBRL(m.ticket)}
                </span>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* COMPARATIVO */}
      {sub === "comp" && (
        <Card style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "10px 14px",
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              COMPARATIVO ENTRE LOJAS
            </span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {[
                ["loja", "Loja"],
                ["fat", "Faturamento"],
                ["pct", "% Meta"],
                ["ticket", "Ticket"],
              ].map(([k, lbl]) => (
                <button
                  key={k}
                  onClick={() => setOrdemComp(k)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    fontSize: 10.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: `1px solid ${
                      ordemComp === k ? COLORS.primary : COLORS.border
                    }`,
                    background: ordemComp === k ? COLORS.primary : "#fff",
                    color: ordemComp === k ? "#fff" : COLORS.fg,
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 50px 70px 80px",
              padding: "8px 14px",
              fontSize: 10,
              fontWeight: 700,
              color: COLORS.muted,
              letterSpacing: 0.5,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <span>LOJA</span>
            <span style={{ textAlign: "right" }}>FATURAMENTO</span>
            <span style={{ textAlign: "right" }}>%</span>
            <span style={{ textAlign: "right" }}>TICKET</span>
            <span style={{ textAlign: "right" }}>SALDO</span>
          </div>
          {dadosOrdenados.map((d, i) => (
            <div
              key={d.loja.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 50px 70px 80px",
                padding: "10px 14px",
                borderBottom:
                  i < dadosOrdenados.length - 1
                    ? `1px solid ${COLORS.border}`
                    : "none",
                background: i % 2 === 1 ? "#FAFAFB" : "#fff",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.fg,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {d.loja.nome}
                  {!d.status.completo && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 99,
                        background: COLORS.warning,
                      }}
                    />
                  )}
                </div>
                <div style={{ fontSize: 10, color: COLORS.muted }}>
                  {d.qtdVendas} vendas
                </div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "Sora",
                  fontWeight: 700,
                  color: COLORS.fg,
                  textAlign: "right",
                }}
              >
                {fmtBRL(d.total)}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "Sora",
                  fontWeight: 800,
                  color: barColor(d.pctMeta),
                  textAlign: "right",
                }}
              >
                {d.pctMeta.toFixed(0)}%
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "Sora",
                  color: COLORS.muted,
                  textAlign: "right",
                }}
              >
                {fmtBRL(d.ticket)}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "Sora",
                  fontWeight: 700,
                  color: d.diferenca >= 0 ? COLORS.success : COLORS.error,
                  textAlign: "right",
                }}
              >
                {d.diferenca >= 0 ? "+" : "−"}
                {fmtBRL(Math.abs(d.diferenca))}
              </span>
            </div>
          ))}
          {dadosOrdenados.length === 0 && (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: COLORS.muted,
                fontSize: 12,
              }}
            >
              Nenhuma loja ativa.
            </div>
          )}
        </Card>
      )}

      <button
        onClick={copiar}
        style={{
          ...btn(copiado ? COLORS.success : COLORS.primary, {
            width: "100%",
            marginTop: 14,
          }),
        }}
      >
        {copiado ? (
          <>
            <Check size={16} /> Copiado! Cole onde quiser
          </>
        ) : (
          <>
            <FileText size={16} /> Copiar relatório
          </>
        )}
      </button>
      <p
        style={{
          fontSize: 10.5,
          color: COLORS.muted,
          textAlign: "center",
          marginTop: 8,
          lineHeight: 1.5,
        }}
      >
        Copia o texto formatado pronto pra colar no WhatsApp, e-mail ou onde
        precisar.
      </p>
    </div>
  );
}
