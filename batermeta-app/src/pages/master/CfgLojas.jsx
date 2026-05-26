// Cfg Lojas — porte do protótipo (linhas 2026-2122).
//
// CRUD completo das lojas: renomear, redefinir senha, ativar/desativar,
// editar meta_abordador inline, criar loja nova.

import React, { useState } from "react";
import { Ban, Check, Pencil, Plus, Settings } from "lucide-react";
import { Card } from "../../ui/components.jsx";
import { COLORS } from "../../lib/colors.js";
import {
  addLoja,
  redefinirSenhaLoja,
  renomearLoja,
  salvarMetaAbordador,
  toggleLojaAtiva,
} from "../../lib/db.js";
import { btn, inp } from "../../ui/Field.jsx";

const iconBtn = {
  border: `1px solid ${COLORS.border}`,
  background: "#fff",
  borderRadius: 8,
  padding: 7,
  cursor: "pointer",
  color: COLORS.muted,
  display: "flex",
};

export default function CfgLojas({ lojasState, recarregarLojas }) {
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [resetId, setResetId] = useState(null);
  const [resetVal, setResetVal] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [novo, setNovo] = useState({
    nome: "",
    login: "",
    senha: "",
    tipoPeriodo: "diario",
  });
  const [aviso, setAviso] = useState("");
  const [salvando, setSalvando] = useState(false);

  const salvarNome = async (id) => {
    if (!editNome.trim()) {
      setEditId(null);
      return;
    }
    setSalvando(true);
    try {
      await renomearLoja(id, editNome.trim());
      setAviso(`Renomeada.`);
      recarregarLojas && (await recarregarLojas());
    } catch (e) {
      console.error(e);
      setAviso("Não foi possível renomear.");
    } finally {
      setSalvando(false);
      setEditId(null);
    }
  };

  const salvarReset = async (id) => {
    if (!resetVal.trim()) {
      setResetId(null);
      return;
    }
    setSalvando(true);
    try {
      await redefinirSenhaLoja(id, resetVal.trim());
      setAviso(`Senha redefinida.`);
      recarregarLojas && (await recarregarLojas());
    } catch (e) {
      console.error(e);
      setAviso("Não foi possível redefinir a senha.");
    } finally {
      setSalvando(false);
      setResetId(null);
      setResetVal("");
    }
  };

  const toggleAtiva = async (id) => {
    setSalvando(true);
    try {
      await toggleLojaAtiva(id);
      recarregarLojas && (await recarregarLojas());
    } catch (e) {
      console.error(e);
      setAviso("Não foi possível atualizar o status.");
    } finally {
      setSalvando(false);
    }
  };

  const salvarMetaAb = async (id, v) => {
    try {
      await salvarMetaAbordador(id, v);
      recarregarLojas && (await recarregarLojas());
    } catch (e) {
      console.error(e);
    }
  };

  const criar = async () => {
    const { nome, login, senha } = novo;
    if (!nome.trim() || !login.trim() || !senha.trim()) {
      setAviso("Preencha nome, login e senha.");
      return;
    }
    if (
      lojasState.some((l) => l.login === login.toLowerCase().trim())
    ) {
      setAviso("Já existe uma loja com esse login.");
      return;
    }
    setSalvando(true);
    try {
      await addLoja(novo);
      setNovo({ nome: "", login: "", senha: "", tipoPeriodo: "diario" });
      setShowAdd(false);
      setAviso(`"${nome.trim()}" criada.`);
      recarregarLojas && (await recarregarLojas());
    } catch (e) {
      console.error(e);
      setAviso("Não foi possível criar a loja.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Card style={{ overflow: "hidden", marginBottom: 14 }}>
      <div
        style={{
          background: COLORS.primary,
          color: "#fff",
          padding: "10px 16px",
          fontWeight: 700,
          fontFamily: "Sora",
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>Lojas / Unidades ({lojasState.length})</span>
        <button
          onClick={() => {
            setShowAdd((s) => !s);
            setAviso("");
          }}
          style={{
            background: "rgba(255,255,255,.2)",
            border: "none",
            color: "#fff",
            borderRadius: 8,
            padding: "5px 10px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Plus size={14} /> Nova
        </button>
      </div>
      <div style={{ padding: 12 }}>
        {aviso && (
          <div
            style={{
              background: "#EEF2FF",
              color: COLORS.primary,
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 12px",
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            {aviso}
          </div>
        )}

        {showAdd && (
          <div
            style={{
              border: `1.5px dashed ${COLORS.primary}`,
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: COLORS.primary,
              }}
            >
              Nova loja / unidade
            </div>
            <input
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
              placeholder="Nome (ex: Rocha 12, GV Lentes)"
              style={inp}
            />
            <input
              value={novo.login}
              onChange={(e) => setNovo({ ...novo, login: e.target.value })}
              placeholder="Login (ex: rocha12)"
              autoCapitalize="none"
              style={inp}
            />
            <input
              value={novo.senha}
              onChange={(e) => setNovo({ ...novo, senha: e.target.value })}
              placeholder="Senha inicial"
              style={inp}
            />
            <div className="flex gap-2">
              {[
                ["diario", "Diário"],
                ["semanal", "Semanal"],
              ].map(([k, lbl]) => (
                <button
                  key={k}
                  onClick={() => setNovo({ ...novo, tipoPeriodo: k })}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                    border: `1.5px solid ${COLORS.primary}`,
                    background:
                      novo.tipoPeriodo === k ? COLORS.primary : "#fff",
                    color: novo.tipoPeriodo === k ? "#fff" : COLORS.primary,
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.4 }}>
              Você define a senha inicial e repassa pro gerente. A loja nasce
              sem metas — configure depois pelo app da loja.
            </div>
            <div className="flex gap-2">
              <button
                onClick={criar}
                disabled={salvando}
                style={{
                  ...btn(COLORS.primary, {
                    flex: 2,
                    opacity: salvando ? 0.6 : 1,
                  }),
                }}
              >
                Criar loja
              </button>
              <button
                onClick={() => setShowAdd(false)}
                style={{
                  flex: 1,
                  border: `1.5px solid ${COLORS.border}`,
                  background: "#fff",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  color: COLORS.muted,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {lojasState.map((l) => (
          <div
            key={l.id}
            style={{
              borderBottom: `1px solid ${COLORS.border}`,
              padding: "10px 6px",
            }}
          >
            {editId === l.id ? (
              <div className="flex gap-2">
                <input
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  style={inp}
                  autoFocus
                />
                <button
                  onClick={() => salvarNome(l.id)}
                  disabled={salvando}
                  style={{
                    ...btn(COLORS.success, {
                      padding: "0 14px",
                      fontSize: 13,
                    }),
                  }}
                >
                  OK
                </button>
              </div>
            ) : resetId === l.id ? (
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: COLORS.muted,
                    marginBottom: 6,
                  }}
                >
                  Nova senha de <b>{l.nome}</b>
                </div>
                <div className="flex gap-2">
                  <input
                    value={resetVal}
                    onChange={(e) => setResetVal(e.target.value)}
                    placeholder="digite a nova senha"
                    style={inp}
                    autoFocus
                  />
                  <button
                    onClick={() => salvarReset(l.id)}
                    disabled={salvando}
                    style={{
                      ...btn(COLORS.success, {
                        padding: "0 14px",
                        fontSize: 13,
                      }),
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color:
                          l.ativa === false ? COLORS.muted : COLORS.fg,
                      }}
                    >
                      {l.nome}{" "}
                      {l.ativa === false && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: COLORS.error,
                            background: "#FEF2F2",
                            borderRadius: 5,
                            padding: "2px 5px",
                          }}
                        >
                          INATIVA
                        </span>
                      )}
                    </div>
                    <div
                      style={{ fontSize: 11, color: COLORS.muted }}
                    >
                      login: {l.login} · {l.tipoPeriodo}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      title="Renomear"
                      onClick={() => {
                        setEditId(l.id);
                        setEditNome(l.nome);
                      }}
                      style={iconBtn}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      title="Redefinir senha"
                      onClick={() => {
                        setResetId(l.id);
                        setResetVal("");
                      }}
                      style={iconBtn}
                    >
                      <Settings size={14} />
                    </button>
                    <button
                      title={l.ativa === false ? "Ativar" : "Desativar"}
                      onClick={() => toggleAtiva(l.id)}
                      disabled={salvando}
                      style={iconBtn}
                    >
                      {l.ativa === false ? (
                        <Check size={14} color={COLORS.success} />
                      ) : (
                        <Ban size={14} color={COLORS.error} />
                      )}
                    </button>
                  </div>
                </div>
                <div
                  className="flex items-center gap-2"
                  style={{
                    marginTop: 8,
                    padding: "6px 8px",
                    background: "#F8FAFC",
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: COLORS.muted,
                      letterSpacing: 0.3,
                    }}
                  >
                    ABORDADOR
                  </span>
                  <input
                    type="number"
                    min="0"
                    defaultValue={l.metaAbordador || 0}
                    onBlur={(e) => salvarMetaAb(l.id, e.target.value)}
                    style={{
                      width: 70,
                      padding: "4px 8px",
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: "Sora",
                      fontWeight: 700,
                      textAlign: "center",
                      background: "#fff",
                    }}
                  />
                  <span style={{ fontSize: 10.5, color: COLORS.muted }}>
                    cli/mês
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 9.5,
                      fontWeight: 800,
                      color:
                        l.metaAbordador > 0
                          ? COLORS.success
                          : COLORS.muted,
                      background:
                        l.metaAbordador > 0 ? "#ECFDF3" : "#F1F5F9",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {l.metaAbordador > 0 ? "ATIVO" : "DESLIGADO"}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
