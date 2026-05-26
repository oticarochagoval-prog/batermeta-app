// Trocar senha — funcionalidade extra (não estava no protótipo).
//
// Permite o gerente trocar a senha da própria loja após confirmar a
// senha atual. Não revela a senha anterior em nenhum momento.

import React, { useState } from "react";
import { AlertTriangle, Check, Lock } from "lucide-react";
import { Card } from "../../ui/components.jsx";
import { COLORS } from "../../lib/colors.js";
import { trocarSenhaLoja } from "../../lib/db.js";
import { Field, btn, inp } from "../../ui/Field.jsx";

export default function TrocarSenha({ loja, onSaved }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState("");

  const trocar = async () => {
    if (!senhaAtual || !s1 || !s2) {
      setOk("preencha");
      setTimeout(() => setOk(""), 2200);
      return;
    }
    if (s1 !== s2) {
      setOk("naoconfere");
      setTimeout(() => setOk(""), 2200);
      return;
    }
    if (s1.length < 4) {
      setOk("curta");
      setTimeout(() => setOk(""), 2200);
      return;
    }
    setSalvando(true);
    try {
      await trocarSenhaLoja(loja.id, senhaAtual, s1);
      setSenhaAtual("");
      setS1("");
      setS2("");
      setOk("ok");
      setTimeout(() => setOk(""), 2200);
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      if (/incorret/i.test(e.message || "")) {
        setOk("senhaerrada");
      } else {
        setOk("erro");
      }
      setTimeout(() => setOk(""), 2400);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Card style={{ overflow: "hidden" }}>
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
          gap: 8,
        }}
      >
        <Lock size={15} /> Alterar senha da loja
      </div>
      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Field label="Senha atual">
          <input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            style={inp}
            placeholder="senha que você usa hoje"
            disabled={salvando}
          />
        </Field>
        <Field label="Nova senha">
          <input
            type="password"
            value={s1}
            onChange={(e) => setS1(e.target.value)}
            style={inp}
            placeholder="mínimo 4 caracteres"
            disabled={salvando}
          />
        </Field>
        <Field label="Confirmar nova senha">
          <input
            type="password"
            value={s2}
            onChange={(e) => setS2(e.target.value)}
            style={inp}
            placeholder="digite a nova de novo"
            disabled={salvando}
          />
        </Field>

        {ok === "preencha" && (
          <div
            style={{
              fontSize: 12,
              color: COLORS.error,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <AlertTriangle size={14} /> Preencha os 3 campos.
          </div>
        )}
        {ok === "naoconfere" && (
          <div
            style={{
              fontSize: 12,
              color: COLORS.error,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <AlertTriangle size={14} /> As senhas novas não conferem.
          </div>
        )}
        {ok === "curta" && (
          <div
            style={{
              fontSize: 12,
              color: COLORS.error,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <AlertTriangle size={14} /> Senha precisa ter pelo menos 4
            caracteres.
          </div>
        )}
        {ok === "senhaerrada" && (
          <div
            style={{
              fontSize: 12,
              color: COLORS.error,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <AlertTriangle size={14} /> Senha atual incorreta.
          </div>
        )}
        {ok === "erro" && (
          <div
            style={{
              fontSize: 12,
              color: COLORS.error,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <AlertTriangle size={14} /> Não foi possível trocar a senha.
          </div>
        )}

        <button
          onClick={trocar}
          disabled={salvando}
          style={{
            ...btn(ok === "ok" ? COLORS.success : COLORS.primary, {
              width: "100%",
              opacity: salvando ? 0.6 : 1,
              cursor: salvando ? "default" : "pointer",
            }),
          }}
        >
          {salvando ? (
            "Salvando…"
          ) : ok === "ok" ? (
            <>
              <Check size={16} /> Senha alterada!
            </>
          ) : (
            "Alterar senha"
          )}
        </button>
        <p
          style={{
            fontSize: 11,
            color: COLORS.muted,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Esqueceu a senha atual? Peça pro master gerar uma nova pra você.
        </p>
      </div>
    </Card>
  );
}
