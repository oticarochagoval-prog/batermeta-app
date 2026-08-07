// Login — porte fiel do protótipo (linhas 2730-2881).
// Mudanças mínimas vs. protótipo:
//   • `entrar()` chama `autenticar()` assíncrono em vez de comparar
//     credenciais contra um array em memória.
//   • Se "Lembrar acesso" estiver marcado e o login der certo,
//     a sessão é persistida em localStorage.
//
// Tudo mais (estilo, layout, microinterações, eye toggle, tela de
// recuperação) está idêntico ao protótipo.

import React, { useState } from "react";
import { Target, Eye, EyeOff, Check, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { autenticar, salvarSessao } from "./session.js";

export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [erro, setErro] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recuperar, setRecuperar] = useState(false);

  const entrar = async () => {
    setErro("");
    setLoading(true);
    try {
      const r = await autenticar(user, pass);
      if (!r.ok) {
        if (r.motivo === "desativada") {
          setErro("Esta loja está desativada. Fale com o administrador.");
        } else {
          setErro("Usuário ou senha incorretos. Tente novamente.");
        }
        return;
      }
      if (lembrar) salvarSessao(r.session);
      onLogin(r.session);
    } catch (e) {
      // Erro de rede ou Supabase não configurado.
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível conectar. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // paleta premium (mais sóbria que o protótipo)
  const INK = "#0B1220",
    SLATE = "#5B6472",
    LINE = "#E6E9EF",
    BLUE = "#1D4ED8";
  const field = {
    width: "100%",
    padding: "13px 14px",
    border: `1.5px solid ${LINE}`,
    borderRadius: 12,
    fontSize: 15,
    outline: "none",
    background: "#fff",
    fontFamily: "Inter, Manrope, sans-serif",
    transition: "border-color .15s, box-shadow .15s",
  };

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 28,
        background: "linear-gradient(180deg,#F7F9FC 0%,#EEF2F8 100%)",
        fontFamily: "Inter, Manrope, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            margin: "0 auto 16px",
            background: "linear-gradient(145deg,#1D4ED8,#2563EB)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 24px rgba(29,78,216,.28)",
          }}
        >
          <Target size={30} color="#fff" strokeWidth={2.4} />
        </div>
        <div style={{ color: INK, fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
          BaterMeta
        </div>
        <div style={{ color: SLATE, fontSize: 13, marginTop: 3 }}>
          Gestão de metas para sua rede
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 1px 2px rgba(11,18,32,.04), 0 12px 32px rgba(11,18,32,.07)",
          border: `1px solid ${LINE}`,
        }}
      >
        {!recuperar ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, color: INK, marginBottom: 2 }}>
              Entrar
            </div>
            <div style={{ fontSize: 13, color: SLATE, marginBottom: 20 }}>
              Acesse o painel da sua loja
            </div>

            <label style={{ display: "block", marginBottom: 14 }}>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: INK,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Usuário
              </span>
              <input
                value={user}
                onChange={(e) => {
                  setUser(e.target.value);
                  setErro("");
                }}
                autoCapitalize="none"
                autoComplete="username"
                placeholder="seu usuário"
                style={field}
                onFocus={(e) => {
                  e.target.style.borderColor = BLUE;
                  e.target.style.boxShadow = `0 0 0 3px ${BLUE}1A`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = LINE;
                  e.target.style.boxShadow = "none";
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: INK,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Senha
              </span>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={pass}
                  onChange={(e) => {
                    setPass(e.target.value);
                    setErro("");
                  }}
                  autoComplete="current-password"
                  placeholder="sua senha"
                  style={{ ...field, paddingRight: 46 }}
                  onKeyDown={(e) => e.key === "Enter" && entrar()}
                  onFocus={(e) => {
                    e.target.style.borderColor = BLUE;
                    e.target.style.boxShadow = `0 0 0 3px ${BLUE}1A`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = LINE;
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label="mostrar senha"
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: SLATE,
                    padding: 6,
                    display: "flex",
                    borderRadius: 8,
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 18 }}
            >
              <button
                type="button"
                onClick={() => setLembrar((v) => !v)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: 0,
                  color: INK,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    border: `1.5px solid ${lembrar ? BLUE : LINE}`,
                    background: lembrar ? BLUE : "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all .15s",
                  }}
                >
                  {lembrar && <Check size={12} color="#fff" strokeWidth={3} />}
                </span>
                Lembrar acesso
              </button>
              <button
                type="button"
                onClick={() => setRecuperar(true)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: BLUE,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                Esqueci a senha
              </button>
            </div>

            {erro && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  color: "#B91C1C",
                  fontSize: 12.5,
                  fontWeight: 500,
                  padding: "10px 12px",
                  borderRadius: 10,
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <AlertTriangle size={14} /> {erro}
              </div>
            )}

            <button
              type="button"
              onClick={entrar}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                border: "none",
                cursor: loading ? "default" : "pointer",
                background: loading
                  ? "#93A4C8"
                  : "linear-gradient(145deg,#1D4ED8,#2563EB)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 8px 20px rgba(29,78,216,.25)",
                transition: "transform .1s, opacity .15s",
              }}
            >
              {loading ? (
                "Entrando…"
              ) : (
                <>
                  Entrar <ArrowRight size={17} />
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, color: INK, marginBottom: 2 }}>
              Recuperar acesso
            </div>
            <div
              style={{
                fontSize: 13,
                color: SLATE,
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              Por segurança, a senha não é exibida a ninguém. O administrador
              (master) gera uma nova senha para você em <b>Config → Senha</b> e te
              repassa. No primeiro acesso, troque pela sua.
            </div>
            <button
              type="button"
              onClick={() => setRecuperar(false)}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 12,
                border: `1.5px solid ${LINE}`,
                background: "#fff",
                color: INK,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <ArrowLeft size={16} /> Voltar ao login
            </button>
          </>
        )}
      </div>

      <div
        style={{
          color: SLATE,
          fontSize: 11.5,
          textAlign: "center",
          marginTop: 22,
        }}
      >
        BaterMeta · Bata suas metas todo dia
      </div>
    </div>
  );
}
