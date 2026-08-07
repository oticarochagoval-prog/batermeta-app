// Field e estilo `inp` — extraídos do protótipo (linhas 310-316).
// Componentes compartilhados pelos formulários de Lançar.

import React from "react";
import { COLORS } from "../lib/colors.js";

export const inp = {
  width: "100%",
  padding: "10px 12px",
  border: `1.5px solid ${COLORS.border}`,
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
  background: "#fff",
  fontFamily: "Manrope",
};

export const btn = (cor, extra = {}) => ({
  background: cor,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  ...extra,
});

export function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: COLORS.muted,
          display: "block",
          marginBottom: 4,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
