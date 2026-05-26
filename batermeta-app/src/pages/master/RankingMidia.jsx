// Ranking de Mídia (Master) — porte do protótipo (linhas 2274-2396).
//
// Agrega origens de mesmo NOME entre lojas (Instagram da Rocha 1 +
// Instagram da Rocha 2 = um item só). Top 3 destaque + ranking
// completo. Ordenação por valor, clientes ou ticket médio.

import React, { useState } from "react";
import { Card } from "../../ui/components.jsx";
import { COLORS } from "../../lib/colors.js";
import { CONFIG } from "../../lib/config.js";
import { MES, fmtBRL } from "../../lib/format.js";

export default function RankingMidia({ midias, origens }) {
  const [limite, setLimite] = useState(10);
  const [ordem, setOrdem] = useState("valor");

  // Agrega por nome (case-insensitive)
  const mapa = {};
  for (const o of origens) {
    const ms = midias.filter(
      (m) => m.lojaId === o.lojaId && m.origemId === o.id && !m.naoTeve
    );
    const qtd = ms.reduce((s, m) => s + (m.quantidade || 0), 0);
    const val = ms.reduce((s, m) => s + (m.valor || 0), 0);
    if (qtd === 0 && val === 0) continue;
    const chave = o.nome.trim().toLowerCase();
    if (!mapa[chave])
      mapa[chave] = { nome: o.nome, qtd: 0, valor: 0, lojas: new Set() };
    mapa[chave].qtd += qtd;
    mapa[chave].valor += val;
    mapa[chave].lojas.add(o.lojaId);
  }
  const itens = Object.values(mapa).map((x) => ({
    ...x,
    ticket: x.qtd > 0 ? x.valor / x.qtd : 0,
    lojas: x.lojas.size,
  }));

  const sorted = [...itens].sort((a, b) => {
    if (ordem === "clientes") return b.qtd - a.qtd;
    if (ordem === "ticket") return b.ticket - a.ticket;
    return b.valor - a.valor;
  });

  const top3 = sorted.slice(0, 3);
  const lista = sorted.slice(0, limite);

  const medalha = (i) => {
    const cores = [COLORS.gold, "#94A3B8", "#A16207"];
    return cores[i] || COLORS.muted;
  };

  return (
    <div style={{ padding: 16, background: COLORS.bg, minHeight: "100%" }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: COLORS.muted,
          letterSpacing: 0.5,
          marginBottom: 10,
        }}
      >
        DESTAQUES · {MES[CONFIG.mes - 1]}/{CONFIG.ano} · por{" "}
        {ordem === "valor"
          ? "valor gerado"
          : ordem === "clientes"
          ? "clientes"
          : "ticket médio"}
      </div>

      {top3.length === 0 ? (
        <Card
          style={{
            padding: 24,
            textAlign: "center",
            color: COLORS.muted,
            fontSize: 13,
          }}
        >
          Sem lançamentos de mídia no mês.
        </Card>
      ) : (
        <Card style={{ overflow: "hidden", marginBottom: 14 }}>
          {top3.map((m, i) => (
            <div
              key={m.nome}
              style={{
                padding: "12px 14px",
                borderBottom:
                  i < top3.length - 1 ? `1px solid ${COLORS.border}` : "none",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 99,
                  background: `${medalha(i)}22`,
                  color: medalha(i),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontFamily: "Sora",
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {i + 1}º
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily: "Sora",
                    color: COLORS.fg,
                  }}
                >
                  {m.nome.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: COLORS.muted,
                    marginTop: 1,
                  }}
                >
                  {m.qtd} clientes · {m.lojas} loja{m.lojas > 1 ? "s" : ""}
                </div>
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  fontFamily: "Sora",
                  color: COLORS.primary,
                }}
              >
                {ordem === "clientes"
                  ? m.qtd
                  : fmtBRL(ordem === "ticket" ? m.ticket : m.valor)}
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 14px",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 10 }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              RANKING · TOP {limite === 999 ? "TODOS" : limite}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                [10, "Top 10"],
                [20, "Top 20"],
                [999, "Todos"],
              ].map(([n, lbl]) => (
                <button
                  key={n}
                  onClick={() => setLimite(n)}
                  style={{
                    padding: "5px 9px",
                    borderRadius: 7,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    border: `1px solid ${
                      limite === n ? COLORS.primary : COLORS.border
                    }`,
                    background: limite === n ? COLORS.primary : "#fff",
                    color: limite === n ? "#fff" : COLORS.fg,
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{ display: "flex", gap: 4, alignItems: "center" }}
          >
            <span
              style={{
                fontSize: 11,
                color: COLORS.muted,
                marginRight: 4,
              }}
            >
              Classificar:
            </span>
            {[
              ["valor", "Valor"],
              ["clientes", "Clientes"],
              ["ticket", "Ticket médio"],
            ].map(([k, lbl]) => (
              <button
                key={k}
                onClick={() => setOrdem(k)}
                style={{
                  padding: "5px 10px",
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 90px 70px",
            padding: "8px 14px",
            fontSize: 10,
            fontWeight: 700,
            color: COLORS.muted,
            letterSpacing: 0.5,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <span>#</span>
          <span>ORIGEM</span>
          <span style={{ textAlign: "right" }}>VALOR</span>
          <span style={{ textAlign: "right" }}>TICKET</span>
        </div>
        {lista.map((m, i) => (
          <div
            key={m.nome}
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 90px 70px",
              padding: "10px 14px",
              borderBottom:
                i < lista.length - 1 ? `1px solid ${COLORS.border}` : "none",
              background: i % 2 === 1 ? "#FAFAFB" : "#fff",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                fontFamily: "Sora",
                color: i < 3 ? medalha(i) : COLORS.muted,
              }}
            >
              {i + 1}º
            </span>
            <div style={{ minWidth: 0 }}>
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
                {m.qtd} clientes
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "Sora",
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
        {lista.length === 0 && (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: COLORS.muted,
              fontSize: 12,
            }}
          >
            Sem dados.
          </div>
        )}
      </Card>

      <p
        style={{
          fontSize: 11,
          color: COLORS.muted,
          textAlign: "center",
          marginTop: 12,
          lineHeight: 1.5,
        }}
      >
        O ranking junta origens de mesmo nome em lojas diferentes. Útil pra ver
        qual mídia mais traz cliente — e qual traz cliente que gasta mais
        (ticket médio).
      </p>
    </div>
  );
}
