// Sub-aba Vendas — porte do protótipo (linhas 1265-1348).
//
// Cards no topo (Contratado / Faturado) clicáveis filtram a lista.
// "Todos" mostra duas colunas (Contratado | Faturado).
// Quando 1 selecionado, mostra lista única ampliada.
// Cada lista tem: resumo de metas no topo, depois linhas.

import React, { useState } from "react";
import { Check, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "../../ui/components.jsx";
import { CAT_LABEL, COLORS } from "../../lib/colors.js";
import { fmtBRL, fmtCurto } from "../../lib/format.js";

export default function RelVendas({ c, f }) {
  const [filtro, setFiltro] = useState("todos");

  const FiltroCard = ({ id, k, v, cor }) => {
    const ativo = filtro === id;
    return (
      <Card
        onClick={() => setFiltro(ativo ? "todos" : id)}
        style={{
          flex: 1,
          padding: 12,
          cursor: "pointer",
          border: `1.5px solid ${ativo ? cor : COLORS.border}`,
          background: ativo ? `${cor}0F` : COLORS.surface,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: COLORS.muted,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {k}
          {ativo && <Check size={11} color={cor} strokeWidth={2.5} />}
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            fontFamily: "Sora",
            color: cor,
          }}
        >
          {v}
        </div>
      </Card>
    );
  };

  const perLabel = (p) =>
    p.startsWith("S") ? `Semana ${p.slice(1)}` : fmtCurto(p);

  const todasC = [...c.lancamentos].sort(
    (a, b) => b.periodo.localeCompare(a.periodo) || b.id - a.id
  );
  const todasF = [...f.lancamentos].sort(
    (a, b) => b.periodo.localeCompare(a.periodo) || b.id - a.id
  );

  const renderLinha = (l, ultimo) => (
    <div
      key={l.id}
      style={{
        padding: "9px 10px",
        borderBottom: ultimo ? "none" : `1px solid ${COLORS.border}`,
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
        {l.naoTeve ? "Não teve" : fmtBRL(l.valor)}
      </div>
      <div style={{ fontSize: 10.5, color: COLORS.muted, marginTop: 1 }}>
        {perLabel(l.periodo)}
        {l.qtdVendas ? ` · ${l.qtdVendas} vd` : ""}
      </div>
    </div>
  );

  // Resumo de metas (saldo + %) por nível para cada categoria
  const resumoMetas = (calc) => {
    const niveis = [
      { nome: "Meta", valor: calc.metas.meta, pct: calc.pctMeta },
      {
        nome: "Super Meta",
        valor: calc.metas.superMeta,
        pct: calc.pctSuper,
      },
      ...(calc.metas.gold
        ? [{ nome: "Gold", valor: calc.metas.gold, pct: calc.pctGold }]
        : []),
    ];
    return niveis.map((n) => {
      const esperado = (n.valor / calc.divisor) * calc.decorridos;
      const dif = calc.acumulado - esperado;
      const credito = dif >= 0;
      const corDif = credito ? COLORS.success : COLORS.error;
      return { ...n, dif, credito, corDif };
    });
  };

  const renderResumo = (calc) => (
    <div
      style={{
        padding: "8px 10px",
        borderBottom: `1px solid ${COLORS.border}`,
        background: "#F8FAFC",
      }}
    >
      {resumoMetas(calc).map((n) => (
        <div
          key={n.nome}
          className="flex items-center justify-between"
          style={{ marginBottom: 3 }}
        >
          <span
            style={{
              fontSize: 10.5,
              color: COLORS.muted,
              fontWeight: 600,
            }}
          >
            {n.nome}
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              color: n.corDif,
              fontFamily: "Sora",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            {n.credito ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {n.credito ? "+" : "−"}
            {fmtBRL(Math.abs(n.dif)).replace("R$ ", "R$")}
            <span
              style={{
                color: COLORS.muted,
                fontWeight: 600,
                marginLeft: 4,
              }}
            >
              · {n.pct.toFixed(0)}%
            </span>
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="flex gap-2" style={{ marginBottom: 8 }}>
        <FiltroCard
          id="contratado"
          k="Contratado"
          v={fmtBRL(c.acumulado)}
          cor={COLORS.roxo}
        />
        <FiltroCard
          id="faturado"
          k="Faturado"
          v={fmtBRL(f.acumulado)}
          cor={COLORS.primary}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color: COLORS.muted,
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        {filtro === "todos" ? (
          "Toque num card para ver só ele"
        ) : (
          <>
            Mostrando só{" "}
            <b
              style={{
                color:
                  filtro === "contratado" ? COLORS.roxo : COLORS.primary,
              }}
            >
              {CAT_LABEL[filtro]}
            </b>{" "}
            · toque de novo para ver todos
          </>
        )}
      </div>

      {filtro === "todos" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {[
            ["Contratado", todasC, COLORS.roxo, c],
            ["Faturado", todasF, COLORS.primary, f],
          ].map(([titulo, lista, cor, calc]) => (
            <Card key={titulo} style={{ overflow: "hidden" }}>
              <div
                style={{
                  background: cor,
                  color: "#fff",
                  padding: "8px 12px",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {titulo}
              </div>
              {renderResumo(calc)}
              <div>
                {lista.length === 0 && (
                  <div
                    style={{
                      padding: 16,
                      textAlign: "center",
                      color: COLORS.muted,
                      fontSize: 12,
                    }}
                  >
                    Sem lançamentos
                  </div>
                )}
                {lista
                  .slice(0, 15)
                  .map((l, i) =>
                    renderLinha(l, i === Math.min(lista.length, 15) - 1)
                  )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ overflow: "hidden" }}>
          <div
            style={{
              background:
                filtro === "contratado" ? COLORS.roxo : COLORS.primary,
              color: "#fff",
              padding: "8px 12px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {filtro === "contratado" ? "Contratado" : "Faturado"}
          </div>
          {renderResumo(filtro === "contratado" ? c : f)}
          <div>
            {(filtro === "contratado" ? todasC : todasF)
              .slice(0, 30)
              .map((l, i, arr) => renderLinha(l, i === arr.length - 1))}
            {(filtro === "contratado" ? todasC : todasF).length === 0 && (
              <div
                style={{
                  padding: 16,
                  textAlign: "center",
                  color: COLORS.muted,
                  fontSize: 13,
                }}
              >
                Sem lançamentos.
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
