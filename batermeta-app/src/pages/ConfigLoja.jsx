// Config da Loja — porte do protótipo (linhas 1507-1521).
//
// Adicionei uma sub-aba "Senha" extra (não estava no protótipo) — útil
// pro gerente trocar a própria senha sem precisar pedir pro master.

import React, { useState } from "react";
import { COLORS } from "../lib/colors.js";
import ConfigurarMetas from "./config/ConfigurarMetas.jsx";
import OrigensMidia from "./config/OrigensMidia.jsx";
import TrocarSenha from "./config/TrocarSenha.jsx";

export default function ConfigLoja({ loja, origens, onSaved }) {
  const [aba, setAba] = useState("metas");
  const abas = [
    ["metas", "Metas"],
    ["midia", "Origens"],
    ["senha", "Senha"],
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="flex gap-2" style={{ marginBottom: 14 }}>
        {abas.map(([k, lbl]) => (
          <button
            key={k}
            onClick={() => setAba(k)}
            style={{
              flex: 1,
              padding: "9px 4px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
              border: `1.5px solid ${COLORS.primary}`,
              background: aba === k ? COLORS.primary : "#fff",
              color: aba === k ? "#fff" : COLORS.primary,
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
      {aba === "metas" && <ConfigurarMetas loja={loja} onSaved={onSaved} />}
      {aba === "midia" && (
        <OrigensMidia loja={loja} origens={origens} onSaved={onSaved} />
      )}
      {aba === "senha" && <TrocarSenha loja={loja} onSaved={onSaved} />}
    </div>
  );
}
