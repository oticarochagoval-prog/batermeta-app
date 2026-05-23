// MasterApp — stub.
// O painel completo do master entra na Etapa 3, junto com
// Relatórios, Ranking e Config Master.
//
// Aqui só validamos que o login do master funciona e
// roteia para o lugar certo.

import React from "react";
import { Home, Trophy, FileText, Settings } from "lucide-react";
import { Header, TabBar, EmBreve } from "../ui/components.jsx";

const TABS = [
  { key: "home", label: "Painel", icon: Home },
  { key: "ranking", label: "Ranking", icon: Trophy },
  { key: "rel", label: "Relatórios", icon: FileText },
  { key: "cfg", label: "Config", icon: Settings },
];

export default function MasterApp({ onSair }) {
  const [tab, setTab] = React.useState("home");
  return (
    <>
      <Header titulo="BaterMeta" sub="Painel Master" onSair={onSair} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <EmBreve
          nome="Painel Master"
          descricao="Visão consolidada das lojas, ranking de mídia, relatórios e config — habilitado na Etapa 3."
        />
      </div>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />
    </>
  );
}
