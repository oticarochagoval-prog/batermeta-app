// Dashboard da loja — porte do protótipo (linhas 520-629).
//
// Diferenças vs. protótipo:
//   • Histórico de meses anteriores (histDaLoja mockado no protótipo)
//     fica como "—" até a Etapa 3 carregar da tabela `lancamentos`
//     o totalizado por mês. O card aparece desabilitado.
//   • Lista "ÚLTIMOS LANÇAMENTOS" vem dos lancamentos reais carregados.

import React, { useMemo } from "react";
import { Send, Trophy } from "lucide-react";
import { COLORS } from "../lib/colors.js";
import { fmtBRL, fmtCurto, MES } from "../lib/format.js";
import { CONFIG } from "../lib/config.js";
import { calcMeta, statusDia } from "../lib/calc.js";
import {
  Card,
  BlocoMeta,
  AvisoIncompleto,
} from "../ui/components.jsx";

export default function Dashboard({
  loja,
  lancamentos,
  midias,
  orcamentos,
  onWhats,
  onIrLancar,
}) {
  const c = useMemo(
    () => calcMeta(loja, "contratado", lancamentos),
    [loja, lancamentos]
  );
  const f = useMemo(
    () => calcMeta(loja, "faturado", lancamentos),
    [loja, lancamentos]
  );
  const periodoHoje =
    loja.tipoPeriodo === "diario" ? CONFIG.hoje : `S${CONFIG.semanaAtual}`;
  const status = statusDia(loja, periodoHoje, lancamentos, midias, orcamentos);
  const totalHoje = c.vendidoHoje + f.vendidoHoje;
  const periodoLabel =
    loja.tipoPeriodo === "diario"
      ? "O dia de hoje"
      : `A semana ${CONFIG.semanaAtual}`;
  const movLabel =
    loja.tipoPeriodo === "diario"
      ? `MOV. DIÁRIO — ${fmtCurto(CONFIG.hoje)}`
      : `MOV. SEMANAL — Semana ${CONFIG.semanaAtual}`;

  const histC = [...c.lancamentos]
    .sort((a, b) => b.periodo.localeCompare(a.periodo) || b.id - a.id)
    .slice(0, 8);
  const histF = [...f.lancamentos]
    .sort((a, b) => b.periodo.localeCompare(a.periodo) || b.id - a.id)
    .slice(0, 8);

  const atualTotal = c.acumulado + f.acumulado;
  // Histórico de meses anteriores: carregado na Etapa 3.
  // Por enquanto, deixamos o card preparado mas sem comparativo.
  const temHistorico = false;

  return (
    <div style={{ padding: 16 }}>
      <AvisoIncompleto
        status={status}
        onIr={onIrLancar}
        periodoLabel={periodoLabel}
      />

      <Card
        style={{
          background: COLORS.primary,
          color: "#fff",
          padding: 16,
          marginBottom: 14,
          border: "none",
        }}
      >
        <div
          style={{
            fontSize: 12,
            opacity: 0.8,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          {movLabel}
        </div>
        <div
          style={{
            fontSize: 30,
            fontWeight: 800,
            fontFamily: "Sora",
            margin: "2px 0 12px",
          }}
        >
          {fmtBRL(totalHoje)}
        </div>
        <div className="flex gap-2">
          {[
            ["Contratado", c.vendidoHoje, c.acumulado],
            ["Faturado", f.vendidoHoje, f.acumulado],
          ].map(([k, hoje, mes]) => (
            <div
              key={k}
              style={{
                flex: 1,
                background: "rgba(255,255,255,.12)",
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>
                {k}
              </div>
              <div
                style={{
                  fontSize: 9.5,
                  opacity: 0.65,
                  letterSpacing: 0.4,
                  marginTop: 6,
                }}
              >
                HOJE
              </div>
              <div
                style={{ fontSize: 15, fontWeight: 800, fontFamily: "Sora" }}
              >
                {fmtBRL(hoje)}
              </div>
              <div
                style={{
                  fontSize: 9.5,
                  opacity: 0.65,
                  letterSpacing: 0.4,
                  marginTop: 4,
                }}
              >
                MÊS
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "Sora",
                  opacity: 0.95,
                }}
              >
                {fmtBRL(mes)}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onWhats}
          style={{
            background: COLORS.success,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 12,
            width: "100%",
          }}
        >
          <Send size={15} /> Enviar Relatório via WhatsApp
        </button>
      </Card>

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.muted,
          letterSpacing: 0.5,
          margin: "4px 2px 10px",
        }}
      >
        METAS DO MÊS
      </div>
      <BlocoMeta titulo="CONTRATADO" cor={COLORS.roxo} calc={c} />
      <BlocoMeta titulo="FATURADO" cor={COLORS.primary} calc={f} />

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.muted,
          letterSpacing: 0.5,
          margin: "8px 2px 10px",
        }}
      >
        HISTÓRICO · MÊS ATUAL x MELHOR MÊS
      </div>
      <Card style={{ padding: 16, marginBottom: 14 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>
              Mês atual ({MES[CONFIG.mes - 1].slice(0, 3)}/
              {String(CONFIG.ano).slice(2)})
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "Sora",
                color: COLORS.fg,
              }}
            >
              {fmtBRL(atualTotal)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 11,
                color: COLORS.muted,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Trophy size={12} color={COLORS.gold} strokeWidth={1.8} /> Melhor
              mês
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "Sora",
                color: COLORS.gold,
              }}
            >
              —
            </div>
          </div>
        </div>
        {!temHistorico && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              fontSize: 12,
              color: COLORS.muted,
              background: "#F8FAFC",
              textAlign: "center",
            }}
          >
            Comparativo mensal disponível após o primeiro fechamento de mês.
          </div>
        )}
      </Card>

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.muted,
          letterSpacing: 0.5,
          margin: "8px 2px 10px",
        }}
      >
        ÚLTIMOS LANÇAMENTOS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          ["Contratado", histC, COLORS.roxo],
          ["Faturado", histF, COLORS.primary],
        ].map(([titulo, lista, cor]) => (
          <Card key={titulo} style={{ overflow: "hidden" }}>
            <div
              style={{
                background: cor,
                color: "#fff",
                padding: "7px 10px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {titulo}
            </div>
            <div style={{ padding: 4 }}>
              {lista.length === 0 && (
                <div
                  style={{
                    padding: 14,
                    textAlign: "center",
                    color: COLORS.muted,
                    fontSize: 11,
                  }}
                >
                  Sem lançamentos
                </div>
              )}
              {lista.map((l, i) => (
                <div
                  key={l.id}
                  style={{
                    padding: "8px 8px",
                    borderBottom:
                      i < lista.length - 1
                        ? `1px solid ${COLORS.border}`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "Sora",
                      color: l.naoTeve ? COLORS.muted : COLORS.fg,
                    }}
                  >
                    {l.naoTeve ? "—" : fmtBRL(l.valor)}
                  </div>
                  <div style={{ fontSize: 10.5, color: COLORS.muted }}>
                    {l.periodo.startsWith("S")
                      ? `Semana ${l.periodo.slice(1)}`
                      : fmtCurto(l.periodo)}
                    {l.qtdVendas ? ` · ${l.qtdVendas} vd` : ""}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
