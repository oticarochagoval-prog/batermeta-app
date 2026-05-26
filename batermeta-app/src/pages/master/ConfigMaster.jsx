// Config Master — porte do protótipo (linhas 2006-2024).
//
// 3 sub-abas: Lojas (CRUD), Janela (edição) e Conta (senha master + nome rede).

import React, { useState } from "react";
import { COLORS } from "../../lib/colors.js";
import CfgLojas from "./CfgLojas.jsx";
import CfgJanela from "./CfgJanela.jsx";
import CfgConta from "./CfgConta.jsx";

export default function ConfigMaster({ lojasState, recarregarLojas }) {
  const [secao, setSecao] = useState("lojas");
  const secoes = [
    ["lojas", "Lojas"],
    ["janela", "Janela"],
    ["conta", "Conta"],
  ];
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {secoes.map(([k, lbl]) => (
          <button
            key={k}
            onClick={() => setSecao(k)}
            style={{
              flex: 1,
              padding: "9px 4px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
              border: `1.5px solid ${COLORS.primary}`,
              background: secao === k ? COLORS.primary : "#fff",
              color: secao === k ? "#fff" : COLORS.primary,
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
      {secao === "lojas" && (
        <CfgLojas
          lojasState={lojasState}
          recarregarLojas={recarregarLojas}
        />
      )}
      {secao === "janela" && <CfgJanela />}
      {secao === "conta" && <CfgConta />}
    </div>
  );
}
