// WhatsModal — porte do protótipo (linhas 1902-1981).
//
// Modal pra montar o relatório de um período (diário=calendário,
// semanal=S1-S4) e copiar/abrir no WhatsApp.

import React, { useState } from "react";
import { Calendar, Check, FileText, Send, X } from "lucide-react";
import { COLORS } from "../lib/colors.js";
import { CONFIG } from "../lib/config.js";
import { DOW, fmtCurto, parseISO } from "../lib/format.js";
import { montaMsg } from "../lib/whats.js";
import { CalendarModal } from "./Calendar.jsx";
import { inp, btn } from "./Field.jsx";

export default function WhatsModal({
  loja,
  lancamentos,
  midias,
  orcamentos,
  onClose,
}) {
  const diario = loja.tipoPeriodo === "diario";
  const periodoHoje = diario ? CONFIG.hoje : `S${CONFIG.semanaAtual}`;
  const [alvo, setAlvo] = useState(periodoHoje);
  const [showCal, setShowCal] = useState(false);
  const msg = montaMsg(loja, lancamentos, midias, orcamentos, alvo);
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(msg);
      } else {
        const ta = document.createElement("textarea");
        ta.value = msg;
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

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "18px 18px 0 0",
          width: "100%",
          maxWidth: 440,
          padding: 18,
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 12 }}
        >
          <span style={{ fontWeight: 800, fontFamily: "Sora" }}>
            Relatório — WhatsApp
          </span>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#F1F5F9",
              borderRadius: 8,
              padding: 5,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {diario ? (
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.muted,
                marginBottom: 4,
              }}
            >
              RELATÓRIO DE QUAL DIA?
            </div>
            <button
              onClick={() => setShowCal(true)}
              style={{
                ...inp,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>
                {fmtCurto(alvo)} — {DOW[parseISO(alvo).getDay()]}
                {alvo === CONFIG.hoje ? " (hoje)" : ""}
              </span>
              <Calendar size={16} color={COLORS.teal} />
            </button>
            <div
              style={{
                fontSize: 11,
                color: COLORS.muted,
                marginTop: 5,
              }}
            >
              Esqueceu de mandar um dia? Escolha a data e o relatório se monta
              com os números daquele dia.
            </div>
            {showCal && (
              <CalendarModal
                valueISO={alvo}
                onPick={setAlvo}
                onClose={() => setShowCal(false)}
              />
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.muted,
                marginBottom: 4,
              }}
            >
              RELATÓRIO DE QUAL SEMANA?
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setAlvo(`S${s}`)}
                  disabled={s > CONFIG.semanaAtual}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 9,
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "Sora",
                    cursor: s > CONFIG.semanaAtual ? "default" : "pointer",
                    border: `1.5px solid ${
                      alvo === `S${s}` ? COLORS.teal : COLORS.border
                    }`,
                    background:
                      alvo === `S${s}`
                        ? COLORS.teal
                        : s > CONFIG.semanaAtual
                        ? "#F8FAFC"
                        : "#fff",
                    color:
                      alvo === `S${s}`
                        ? "#fff"
                        : s > CONFIG.semanaAtual
                        ? "#CBD5E1"
                        : COLORS.fg,
                  }}
                >
                  S{s}
                </button>
              ))}
            </div>
          </div>
        )}

        <pre
          style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: 14,
            fontSize: 12.5,
            whiteSpace: "pre-wrap",
            fontFamily: "Manrope",
            color: COLORS.fg,
            lineHeight: 1.5,
          }}
        >
          {msg}
        </pre>

        <button
          onClick={copiar}
          style={{
            ...btn(copiado ? COLORS.success : COLORS.primary, {
              width: "100%",
              marginTop: 12,
            }),
          }}
        >
          {copiado ? (
            <>
              <Check size={16} /> Copiado! Cole no grupo do WhatsApp
            </>
          ) : (
            <>
              <FileText size={16} /> Copiar relatório
            </>
          )}
        </button>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: 8,
            width: "100%",
            padding: "11px",
            borderRadius: 10,
            border: `1.5px solid ${COLORS.border}`,
            background: "#fff",
            color: COLORS.muted,
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Send size={15} /> Abrir WhatsApp direto
        </a>

        <p
          style={{
            fontSize: 11,
            color: COLORS.muted,
            textAlign: "center",
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          Recomendado: toque em <b>Copiar relatório</b> e cole no grupo. É o
          jeito que sempre funciona, sem o aviso do navegador.
        </p>
      </div>
    </div>
  );
}
