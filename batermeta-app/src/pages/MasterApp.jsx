// MasterApp — shell completo do master.
// Porte do protótipo (linhas 2699-2728).
//
// 4 tabs principais: Painel, Ranking, Relatórios, Config.
// Quando uma loja é aberta (do Painel ou da Config), entra em MasterLojaView.

import React, { useCallback, useEffect, useState } from "react";
import { Home, Trophy, FileText, Settings } from "lucide-react";
import { Header, TabBar } from "../ui/components.jsx";
import { COLORS } from "../lib/colors.js";
import { CONFIG } from "../lib/config.js";
import {
  listarLancamentos,
  listarMidias,
  listarOrcamentos,
  listarOrigens,
} from "../lib/db.js";
import MasterHome from "./master/MasterHome.jsx";
import RankingMidia from "./master/RankingMidia.jsx";
import RelatoriosConsolidados from "./master/RelatoriosConsolidados.jsx";
import ConfigMaster from "./master/ConfigMaster.jsx";
import MasterLojaView from "./master/MasterLojaView.jsx";

const TABS = [
  { key: "home", label: "Painel", icon: Home },
  { key: "ranking", label: "Ranking", icon: Trophy },
  { key: "rel", label: "Relatórios", icon: FileText },
  { key: "cfg", label: "Config", icon: Settings },
];

export default function MasterApp({ lojasState, recarregarLojas, onSair }) {
  const [tab, setTab] = useState("home");
  const [openLojaId, setOpenLojaId] = useState(null);

  // Estado consolidado: TODOS os lançamentos/midias/orcamentos/origens da rede
  const [lancamentos, setLancamentos] = useState([]);
  const [midias, setMidias] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [origens, setOrigens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const recarregar = useCallback(async () => {
    setErro("");
    try {
      // Sem lojaId, listar* retorna de TODAS as lojas
      const [l, m, o, ori] = await Promise.all([
        listarLancamentos(null, CONFIG.mes, CONFIG.ano),
        listarMidias(null, CONFIG.mes, CONFIG.ano),
        listarOrcamentos(null, CONFIG.mes, CONFIG.ano),
        listarOrigens(null),
      ]);
      setLancamentos(l);
      setMidias(m);
      setOrcamentos(o);
      setOrigens(ori);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os dados da rede.");
    }
  }, []);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setLoading(true);
      await recarregar();
      if (!cancelado) setLoading(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [recarregar]);

  const openLoja = openLojaId
    ? lojasState.find((l) => l.id === openLojaId)
    : null;

  if (openLoja) {
    return (
      <MasterLojaView
        loja={openLoja}
        lojasState={lojasState}
        onBack={() => {
          setOpenLojaId(null);
          recarregar(); // recarrega dados ao voltar (master pode ter lançado)
        }}
        setOpenLojaId={setOpenLojaId}
        recarregarLojas={recarregarLojas}
      />
    );
  }

  return (
    <>
      <Header
        titulo={CONFIG.nomeRede || "BaterMeta"}
        sub="Painel Master"
        onSair={onSair}
      />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: COLORS.muted,
              fontSize: 13,
            }}
          >
            Carregando dados da rede…
          </div>
        ) : erro ? (
          <div
            style={{
              margin: 16,
              padding: 16,
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#B91C1C",
              borderRadius: 12,
              fontSize: 13,
            }}
          >
            {erro}
          </div>
        ) : (
          <>
            {tab === "home" && (
              <MasterHome
                lojasState={lojasState}
                lancamentos={lancamentos}
                midias={midias}
                orcamentos={orcamentos}
                origens={origens}
                onOpen={(l) => setOpenLojaId(l.id)}
              />
            )}
            {tab === "ranking" && (
              <RankingMidia midias={midias} origens={origens} />
            )}
            {tab === "rel" && (
              <RelatoriosConsolidados
                lojasState={lojasState}
                lancamentos={lancamentos}
                midias={midias}
                orcamentos={orcamentos}
                origens={origens}
              />
            )}
            {tab === "cfg" && (
              <ConfigMaster
                lojasState={lojasState}
                recarregarLojas={recarregarLojas}
              />
            )}
          </>
        )}
      </div>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
    </>
  );
}
