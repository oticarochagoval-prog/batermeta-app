// CalendarModal + DateField — porte do protótipo (linhas 360-428).
//
// Calendário modal: domingos e dias futuros são bloqueados.
// Funcionalidade master de "editar qualquer mês" usa este calendário
// com a flag `permitirFuturo`/`permitirDomingo` se necessário (Etapa 3).

import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS } from "../lib/colors.js";
import { DOW, DOW3, MES, pad, parseISO } from "../lib/format.js";
import { CONFIG } from "../lib/config.js";
import { Field, inp } from "./Field.jsx";

export function CalendarModal({ valueISO, onPick, onClose, permitirFuturo = false }) {
  const base = parseISO(valueISO || CONFIG.hoje);
  const [ano, setAno] = useState(base.getFullYear());
  const [mes, setMes] = useState(base.getMonth()); // 0-11
  const hojeISO = CONFIG.hoje;
  const primeiro = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < primeiro; i++) cells.push(null);
  for (let d = 1; d <= diasNoMes; d++) cells.push(d);

  const navMes = (delta) => {
    let m = mes + delta,
      a = ano;
    if (m < 0) {
      m = 11;
      a--;
    }
    if (m > 11) {
      m = 0;
      a++;
    }
    setMes(m);
    setAno(a);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          width: "100%",
          maxWidth: 360,
          padding: 18,
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <button
            onClick={() => navMes(-1)}
            style={{
              border: "none",
              background: "#F1F5F9",
              borderRadius: 8,
              padding: 6,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 800, fontFamily: "Sora", color: COLORS.teal }}>
            {MES[mes]} {ano}
          </span>
          <button
            onClick={() => navMes(1)}
            style={{
              border: "none",
              background: "#F1F5F9",
              borderRadius: 8,
              padding: 6,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            gap: 4,
            marginBottom: 6,
          }}
        >
          {DOW3.map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.muted,
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {cells.map((d, idx) => {
            if (!d) return <div key={idx} />;
            const iso = `${ano}-${pad(mes + 1)}-${pad(d)}`;
            const futuro = !permitirFuturo && parseISO(iso) > parseISO(hojeISO);
            const domingo = parseISO(iso).getDay() === 0;
            const sel = iso === valueISO;
            const bloq = futuro || domingo;
            return (
              <button
                key={idx}
                disabled={bloq}
                onClick={() => {
                  onPick(iso);
                  onClose();
                }}
                style={{
                  aspectRatio: "1",
                  border: "none",
                  borderRadius: 10,
                  cursor: bloq ? "default" : "pointer",
                  fontSize: 13,
                  fontWeight: sel ? 800 : 600,
                  fontFamily: "Sora",
                  background: sel ? COLORS.teal : bloq ? "#F8FAFC" : "#F1F5F9",
                  color: sel ? "#fff" : bloq ? "#CBD5E1" : COLORS.fg,
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
        <p
          style={{
            fontSize: 11,
            color: COLORS.muted,
            textAlign: "center",
            marginTop: 12,
          }}
        >
          Sábado disponível · domingos {permitirFuturo ? "bloqueados" : "e dias futuros bloqueados"}
        </p>
      </div>
    </div>
  );
}

export function DateField({ label, valueISO, onChange, permitirFuturo = false }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Field label={label}>
        <button
          onClick={() => setOpen(true)}
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
            {(() => {
              const dt = parseISO(valueISO);
              return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)} — ${DOW[dt.getDay()]}`;
            })()}
          </span>
          <Calendar size={16} color={COLORS.teal} />
        </button>
      </Field>
      {open && (
        <CalendarModal
          valueISO={valueISO}
          onPick={onChange}
          onClose={() => setOpen(false)}
          permitirFuturo={permitirFuturo}
        />
      )}
    </>
  );
}
