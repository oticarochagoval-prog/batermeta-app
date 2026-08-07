// Sub-aba Mídia — porte do protótipo (linhas 1455-1501).
//
// Card destacado com total da rede (clientes, valor, ticket geral) +
// lista de origens com barras proporcionais ao valor.

import React from "react";
import { Card } from "../../ui/components.jsx";
import { COLORS } from "../../lib/colors.js";
import { CONFIG } from "../../lib/config.js";
import { fmtBRL, MES } from "../../lib/format.js";

export default function RelMidia({ midia }) {
  const maxMidia = Math.max(1, ...midia.map((m) => m.valor));
  const totQtd = midia.reduce((s, m) => s + m.qtd, 0);
  const totVal = midia.reduce((s, m) => s + m.valor, 0);
  const totTicket = totQtd > 0 ? totVal / totQtd : 0;

  return (
    <>
      <div
        style={{
          fontSize: 12,
          color: COLORS.muted,
          marginBottom: 10,
          lineHeight: 1.5,
        }}
      >
        Quanto cada origem trouxe no mês — em <b>quantidade</b> de clientes e{" "}
        <b>valor</b> gerado.
      </div>

      <Card
        style={{
          background: COLORS.teal,
          color: "#fff",
          border: "none",
          padding: 14,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            opacity: 0.85,
            fontWeight: 600,
            letterSpacing: 0.3,
          }}
        >
          TOTAL DE TODAS AS MÍDIAS — {MES[CONFIG.mes - 1]}/{CONFIG.ano}
        </div>
        <div className="flex" style={{ marginTop: 8, gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, opacity: 0.85 }}>Clientes</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "Sora",
              }}
            >
              {totQtd}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, opacity: 0.85 }}>Valor gerado</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "Sora",
              }}
            >
              {fmtBRL(totVal)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, opacity: 0.85 }}>Ticket médio</div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "Sora",
              }}
            >
              {fmtBRL(totTicket)}
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 12 }}>
        {midia.every((m) => m.qtd === 0) && (
          <div
            style={{
              textAlign: "center",
              color: COLORS.muted,
              fontSize: 13,
              padding: 8,
            }}
          >
            Sem mídia lançada ainda.
          </div>
        )}
        {midia
          .filter((m) => m.qtd > 0)
          .map((m) => (
            <div key={m.id} style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    fontFamily: "Sora",
                  }}
                >
                  {m.nome}
                </span>
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: COLORS.muted,
                  marginBottom: 6,
                }}
              >
                {fmtBRL(m.valor)} ÷ {m.qtd} ={" "}
                <b
                  style={{
                    color: COLORS.fg,
                    fontFamily: "Sora",
                    fontSize: 16,
                  }}
                >
                  {fmtBRL(m.ticket)}
                </b>{" "}
                <span style={{ fontSize: 12 }}>por cliente</span>
              </div>
              <div
                style={{
                  height: 8,
                  background: "#EEF2F7",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(m.valor / maxMidia) * 100}%`,
                    height: "100%",
                    background: COLORS.teal,
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          ))}
      </Card>
    </>
  );
}
