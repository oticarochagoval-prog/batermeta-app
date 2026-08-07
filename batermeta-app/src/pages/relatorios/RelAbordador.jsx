// Sub-aba Abordador — porte do protótipo (linhas 1385-1453).
//
// Card destaque com meta de clientes (paraMeta = total - promoção).
// Stats + lista de clientes com flag PROMOÇÃO.

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

export default function RelAbordador({ ab }) {
  return (
    <>
      {ab.meta > 0 && (
        <Card
          style={{
            padding: "12px 14px",
            marginBottom: 10,
            background: "#FFFBEB",
            border: `1px solid #FDE68A`,
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 6 }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              META DE CLIENTES
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color:
                  ab.pctMeta >= 100
                    ? COLORS.success
                    : ab.pctMeta >= 60
                    ? COLORS.warning
                    : COLORS.error,
              }}
            >
              {ab.pctMeta.toFixed(0)}%
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "Sora",
                color: COLORS.fg,
              }}
            >
              {ab.paraMeta}{" "}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.muted,
                }}
              >
                de {ab.meta}
              </span>
            </div>
            <div style={{ fontSize: 10.5, color: COLORS.muted }}>
              {ab.pctMeta >= 100
                ? "Bateu"
                : `Faltam ${Math.max(0, ab.meta - ab.paraMeta)}`}
            </div>
          </div>
          <div
            style={{
              height: 5,
              background: COLORS.border,
              borderRadius: 99,
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            <div
              style={{
                width: `${ab.pctMeta}%`,
                height: "100%",
                background:
                  ab.pctMeta >= 100
                    ? COLORS.success
                    : ab.pctMeta >= 60
                    ? COLORS.warning
                    : COLORS.error,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 10,
              color: COLORS.muted,
              marginTop: 6,
              fontStyle: "italic",
            }}
          >
            Clientes PROMOÇÃO não contam pra meta nem pra comissão.
          </div>
        </Card>
      )}
      <div className="flex gap-2" style={{ marginBottom: 8 }}>
        <Stat k="Clientes" v={ab.total} />
        <Stat k="Compraram" v={ab.compraram} cor={COLORS.success} />
      </div>
      <div className="flex gap-2" style={{ marginBottom: 8 }}>
        <Stat k="Pendentes" v={ab.pendentes} cor={COLORS.warning} />
        <Stat
          k="Conversão"
          v={`${ab.taxa.toFixed(1)}%`}
          cor={
            ab.taxa >= 50
              ? COLORS.success
              : ab.taxa >= 30
              ? COLORS.warning
              : COLORS.error
          }
        />
      </div>
      <div className="flex gap-2" style={{ marginBottom: 12 }}>
        <Stat k="Promoção" v={ab.promocao} cor={COLORS.warning} />
        <Stat k="Pra comissão" v={ab.paraMeta} cor={COLORS.primary} />
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {ab.list.length === 0 && (
          <div
            style={{
              padding: 16,
              textAlign: "center",
              color: COLORS.muted,
              fontSize: 13,
            }}
          >
            Sem clientes registrados pelo abordador.
          </div>
        )}
        {ab.list.map((cli, i) => {
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
                  i < ab.list.length - 1
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
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: comprou ? COLORS.muted : COLORS.fg,
                      textDecoration: comprou ? "line-through" : "none",
                    }}
                  >
                    {cli.nome}
                  </span>
                  {cli.promocao && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: "#fff",
                        background: COLORS.warning,
                        padding: "2px 6px",
                        borderRadius: 4,
                        letterSpacing: 0.4,
                      }}
                    >
                      PROMOÇÃO
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10.5, color: COLORS.muted }}>
                  Apareceu {fmtCurto(cli.dataChegou)}
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
