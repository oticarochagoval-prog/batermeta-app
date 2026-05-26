// Tela Lançar — orquestra os 5 modos de lançamento.
//
// Modos disponíveis (regra do briefing #6): a aba "Abordador" só
// aparece se a loja tem `metaAbordador > 0`. Caso contrário, MODOS
// fica com 4 botões (contratado, faturado, midia, orcamento).
//
// Aviso superior: explica a política de janela de edição. Master vê
// uma mensagem diferente (sem limite).

import React, { useState } from "react";
import { Calendar, Pencil } from "lucide-react";
import { CAT_COR, CAT_LABEL, COLORS } from "../lib/colors.js";
import { CONFIG } from "../lib/config.js";
import FormVenda from "./lancar/FormVenda.jsx";
import FormMidia from "./lancar/FormMidia.jsx";
import FormOrcamento from "./lancar/FormOrcamento.jsx";
import FormAbordador from "./lancar/FormAbordador.jsx";

export default function Lancar({
  loja,
  origens,
  lancamentos,
  midias,
  orcamentos,
  abordadores,
  viaMaster,
  onSaved,
  onIrConfig,
}) {
  const [modo, setModo] = useState("contratado");

  const MODOS = [
    "contratado",
    "faturado",
    "midia",
    "orcamento",
    ...(loja.metaAbordador > 0 ? ["abordador"] : []),
  ];

  return (
    <div style={{ padding: 16 }}>
      {/* Seletor de modo (horizontal scroll) */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: 14,
        }}
      >
        {MODOS.map((k) => (
          <button
            key={k}
            onClick={() => setModo(k)}
            style={{
              flex: "0 0 auto",
              padding: "9px 16px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              border: `1.5px solid ${CAT_COR[k]}`,
              background: modo === k ? CAT_COR[k] : "#fff",
              color: modo === k ? "#fff" : CAT_COR[k],
            }}
          >
            {CAT_LABEL[k]}
          </button>
        ))}
      </div>

      {/* Aviso da política de edição */}
      <div
        style={{
          background: viaMaster ? "#EEF2FF" : "#F0FDFA",
          borderRadius: 10,
          padding: "9px 12px",
          fontSize: 11.5,
          color: viaMaster ? COLORS.primary : COLORS.teal,
          lineHeight: 1.5,
          marginBottom: 14,
          display: "flex",
          alignItems: "flex-start",
          gap: 6,
        }}
      >
        {viaMaster ? (
          <Pencil size={13} style={{ marginTop: 1, flexShrink: 0 }} />
        ) : (
          <Calendar size={13} style={{ marginTop: 1, flexShrink: 0 }} />
        )}
        <span>
          {viaMaster ? (
            <>
              Acesso <b>master</b>: edita qualquer dia de qualquer mês, sem
              trava. Toda alteração fica registrada.
            </>
          ) : (
            <>
              Mês atual é livre. Mês recém-fechado pode ser ajustado até{" "}
              <b>{CONFIG.janelaEdicaoDias} dias</b> após a virada (configurável
              pelo master). Depois, só o master corrige.
            </>
          )}
        </span>
      </div>

      {/* Formulário ativo */}
      {(modo === "contratado" || modo === "faturado") && (
        <FormVenda
          loja={loja}
          modo={modo}
          lancamentos={lancamentos}
          permitirFuturo={viaMaster}
          viaMaster={viaMaster}
          onSaved={onSaved}
        />
      )}
      {modo === "midia" && (
        <FormMidia
          loja={loja}
          origens={origens}
          midias={midias}
          lancamentos={lancamentos}
          permitirFuturo={viaMaster}
          viaMaster={viaMaster}
          onSaved={onSaved}
          onIrConfig={onIrConfig}
        />
      )}
      {modo === "orcamento" && (
        <FormOrcamento
          loja={loja}
          orcamentos={orcamentos}
          onSaved={onSaved}
        />
      )}
      {modo === "abordador" && loja.metaAbordador > 0 && (
        <FormAbordador
          loja={loja}
          abordadores={abordadores}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
