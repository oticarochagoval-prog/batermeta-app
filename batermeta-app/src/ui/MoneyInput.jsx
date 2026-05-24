// MoneyInput — porte fiel do protótipo (linhas 322-348).
//
// Comportamento: dígitos entram pela direita, sempre exibe com vírgula
// e 2 casas decimais. value = número (em reais).

import React from "react";
import { COLORS } from "../lib/colors.js";
import { inp } from "./Field.jsx";

export default function MoneyInput({ value, onChange, style }) {
  const centavos = Math.round((value || 0) * 100);
  const display = (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const onKey = (e) => {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      onChange((centavos * 10 + Number(e.key)) / 100);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      onChange(Math.floor(centavos / 10) / 100);
    }
  };
  return (
    <div style={{ position: "relative" }}>
      <span
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 14,
          color: COLORS.muted,
          pointerEvents: "none",
        }}
      >
        R$
      </span>
      <input
        value={display}
        onKeyDown={onKey}
        onChange={() => {}}
        inputMode="numeric"
        style={{
          ...inp,
          paddingLeft: 36,
          textAlign: "right",
          fontFamily: "Sora",
          fontWeight: 700,
          ...style,
        }}
      />
    </div>
  );
}
