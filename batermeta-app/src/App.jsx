// App root.
// Porte do protótipo (linhas 2884-2975), Etapa 3:
//   • Hidrata CONFIG do master_config no boot
//   • Estado de sessão (master | loja | null)
//   • Restaura sessão persistida do localStorage no boot
//   • Carrega TODAS as lojas pro MasterApp (CRUD master)
//   • Para sessão de loja, busca a loja específica

import React, { useCallback, useEffect, useState } from "react";
import Login from "./auth/Login.jsx";
import LojaApp from "./pages/LojaApp.jsx";
import MasterApp from "./pages/MasterApp.jsx";
import { COLORS } from "./lib/colors.js";
import { carregarSessao, limparSessao } from "./auth/session.js";
import { listarLojas, listarMasterConfig } from "./lib/db.js";
import { hidratarConfigDoServidor } from "./lib/config.js";

export default function App() {
  const [session, setSession] = useState(null);
  const [bootando, setBootando] = useState(true);
  const [loja, setLoja] = useState(null);
  const [carregandoLoja, setCarregandoLoja] = useState(false);
  const [lojasState, setLojasState] = useState([]); // todas as lojas, pro master
  const [erroMaster, setErroMaster] = useState("");

  // Boot: hidrata CONFIG + restaura sessão persistida.
  useEffect(() => {
    (async () => {
      await hidratarConfigDoServidor(listarMasterConfig);
      const s = carregarSessao();
      if (s) setSession(s);
      setBootando(false);
    })();
  }, []);

  // Recarrega lista de TODAS as lojas (usado tanto pro master quanto pra
  // sessão de loja específica). Cacheia em lojasState pra master usar.
  const recarregarLojas = useCallback(async () => {
    try {
      const lojas = await listarLojas();
      setLojasState(lojas);
      return lojas;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErroMaster(
        "Não foi possível carregar as lojas. Verifique a conexão com o Supabase."
      );
      return [];
    }
  }, []);

  // Sessão de loja: carrega a loja específica.
  useEffect(() => {
    if (session?.type !== "loja") {
      setLoja(null);
      return;
    }
    let cancelado = false;
    (async () => {
      setCarregandoLoja(true);
      try {
        const lojas = await recarregarLojas();
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
  }, [session, recarregarLojas]);

  // Sessão de master: carrega todas as lojas no boot.
  useEffect(() => {
    if (session?.type !== "master") return;
    recarregarLojas();
  }, [session, recarregarLojas]);

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
          erroMaster ? (
            <div style={{ padding: 20, color: COLORS.error, fontSize: 13 }}>
              {erroMaster}
            </div>
          ) : (
            <MasterApp
              lojasState={lojasState}
              recarregarLojas={recarregarLojas}
              onSair={sair}
            />
          )
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
          <LojaApp
            loja={loja}
            onSair={sair}
            onLojaAtualizada={recarregarLojas}
          />
        )}
      </div>
    </div>
  );
}
