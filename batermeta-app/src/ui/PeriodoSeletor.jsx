// PeriodoSeletor — porte do protótipo (linhas 632-651).
//
// Lojas com tipoPeriodo="diario" → DateField (calendário).
// Lojas com tipoPeriodo="semanal" (Rocha 9, Rocha 11) → botões S1-S4.

import React from "react";
import { COLORS } from "../lib/colors.js";
import { CONFIG, SEMANAS } from "../lib/config.js";
import { Field } from "./Field.jsx";
import { DateField } from "./Calendar.jsx";

export default function PeriodoSeletor({ loja, value, onChange, permitirFuturo = false }) {
  if (loja.tipoPeriodo === "diario") {
    return (
      <DateField
        label="Data"
        valueISO={value}
        onChange={onChange}
        permitirFuturo={permitirFuturo}
      />
    );
  }
  return (
    <Field label="Semana">
      <div className="flex gap-2">
        {SEMANAS.map((s) => (
          <button
            key={s}
            onClick={() => onChange(`S${s}`)}
            disabled={s > CONFIG.semanaAtual && !permitirFuturo}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "Sora",
              cursor:
                s > CONFIG.semanaAtual && !permitirFuturo ? "default" : "pointer",
              border: `1.5px solid ${value === `S${s}` ? COLORS.teal : COLORS.border}`,
              background:
                value === `S${s}`
                  ? COLORS.teal
                  : s > CONFIG.semanaAtual && !permitirFuturo
                  ? "#F8FAFC"
                  : "#fff",
              color:
                value === `S${s}`
                  ? "#fff"
                  : s > CONFIG.semanaAtual && !permitirFuturo
                  ? "#CBD5E1"
                  : COLORS.fg,
            }}
          >
            S{s}
          </button>
        ))}
      </div>
    </Field>
  );
}
