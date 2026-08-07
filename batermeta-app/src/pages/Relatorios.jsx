// Relatórios da Loja — porte do protótipo (linhas 1215-1504).
//
// 4 sub-abas: Vendas, Orçamentos, Mídia e Abordador.
// Abordador só aparece se metaAbordador > 0.

import React, { useState } from "react";
import {
  ClipboardList,
  FileText,
  Megaphone,
  Store,
} from "lucide-react";
import { Card } from "../ui/components.jsx";
import { COLORS } from "../lib/colors.js";
import { CONFIG } from "../lib/config.js";
import { MES } from "../lib/format.js";
import { calcMeta, calcMidia, calcOrc, calcAbord } from "../lib/calc.js";
import RelVendas from "./relatorios/RelVendas.jsx";
import RelOrcamentos from "./relatorios/RelOrcamentos.jsx";
import RelMidia from "./relatorios/RelMidia.jsx";
import RelAbordador from "./relatorios/RelAbordador.jsx";

export default function Relatorios({
  loja,
  lancamentos,
  midias,
  orcamentos,
  origens,
  abordadores = [],
}) {
  const [sub, setSub] = useState("vendas");

  const c = calcMeta(loja, "contratado", lancamentos);
  const f = calcMeta(loja, "faturado", lancamentos);
  const midia = calcMidia(loja, midias, origens);
  const orc = calcOrc(loja, orcamentos);
  const ab = calcAbord(loja, abordadores);

  const subs = [
    ["vendas", "Vendas", FileText],
    ["orcamentos", "Orçamentos", ClipboardList],
    ["midia", "Mídia", Megaphone],
    ...(loja.metaAbordador > 0 ? [["abordador", "Abordador", Store]] : []),
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 10 }}>
        Período:{" "}
        <b style={{ color: COLORS.fg }}>
          {MES[CONFIG.mes - 1]}/{CONFIG.ano}
        </b>
      </div>

      <div className="flex gap-2" style={{ marginBottom: 14 }}>
        {subs.map(([k, lbl, Ico]) => (
          <button
            key={k}
            onClick={() => setSub(k)}
            style={{
              flex: 1,
              padding: "8px 4px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              border: `1.5px solid ${COLORS.teal}`,
              background: sub === k ? COLORS.teal : "#fff",
              color: sub === k ? "#fff" : COLORS.teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <Ico size={14} /> {lbl}
          </button>
        ))}
      </div>

      {sub === "vendas" && <RelVendas c={c} f={f} />}
      {sub === "orcamentos" && <RelOrcamentos orc={orc} />}
      {sub === "midia" && <RelMidia midia={midia} />}
      {sub === "abordador" && loja.metaAbordador > 0 && (
        <RelAbordador ab={ab} />
      )}
    </div>
  );
}
