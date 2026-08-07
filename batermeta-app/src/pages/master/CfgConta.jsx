// Cfg Conta — porte do protótipo (linhas 2167-2206).
//
// Salva nome_rede e senha_master na tabela master_config.
// Senha master agora vem do banco (com fallback hard-coded em session.js).

import React, { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { Card } from "../../ui/components.jsx";
import { COLORS } from "../../lib/colors.js";
import { CONFIG } from "../../lib/config.js";
import { salvarMasterConfig } from "../../lib/db.js";
import { Field, btn, inp } from "../../ui/Field.jsx";

export default function CfgConta() {
  const [nomeRede, setNomeRede] = useState(CONFIG.nomeRede || "Óticas Rocha");
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [okNome, setOkNome] = useState(false);
  const [okSenha, setOkSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const salvarNome = async () => {
    setErro("");
    setSalvando(true);
    try {
      await salvarMasterConfig("nome_rede", nomeRede);
      CONFIG.nomeRede = nomeRede;
      setOkNome(true);
      setTimeout(() => setOkNome(false), 1600);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível salvar o nome.");
    } finally {
      setSalvando(false);
    }
  };

  const salvarSenha = async () => {
    setErro("");
    if (!s1 || s1 !== s2) {
      setErro("As senhas não conferem.");
      return;
    }
    if (s1.length < 6) {
      setErro("Senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setSalvando(true);
    try {
      await salvarMasterConfig("senha_master", s1);
      CONFIG.senhaMaster = s1;
      setS1("");
      setS2("");
      setOkSenha(true);
      setTimeout(() => setOkSenha(false), 1800);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível salvar a senha.");
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
          Conta
        </div>
        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Field label="Nome da rede">
            <input
              value={nomeRede}
              onChange={(e) => setNomeRede(e.target.value)}
              style={inp}
            />
          </Field>
          <button
            onClick={salvarNome}
            disabled={salvando}
            style={{
              ...btn(okNome ? COLORS.success : COLORS.primary, {
                width: "100%",
                opacity: salvando ? 0.6 : 1,
              }),
            }}
          >
            {okNome ? (
              <>
                <Check size={16} /> Salvo!
              </>
            ) : (
              "Salvar nome da rede"
            )}
          </button>
        </div>
      </Card>
      <Card style={{ overflow: "hidden" }}>
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
          Alterar senha do master
        </div>
        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Field label="Nova senha (mínimo 6 caracteres)">
            <input
              type="password"
              value={s1}
              onChange={(e) => setS1(e.target.value)}
              style={inp}
            />
          </Field>
          <Field label="Confirmar nova senha">
            <input
              type="password"
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              style={inp}
            />
          </Field>
          {erro && (
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
              <AlertTriangle size={14} /> {erro}
            </div>
          )}
          <button
            onClick={salvarSenha}
            disabled={salvando}
            style={{
              ...btn(okSenha ? COLORS.success : COLORS.primary, {
                width: "100%",
                opacity: salvando ? 0.6 : 1,
              }),
            }}
          >
            {okSenha ? (
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
            A senha master fica guardada no banco (master_config). Se alguém
            limpar a tabela, o sistema volta pra senha original do briefing.
          </p>
        </div>
      </Card>
    </>
  );
}
