// Cfg Janela — porte do protótipo (linhas 2124-2165).
//
// Quantos dias após a virada do mês o gerente ainda pode editar.
// Salva em master_config.janela_edicao_dias.

import React, { useState } from "react";
import { Check, Pencil } from "lucide-react";
import { Card } from "../../ui/components.jsx";
import { COLORS } from "../../lib/colors.js";
import { CONFIG } from "../../lib/config.js";
import { salvarMasterConfig } from "../../lib/db.js";
import { btn } from "../../ui/Field.jsx";

export default function CfgJanela() {
  const [dias, setDias] = useState(CONFIG.janelaEdicaoDias);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const opcoes = [3, 5, 10, 30];

  const salvar = async () => {
    setErro("");
    setSalvando(true);
    try {
      await salvarMasterConfig("janela_edicao_dias", String(dias));
      CONFIG.janelaEdicaoDias = dias; // atualiza em memória
      setOk(true);
      setTimeout(() => setOk(false), 1800);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <Card style={{ overflow: "hidden", marginBottom: 14 }}>
        <div
          style={{
            background: COLORS.primary,
            color: "#fff",
            padding: "10px 16px",
            fontWeight: 700,
            fontFamily: "Sora",
            fontSize: 14,
          }}
        >
          Janela de edição após virar o mês
        </div>
        <div style={{ padding: 16 }}>
          <p
            style={{
              fontSize: 12,
              color: COLORS.muted,
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            Quantos dias o <b>gerente</b> ainda pode corrigir o mês que acabou,
            depois da virada. Resolve o caso de "esqueci de lançar o último
            dia". Passado esse prazo, só o master corrige.
          </p>
          <div className="flex gap-2">
            {opcoes.map((o) => (
              <button
                key={o}
                onClick={() => setDias(o)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 10,
                  fontWeight: 800,
                  fontFamily: "Sora",
                  fontSize: 15,
                  cursor: "pointer",
                  border: `1.5px solid ${
                    dias === o ? COLORS.primary : COLORS.border
                  }`,
                  background: dias === o ? COLORS.primary : "#fff",
                  color: dias === o ? "#fff" : COLORS.fg,
                }}
              >
                {o}
              </button>
            ))}
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 11,
              color: COLORS.muted,
              marginTop: 8,
            }}
          >
            dias após o fim do mês
          </div>
          {erro && (
            <div
              style={{
                background: "#FEF2F2",
                color: COLORS.error,
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                marginTop: 10,
              }}
            >
              {erro}
            </div>
          )}
          <button
            onClick={salvar}
            disabled={salvando}
            style={{
              ...btn(ok ? COLORS.success : COLORS.primary, {
                width: "100%",
                marginTop: 14,
                opacity: salvando ? 0.6 : 1,
                cursor: salvando ? "default" : "pointer",
              }),
            }}
          >
            {salvando ? (
              "Salvando…"
            ) : ok ? (
              <>
                <Check size={16} /> Salvo!
              </>
            ) : (
              "Salvar janela de edição"
            )}
          </button>
        </div>
      </Card>
      <Card style={{ padding: 16 }}>
        <div
          className="flex items-center gap-2"
          style={{ marginBottom: 6 }}
        >
          <Pencil size={15} color={COLORS.primary} />
          <span style={{ fontWeight: 700, fontSize: 13 }}>
            Master sem trava
          </span>
        </div>
        <p style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>
          A sua senha (master) edita qualquer dia de qualquer mês, sempre —
          inclusive meses já fechados. Tudo o que o master altera fica
          registrado, igual ao que a loja altera. A janela acima vale só para o
          gerente.
        </p>
      </Card>
    </>
  );
}
