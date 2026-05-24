// Lançar Abordador — porte do protótipo (linhas 1042-1210).
//
// Lista mensal de clientes trazidos pelo abordador, com flag PROMOÇÃO
// (regra do briefing #7: promoção EXISTE APENAS aqui).
// Header com meta de clientes do mês (paraMeta = total - promoção).

import React, { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { CAT_COR, COLORS } from "../../lib/colors.js";
import { fmtCurto, MES, pad, parseISO } from "../../lib/format.js";
import { CONFIG } from "../../lib/config.js";
import {
  addClienteAbord,
  removeClienteAbord,
  toggleClienteAbord,
  togglePromocaoAbord,
} from "../../lib/db.js";
import { inp } from "../../ui/Field.jsx";

export default function FormAbordador({ loja, abordadores, onSaved }) {
  const cor = CAT_COR.abordador;
  const [nome, setNome] = useState("");
  const [promo, setPromo] = useState(false);
  const [filtro, setFiltro] = useState("mes");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const clientesLoja = abordadores.filter((a) => a.lojaId === loja.id);
  const inicioMes = `${CONFIG.ano}-${pad(CONFIG.mes)}-01`;
  const hoje = parseISO(CONFIG.hoje);
  const inicioSemana = (() => {
    const d = new Date(hoje);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  })();

  const filtra = (a) => {
    if (filtro === "hoje") return a.dataChegou === CONFIG.hoje;
    if (filtro === "semana") return a.dataChegou >= inicioSemana;
    if (filtro === "pendentes") return !a.dataComprou;
    return a.dataChegou >= inicioMes;
  };
  const listaFiltrada = clientesLoja
    .filter(filtra)
    .sort(
      (a, b) =>
        b.dataChegou.localeCompare(a.dataChegou) || b.id - a.id
    );

  const totalMes = clientesLoja.filter((a) => a.dataChegou >= inicioMes).length;
  const compraramMes = clientesLoja.filter(
    (a) => a.dataChegou >= inicioMes && a.dataComprou
  ).length;
  const promoMes = clientesLoja.filter(
    (a) => a.dataChegou >= inicioMes && a.promocao
  ).length;
  const paraMeta = totalMes - promoMes;
  const metaAb = loja.metaAbordador || 0;
  const pctMeta =
    metaAb > 0 ? Math.min(100, (paraMeta / metaAb) * 100) : 0;
  const corMeta =
    pctMeta >= 100
      ? COLORS.success
      : pctMeta >= 60
      ? COLORS.warning
      : COLORS.error;
  const taxaMes = totalMes > 0 ? (compraramMes / totalMes) * 100 : 0;
  const taxaCor =
    taxaMes >= 50 ? COLORS.success : taxaMes >= 30 ? COLORS.warning : COLORS.error;
  const taxaBg =
    taxaMes >= 50 ? "#ECFDF3" : taxaMes >= 30 ? "#FFFBEB" : "#FEF2F2";

  const adicionar = async () => {
    if (!nome.trim()) return;
    setErro("");
    setSalvando(true);
    try {
      await addClienteAbord({
        lojaId: loja.id,
        nome: nome.trim(),
        dataChegou: CONFIG.hoje,
        promocao: promo,
      });
      setNome("");
      setPromo(false);
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível adicionar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const toggleComprou = async (c) => {
    try {
      await toggleClienteAbord(c.id, c.dataComprou ? null : CONFIG.hoje);
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível atualizar.");
    }
  };

  const togglePromo = async (c) => {
    try {
      await togglePromocaoAbord(c.id, !c.promocao);
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível atualizar.");
    }
  };

  const remover = async (id) => {
    if (!window.confirm("Remover este cliente da lista?")) return;
    try {
      await removeClienteAbord(id);
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível remover.");
    }
  };

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: cor,
          color: "#fff",
          padding: "10px 16px",
          fontWeight: 700,
          fontFamily: "Sora",
          fontSize: 14,
        }}
      >
        Abordador · {MES[CONFIG.mes - 1]}/{CONFIG.ano}
      </div>
      <div
        style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}
      >
        {/* Meta de clientes do mês */}
        {metaAb > 0 && (
          <div
            style={{
              background: "#fff",
              border: `1.5px solid ${corMeta}40`,
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 8 }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: COLORS.muted,
                    letterSpacing: 0.5,
                  }}
                >
                  META DE CLIENTES
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    fontFamily: "Sora",
                    color: COLORS.fg,
                    lineHeight: 1,
                    marginTop: 2,
                  }}
                >
                  {paraMeta}{" "}
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.muted,
                    }}
                  >
                    de {metaAb}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    fontFamily: "Sora",
                    color: corMeta,
                  }}
                >
                  {pctMeta.toFixed(0)}%
                </div>
                <div
                  style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}
                >
                  {pctMeta >= 100
                    ? "Bateu!"
                    : `Faltam ${Math.max(0, metaAb - paraMeta)}`}
                </div>
              </div>
            </div>
            <div
              style={{
                height: 6,
                background: COLORS.border,
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pctMeta}%`,
                  height: "100%",
                  background: corMeta,
                  transition: "width 0.3s",
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
              Clientes PROMOÇÃO não contam na meta.
            </div>
          </div>
        )}

        {/* Resumo do mês */}
        <div
          style={{
            background: taxaBg,
            borderRadius: 12,
            padding: "14px 16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 4,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              CLIENTES
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "Sora",
                color: COLORS.fg,
              }}
            >
              {totalMes}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              COMPR.
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "Sora",
                color: COLORS.fg,
              }}
            >
              {compraramMes}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              PROMO
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "Sora",
                color: COLORS.warning,
              }}
            >
              {promoMes}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.muted,
                letterSpacing: 0.5,
              }}
            >
              CONV.
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "Sora",
                color: taxaCor,
              }}
            >
              {taxaMes.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Adicionar cliente */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="flex gap-2">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do cliente que apareceu hoje"
              style={{ ...inp, flex: 1 }}
              onKeyDown={(e) => e.key === "Enter" && adicionar()}
              disabled={salvando}
            />
            <button
              onClick={adicionar}
              disabled={!nome.trim() || salvando}
              style={{
                padding: "0 14px",
                borderRadius: 10,
                border: "none",
                fontWeight: 800,
                fontSize: 14,
                cursor: nome.trim() && !salvando ? "pointer" : "default",
                background: nome.trim() && !salvando ? cor : "#CBD5E1",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Plus size={16} />
            </button>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: COLORS.fg,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={promo}
              onChange={(e) => setPromo(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                accentColor: COLORS.warning,
                cursor: "pointer",
              }}
            />
            <span style={{ fontWeight: 700 }}>Marcar como PROMOÇÃO</span>
            <span style={{ fontSize: 10.5, color: COLORS.muted }}>
              (não conta pra comissão)
            </span>
          </label>
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: COLORS.muted,
            lineHeight: 1.4,
            marginTop: -4,
          }}
        >
          Anota o nome quando o cliente aparece. Quando ele comprar, toque na
          bolinha pra marcar como comprado.
        </div>

        {erro && (
          <div
            style={{
              background: "#FEF2F2",
              color: COLORS.error,
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {erro}
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
          {[
            ["hoje", "Hoje"],
            ["semana", "Semana"],
            ["mes", "Mês"],
            ["pendentes", "Só pendentes"],
          ].map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => setFiltro(k)}
              style={{
                flex: "0 0 auto",
                padding: "6px 12px",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 11.5,
                cursor: "pointer",
                border: `1.5px solid ${filtro === k ? cor : COLORS.border}`,
                background: filtro === k ? cor : "#fff",
                color: filtro === k ? "#fff" : COLORS.fg,
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {listaFiltrada.length === 0 && (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: COLORS.muted,
                fontSize: 13,
              }}
            >
              {filtro === "pendentes"
                ? "Nenhum cliente pendente."
                : "Nenhum cliente neste período."}
            </div>
          )}
          {listaFiltrada.map((cli, i) => {
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
                    i < listaFiltrada.length - 1
                      ? `1px solid ${COLORS.border}`
                      : "none",
                  background: comprou ? "#F0FDF4" : "#fff",
                }}
              >
                <button
                  onClick={() => toggleComprou(cli)}
                  aria-label="marcar comprado"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 99,
                    cursor: "pointer",
                    flexShrink: 0,
                    border: `2px solid ${
                      comprou ? COLORS.success : COLORS.border
                    }`,
                    background: comprou ? COLORS.success : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {comprou && <Check size={14} color="#fff" strokeWidth={3} />}
                </button>
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
                        fontSize: 14,
                        fontWeight: 700,
                        color: comprou ? COLORS.muted : COLORS.fg,
                        textDecoration: comprou ? "line-through" : "none",
                      }}
                    >
                      {cli.nome}
                    </span>
                    {cli.promocao && (
                      <span
                        onClick={() => togglePromo(cli)}
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          color: "#fff",
                          background: COLORS.warning,
                          padding: "2px 6px",
                          borderRadius: 4,
                          letterSpacing: 0.4,
                          cursor: "pointer",
                        }}
                      >
                        PROMOÇÃO
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: COLORS.muted,
                      marginTop: 1,
                    }}
                  >
                    Apareceu {fmtCurto(cli.dataChegou)}
                    {comprou && (
                      <>
                        {" "}
                        ·{" "}
                        <span
                          style={{
                            color: COLORS.success,
                            fontWeight: 700,
                          }}
                        >
                          Comprou {fmtCurto(cli.dataComprou)}
                        </span>
                      </>
                    )}
                    {!cli.promocao && (
                      <>
                        {" "}
                        ·{" "}
                        <span
                          onClick={() => togglePromo(cli)}
                          style={{
                            color: COLORS.warning,
                            fontWeight: 700,
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          marcar promoção
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => remover(cli.id)}
                  aria-label="remover"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    cursor: "pointer",
                    flexShrink: 0,
                    border: "none",
                    background: "transparent",
                    color: COLORS.muted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
