// PeriodoSeletor — todas as lojas são diárias (calendário).
//
// A lógica de semanas (S1-S4) foi removida no fix6.1: agora toda loja
// lança por DATA. Este componente é só um wrapper do DateField, mantido
// pra não mexer nos pontos que já importam PeriodoSeletor.

import React from "react";
import { DateField } from "./Calendar.jsx";

export default function PeriodoSeletor({ value, onChange, permitirFuturo = false }) {
  return (
    <DateField
      label="Data"
      valueISO={value}
      onChange={onChange}
      permitirFuturo={permitirFuturo}
    />
  );
}
