// App root.
// Porte do protótipo (linhas 2884-2975), simplificado para a Etapa 1:
//   • Estado de sessão (master | loja | null)
//   • Restaura sessão persistida do localStorage no boot
//   • Para sessão de loja, busca os dados da loja no Supabase
//
// Estado mutável (CRUD de lançamentos, mídias etc) entra na Etapa 2.

import React, { useEffect, useState } from "react";
import Login from "./auth/Login.jsx";
import LojaApp from "./pages/LojaApp.jsx";
import MasterApp from "./pages/MasterApp.jsx";
import { COLORS } from "./lib/colors.js";
import { carregarSessao, limparSessao } from "./auth/session.js";
import { listarLojas } from "./lib/db.js";

export default function App() {
  const [session, setSession] = useState(null);
  const [bootando, setBootando] = useState(true);
  const [loja, setLoja] = useState(null);
  const [carregandoLoja, setCarregandoLoja] = useState(false);

  // Restaura sessão persistida no boot.
  useEffect(() => {
    const s = carregarSessao();
    if (s) setSession(s);
    setBootando(false);
  }, []);

  // Quando a sessão é de loja, busca os dados da loja.
  useEffect(() => {
    if (session?.type !== "loja") {
      setLoja(null);
      return;
    }
    let cancelado = false;
    (async () => {
      setCarregandoLoja(true);
      try {
        const lojas = await listarLojas();
        const achada = lojas.find((l) => l.id === session.lojaId);
        if (!cancelado) setLoja(achada || null);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        if (!cancelado) setLoja(null);
      } finally {
        if (!cancelado) setCarregandoLoja(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [session]);

  const sair = () => {
    limparSessao();
    setSession(null);
    setLoja(null);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        background: "#E2E8F0",
        minHeight: "100vh",
        fontFamily: "Manrope",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          minHeight: "100vh",
          background: COLORS.bg,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 40px rgba(15,23,42,.12)",
        }}
      >
        {bootando ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.muted,
              fontSize: 13,
            }}
          >
            Abrindo BaterMeta…
          </div>
        ) : !session ? (
          <Login onLogin={setSession} />
        ) : session.type === "master" ? (
          <MasterApp onSair={sair} />
        ) : carregandoLoja || !loja ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.muted,
              fontSize: 13,
            }}
          >
            {carregandoLoja
              ? "Carregando sua loja…"
              : "Loja não encontrada. Faça login novamente."}
          </div>
        ) : (
          <LojaApp loja={loja} onSair={sair} />
        )}
      </div>
    </div>
  );
}
