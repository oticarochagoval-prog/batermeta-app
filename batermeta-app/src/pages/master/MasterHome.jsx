// MasterHome — porte do protótipo (linhas 1723-1856).
//
// Painel principal do master: consolidado da rede + alerta de lojas
// incompletas + faturamento por loja com barras + lista de lojas
// clicáveis. Ordenação por loja, faturamento ou % meta.

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, ProgressBar } from "../../ui/components.jsx";
import { CAT_LABEL, COLORS } from "../../lib/colors.js";
import { CONFIG } from "../../lib/config.js";
import { MES, fmtBRL } from "../../lib/format.js";
import { barColor, calcMeta, statusDia } from "../../lib/calc.js";

export default function MasterHome({
  lojasState,
  lancamentos,
  midias,
  orcamentos,
  onOpen,
}) {
  const [ordem, setOrdem] = useState("loja");
  const lojasAtivas = lojasState.filter((l) => l.ativa !== false);

  const linhasBase = lojasAtivas.map((loja) => {
    const c = calcMeta(loja, "contratado", lancamentos);
    const f = calcMeta(loja, "faturado", lancamentos);
    const periodoHoje =
      loja.tipoPeriodo === "diario" ? CONFIG.hoje : `S${CONFIG.semanaAtual}`;
    const status = statusDia(
      loja,
      periodoHoje,
      lancamentos,
      midias,
      orcamentos
    );
    // FIX (27/05/2026): "Faturamento" no painel = apenas Faturado.
    // Antes somava Contratado + Faturado (dupla contagem) e dava
    // valores absurdos tipo R$ 227k pra uma loja. Faturado é o que
    // virou caixa de fato. % Meta tb usa só Faturado pra ficar
    // coerente com o número exibido.
    return {
      loja,
      c,
      f,
      status,
      totalHoje: f.vendidoHoje,
      totalMes: f.acumulado,
      pct: f.pctMeta,
    };
  });

  const linhas = [...linhasBase].sort((a, b) => {
    if (ordem === "fat") return b.totalMes - a.totalMes;
    if (ordem === "pct") return b.pct - a.pct;
    return a.loja.id - b.loja.id;
  });

  const totalDia = linhas.reduce((s, l) => s + l.totalHoje, 0);
  const totalMes = linhas.reduce((s, l) => s + l.f.acumulado, 0);
  const qtdMes = linhas.reduce((s, l) => s + l.f.qtdMes, 0);
  const ticketGeral = qtdMes > 0 ? totalMes / qtdMes : 0;
  const bateram = linhas.filter((l) => l.f.diferenca >= 0).length;
  const incompletas = linhas.filter((l) => !l.status.completo);
  const nLojas = Math.max(1, lojasAtivas.length);
  const maxFat = Math.max(1, ...linhas.map((l) => l.totalMes));

  return (
    <div style={{ padding: 16, background: COLORS.bg, minHeight: "100%" }}>
      {/* card consolidado escuro */}
      <Card style={{ overflow: "hidden", marginBottom: 14, border: "none" }}>
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
            CONSOLIDADO GERAL
          </div>
          <div style={{ fontSize: 12, color: "#fff", marginTop: 2 }}>
            {MES[CONFIG.mes - 1]} / {CONFIG.ano} · {nLojas} loja
            {nLojas > 1 ? "s" : ""}
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
          <div style={{ background: "#fff", padding: 14 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              FATURAMENTO MÊS
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "Sora",
                color: COLORS.fg,
                marginTop: 2,
              }}
            >
              {fmtBRL(totalMes)}
            </div>
          </div>
          <div style={{ background: "#fff", padding: 14 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              TICKET MÉDIO GERAL
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "Sora",
                color: COLORS.fg,
                marginTop: 2,
              }}
            >
              {fmtBRL(ticketGeral)}
            </div>
          </div>
          <div style={{ background: "#fff", padding: 14 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              TOTAL DO DIA
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "Sora",
                color: COLORS.success,
                marginTop: 2,
              }}
            >
              {fmtBRL(totalDia)}
            </div>
          </div>
          <div style={{ background: "#fff", padding: 14 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              QTD. VENDAS
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "Sora",
                color: COLORS.fg,
                marginTop: 2,
              }}
            >
              {qtdMes}
            </div>
            <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 1 }}>
              {bateram} de {nLojas} no crédito
            </div>
          </div>
        </div>
      </Card>

      {incompletas.length > 0 && (
        <Card
          style={{
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            padding: 14,
            marginBottom: 14,
          }}
        >
          <div
            className="flex items-center gap-2"
            style={{ marginBottom: 6 }}
          >
            <AlertTriangle size={16} color={COLORS.warning} />
            <span
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: "#92400E",
              }}
            >
              {incompletas.length} loja(s) com lançamento incompleto hoje
            </span>
          </div>
          {incompletas.map(({ loja, status }) => (
            <div
              key={loja.id}
              style={{ fontSize: 12, color: "#B45309", padding: "2px 0" }}
            >
              <b>{loja.nome}</b> — falta:{" "}
              {status.faltam.map((k) => CAT_LABEL[k]).join(", ")}
            </div>
          ))}
        </Card>
      )}

      {/* faturamento por loja */}
      <Card style={{ overflow: "hidden", marginBottom: 14 }}>
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
            FATURAMENTO POR LOJA
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              ["loja", "Loja"],
              ["fat", "Faturamento"],
              ["pct", "% Meta"],
            ].map(([k, lbl]) => (
              <button
                key={k}
                onClick={() => setOrdem(k)}
                style={{
                  padding: "5px 9px",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `1px solid ${
                    ordem === k ? COLORS.primary : COLORS.border
                  }`,
                  background: ordem === k ? COLORS.primary : "#fff",
                  color: ordem === k ? "#fff" : COLORS.fg,
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "10px 14px" }}>
          {linhas.length === 0 && (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: COLORS.muted,
                fontSize: 13,
              }}
            >
              Nenhuma loja ativa.
            </div>
          )}
          {linhas.map(({ loja, totalMes: tot }) => {
            const pct = (tot / maxFat) * 100;
            return (
              <div
                key={loja.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "85px 1fr 110px",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 0",
                }}
              >
                <span style={{ fontSize: 12, color: COLORS.fg }}>
                  {loja.nome}
                </span>
                <div
                  style={{
                    height: 12,
                    background: "#F1F5F9",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(2, pct)}%`,
                      height: "100%",
                      background: tot > 0 ? COLORS.primary : "transparent",
                      borderRadius: 4,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "Sora",
                    fontWeight: 700,
                    color: tot > 0 ? COLORS.fg : COLORS.muted,
                    textAlign: "right",
                  }}
                >
                  {tot > 0 ? fmtBRL(tot) : "sem lançamento"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.muted,
          letterSpacing: 0.5,
          margin: "4px 2px 10px",
        }}
      >
        TOQUE NUMA LOJA PARA ABRIR · ORDENADO POR{" "}
        {ordem === "loja"
          ? "NOME DA LOJA"
          : ordem === "fat"
          ? "FATURAMENTO"
          : "% DA META"}
      </div>
      {linhas.map(({ loja, c, f, status, totalHoje, pct }) => {
        // FIX (27/05/2026): cd (crédito/débito) usa só Faturado.
        // Antes somava as diferenças de C e F (que estouravam mesmo
        // calculando certo, pois cada um tem sua meta separada).
        const cd = f.diferenca;
        return (
          <Card
            key={loja.id}
            style={{ padding: 14, marginBottom: 10, cursor: "pointer" }}
          >
            <div onClick={() => onOpen(loja)}>
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: 8 }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {loja.nome}
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: COLORS.muted,
                      background: "#F1F5F9",
                      borderRadius: 5,
                      padding: "2px 5px",
                    }}
                  >
                    {loja.tipoPeriodo === "diario" ? "DIÁRIO" : "SEMANAL"}
                  </span>
                  {!status.completo && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 99,
                        background: COLORS.warning,
                      }}
                    />
                  )}
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontFamily: "Sora",
                    fontSize: 14,
                    color: barColor(pct),
                  }}
                >
                  {pct.toFixed(0)}%
                </span>
              </div>
              <ProgressBar pct={pct} />
              <div
                className="flex items-center justify-between"
                style={{ marginTop: 8, fontSize: 11, color: COLORS.muted }}
              >
                <span>Hoje {fmtBRL(totalHoje)}</span>
                <span
                  style={{
                    color: cd >= 0 ? COLORS.success : COLORS.error,
                    fontWeight: 700,
                  }}
                >
                  {cd >= 0 ? "Crédito" : "Débito"}{" "}
                  {fmtBRL(Math.abs(cd))}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
