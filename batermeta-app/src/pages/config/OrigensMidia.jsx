// Origens de Mídia — porte do protótipo (linhas 1667-1720).
//
// Lista origens ativas (com botão Arquivar) + lista arquivadas
// (com botão Reativar). Adicionar nova origem na parte de baixo.
// Arquivar NÃO apaga — preserva histórico nos relatórios.

import React, { useState } from "react";
import { Ban, Check, Megaphone } from "lucide-react";
import { Card } from "../../ui/components.jsx";
import { COLORS } from "../../lib/colors.js";
import { addOrigem, arquivarOrigem, reativarOrigem } from "../../lib/db.js";
import { btn, inp } from "../../ui/Field.jsx";

export default function OrigensMidia({ loja, origens, onSaved }) {
  const [novo, setNovo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const ori = origens.filter((o) => o.lojaId === loja.id);
  const ativos = ori.filter((o) => o.ativa !== false);
  const inativos = ori.filter((o) => o.ativa === false);

  const add = async () => {
    const n = novo.trim();
    if (!n) return;
    setErro("");
    setSalvando(true);
    try {
      await addOrigem(loja.id, n);
      setNovo("");
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível adicionar.");
    } finally {
      setSalvando(false);
    }
  };

  const arquivar = async (id) => {
    setErro("");
    try {
      await arquivarOrigem(id);
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível arquivar.");
    }
  };

  const reativar = async (id) => {
    setErro("");
    try {
      await reativarOrigem(id);
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível reativar.");
    }
  };

  return (
    <>
      <Card style={{ overflow: "hidden", marginBottom: 14 }}>
        <div
          style={{
            background: COLORS.teal,
            color: "#fff",
            padding: "10px 16px",
            fontWeight: 700,
            fontFamily: "Sora",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Megaphone size={16} /> Origens de Mídia
        </div>
        <div style={{ padding: 16 }}>
          <p
            style={{
              fontSize: 12,
              color: COLORS.muted,
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            Nomes de onde vêm os clientes — abordadores, influenciadoras,
            canais. Cada loja monta a sua lista.
          </p>
          {ativos.length === 0 && (
            <div
              style={{
                padding: 14,
                textAlign: "center",
                color: COLORS.muted,
                fontSize: 13,
              }}
            >
              Nenhuma origem cadastrada ainda.
            </div>
          )}
          {ativos.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between"
              style={{
                padding: "9px 10px",
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>{o.nome}</span>
              <button
                onClick={() => arquivar(o.id)}
                style={{
                  border: `1px solid ${COLORS.border}`,
                  background: "#fff",
                  borderRadius: 8,
                  padding: "5px 10px",
                  cursor: "pointer",
                  color: COLORS.muted,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Ban size={13} /> Arquivar
              </button>
            </div>
          ))}
          <div className="flex gap-2" style={{ marginTop: 12 }}>
            <input
              value={novo}
              onChange={(e) => setNovo(e.target.value)}
              placeholder="Novo nome (ex: Flávia)"
              style={inp}
              onKeyDown={(e) => e.key === "Enter" && add()}
              disabled={salvando}
            />
            <button
              onClick={add}
              disabled={salvando || !novo.trim()}
              style={{
                ...btn(COLORS.teal, {
                  padding: "0 16px",
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  opacity: salvando || !novo.trim() ? 0.6 : 1,
                  cursor: salvando || !novo.trim() ? "default" : "pointer",
                }),
              }}
            >
              Adicionar
            </button>
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
          <div
            style={{
              background: "#F0FDFA",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12,
              color: COLORS.teal,
              lineHeight: 1.5,
              marginTop: 12,
            }}
          >
            Arquivar <b>não apaga</b> nada. O nome só some da tela de lançar — todo o
            histórico dos meses anteriores continua nos relatórios. Se a pessoa
            voltar, é só reativar.
          </div>
        </div>
      </Card>

      {inativos.length > 0 && (
        <Card style={{ overflow: "hidden" }}>
          <div
            style={{
              background: "#F1F5F9",
              color: COLORS.muted,
              padding: "10px 16px",
              fontWeight: 700,
              fontFamily: "Sora",
              fontSize: 13,
            }}
          >
            Arquivados — histórico preservado
          </div>
          <div style={{ padding: 16 }}>
            {inativos.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between"
                style={{
                  padding: "9px 10px",
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.muted,
                  }}
                >
                  {o.nome}
                </span>
                <button
                  onClick={() => reativar(o.id)}
                  style={{
                    ...btn(COLORS.success, {
                      padding: "5px 12px",
                      fontSize: 12,
                    }),
                  }}
                >
                  <Check size={13} /> Reativar
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
