// LojaApp — shell do gerente da loja.
// Porte do protótipo (linhas 1983-2004) com adição de loading
// assíncrono dos dados do Supabase.

import React, { useEffect, useState } from "react";
import { Home, Plus, BarChart3, Settings } from "lucide-react";
import { Header, TabBar, EmBreve } from "../ui/components.jsx";
import Dashboard from "./Dashboard.jsx";
import { CONFIG } from "../lib/config.js";
import { fmtExtenso } from "../lib/format.js";
import { COLORS } from "../lib/colors.js";
import {
  listarLancamentos,
  listarMidias,
  listarOrcamentos,
} from "../lib/db.js";

const TABS = [
  { key: "home", label: "Início", icon: Home },
  { key: "lancar", label: "Lançar", icon: Plus },
  { key: "rel", label: "Relatórios", icon: BarChart3 },
  { key: "cfg", label: "Config", icon: Settings },
];

export default function LojaApp({ loja, onSair }) {
  const [tab, setTab] = useState("home");
  const [lancamentos, setLancamentos] = useState([]);
  const [midias, setMidias] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setLoading(true);
      setErro("");
      try {
        const [l, m, o] = await Promise.all([
          listarLancamentos(loja.id, CONFIG.mes, CONFIG.ano),
          listarMidias(loja.id, CONFIG.mes, CONFIG.ano),
          listarOrcamentos(loja.id, CONFIG.mes, CONFIG.ano),
        ]);
        if (!cancelado) {
          setLancamentos(l);
          setMidias(m);
          setOrcamentos(o);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        if (!cancelado) {
          setErro(
            "Não foi possível carregar os dados. Verifique a conexão com o Supabase."
          );
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [loja.id]);

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
                onWhats={() => {
                  // Modal de WhatsApp entra na Etapa 2 junto com Lançar.
                  alert(
                    "Relatório via WhatsApp será habilitado na próxima etapa."
                  );
                }}
                onIrLancar={() => setTab("lancar")}
              />
            )}
            {tab === "lancar" && (
              <EmBreve
                nome="Lançar"
                descricao="Contratado, Faturado, Mídia, Orçamento e Abordador — habilitado na Etapa 2."
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
    </>
  );
}
