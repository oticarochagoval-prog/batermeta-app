// Sub-aba Orçamentos — porte do protótipo (linhas 1350-1383).
//
// Stats (atendimentos, compraram, pendentes, conversão) + lista mensal.

import React from "react";
import { Card } from "../../ui/components.jsx";
import { COLORS } from "../../lib/colors.js";
import { fmtCurto } from "../../lib/format.js";

const Stat = ({ k, v, cor }) => (
  <Card style={{ flex: 1, padding: 12 }}>
    <div style={{ fontSize: 11, color: COLORS.muted }}>{k}</div>
    <div
      style={{
        fontSize: 15,
        fontWeight: 800,
        fontFamily: "Sora",
        color: cor || COLORS.fg,
      }}
    >
      {v}
    </div>
  </Card>
);

export default function RelOrcamentos({ orc }) {
  return (
    <>
      <div className="flex gap-2" style={{ marginBottom: 8 }}>
        <Stat k="Atendimentos" v={orc.total} />
        <Stat k="Compraram" v={orc.compraram} cor={COLORS.success} />
      </div>
      <div className="flex gap-2" style={{ marginBottom: 12 }}>
        <Stat k="Pendentes" v={orc.pendentes} cor={COLORS.warning} />
        <Stat
          k="Conversão"
          v={`${orc.taxa.toFixed(1)}%`}
          cor={
            orc.taxa >= 50
              ? COLORS.success
              : orc.taxa >= 30
              ? COLORS.warning
              : COLORS.error
          }
        />
      </div>
      <Card style={{ overflow: "hidden" }}>
        {orc.list.length === 0 && (
          <div
            style={{
              padding: 16,
              textAlign: "center",
              color: COLORS.muted,
              fontSize: 13,
            }}
          >
            Sem clientes em orçamento.
          </div>
        )}
        {orc.list.map((cli, i) => {
          const comprou = !!cli.dataComprou;
          return (
            <div
              key={cli.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderBottom:
                  i < orc.list.length - 1
                    ? `1px solid ${COLORS.border}`
                    : "none",
                background: comprou ? "#F0FDF4" : "#fff",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  flexShrink: 0,
                  background: comprou ? COLORS.success : COLORS.warning,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: comprou ? COLORS.muted : COLORS.fg,
                    textDecoration: comprou ? "line-through" : "none",
                  }}
                >
                  {cli.nome}
                </div>
                <div style={{ fontSize: 10.5, color: COLORS.muted }}>
                  Orçamento {fmtCurto(cli.dataChegou)}
                  {comprou && (
                    <>
                      {" "}
                      ·{" "}
                      <span
                        style={{ color: COLORS.success, fontWeight: 700 }}
                      >
                        Comprou {fmtCurto(cli.dataComprou)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
