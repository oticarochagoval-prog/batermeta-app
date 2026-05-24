// LojaApp — shell do gerente da loja.
// Etapa 2: agora carrega TODOS os dados (incluindo origens e abordadores),
// e a aba "Lançar" é a tela real. Refresh automático depois de salvar.

import React, { useCallback, useEffect, useState } from "react";
import { Home, Plus, BarChart3, Settings } from "lucide-react";
import { Header, TabBar, EmBreve } from "../ui/components.jsx";
import Dashboard from "./Dashboard.jsx";
import Lancar from "./Lancar.jsx";
import WhatsModal from "../ui/WhatsModal.jsx";
import { CONFIG } from "../lib/config.js";
import { fmtExtenso } from "../lib/format.js";
import { COLORS } from "../lib/colors.js";
import {
  listarAbordadores,
  listarLancamentos,
  listarMidias,
  listarOrcamentos,
  listarOrigens,
} from "../lib/db.js";

const TABS = [
  { key: "home", label: "Início", icon: Home },
  { key: "lancar", label: "Lançar", icon: Plus },
  { key: "rel", label: "Relatórios", icon: BarChart3 },
  { key: "cfg", label: "Config", icon: Settings },
];

export default function LojaApp({ loja, onSair, viaMaster = false }) {
  const [tab, setTab] = useState("home");
  const [lancamentos, setLancamentos] = useState([]);
  const [midias, setMidias] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [abordadores, setAbordadores] = useState([]);
  const [origens, setOrigens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [whats, setWhats] = useState(false);

  const recarregar = useCallback(async () => {
    setErro("");
    try {
      const [l, m, o, a, ori] = await Promise.all([
        listarLancamentos(loja.id, CONFIG.mes, CONFIG.ano),
        listarMidias(loja.id, CONFIG.mes, CONFIG.ano),
        listarOrcamentos(loja.id, CONFIG.mes, CONFIG.ano),
        listarAbordadores(loja.id, CONFIG.mes, CONFIG.ano),
        listarOrigens(loja.id),
      ]);
      setLancamentos(l);
      setMidias(m);
      setOrcamentos(o);
      setAbordadores(a);
      setOrigens(ori);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro(
        "Não foi possível carregar os dados. Verifique a conexão com o Supabase."
      );
    }
  }, [loja.id]);

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

  return (
    <>
      <Header
        titulo={loja.nome}
        sub={fmtExtenso(CONFIG.hoje)}
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
            Carregando…
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
              <Dashboard
                loja={loja}
                lancamentos={lancamentos}
                midias={midias}
                orcamentos={orcamentos}
                onWhats={() => setWhats(true)}
                onIrLancar={() => setTab("lancar")}
              />
            )}
            {tab === "lancar" && (
              <Lancar
                loja={loja}
                origens={origens}
                lancamentos={lancamentos}
                midias={midias}
                orcamentos={orcamentos}
                abordadores={abordadores}
                viaMaster={viaMaster}
                onSaved={recarregar}
                onIrConfig={() => setTab("cfg")}
              />
            )}
            {tab === "rel" && (
              <EmBreve
                nome="Relatórios"
                descricao="Tabelas e indicadores do mês — habilitado na Etapa 3."
              />
            )}
            {tab === "cfg" && (
              <EmBreve
                nome="Config"
                descricao="Metas, origens de mídia, troca de senha — habilitado na Etapa 3."
              />
            )}
          </>
        )}
      </div>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
      {whats && (
        <WhatsModal
          loja={loja}
          lancamentos={lancamentos}
          midias={midias}
          orcamentos={orcamentos}
          onClose={() => setWhats(false)}
        />
      )}
    </>
  );
}
