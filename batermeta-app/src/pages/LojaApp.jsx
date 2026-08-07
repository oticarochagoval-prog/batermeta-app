// LojaApp — shell do gerente da loja.
//
// FIX (01/06/2026 - fix6): adicionado SELETOR DE MÊS.
// Antes: sistema carregava só CONFIG.mes/CONFIG.ano (mês corrente).
// Agora: cada loja tem um estado próprio (mesView, anoView). Quando
// vira o mês, gerente consegue voltar pra ver/lançar dados do mês
// anterior sem o master precisar entrar.
//
// O seletor aparece em cima das telas (abaixo do header). Default =
// mês corrente. Botão "← Maio" e "Junho →" pra navegar entre meses.

import React, { useCallback, useEffect, useState } from "react";
import { Home, Plus, BarChart3, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Header, TabBar } from "../ui/components.jsx";
import Dashboard from "./Dashboard.jsx";
import Lancar from "./Lancar.jsx";
import Relatorios from "./Relatorios.jsx";
import ConfigLoja from "./ConfigLoja.jsx";
import WhatsModal from "../ui/WhatsModal.jsx";
import { CONFIG } from "../lib/config.js";
import { fmtExtenso, MES } from "../lib/format.js";
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

export default function LojaApp({
  loja,
  onSair,
  viaMaster = false,
  onLojaAtualizada,
}) {
  const [tab, setTab] = useState("home");

  // Quando o gerente clica num dia atrasado no Painel, guardamos o
  // período aqui e trocamos pra aba Lançar já naquele dia.
  const [periodoInicialLancar, setPeriodoInicialLancar] = useState(null);
  const irLancarNoDia = (periodo) => {
    setPeriodoInicialLancar(periodo);
    setTab("lancar");
  };

  // Mês/ano em visualização. Default = mês corrente.
  const [mesView, setMesView] = useState(CONFIG.mes);
  const [anoView, setAnoView] = useState(CONFIG.ano);

  const [lancamentos, setLancamentos] = useState([]);
  const [midias, setMidias] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [abordadores, setAbordadores] = useState([]);
  const [origens, setOrigens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [whats, setWhats] = useState(false);

  const ehMesAtual = mesView === CONFIG.mes && anoView === CONFIG.ano;

  const recarregar = useCallback(async () => {
    setErro("");
    try {
      const [l, m, o, a, ori] = await Promise.all([
        listarLancamentos(loja.id, mesView, anoView),
        listarMidias(loja.id, mesView, anoView),
        listarOrcamentos(loja.id, mesView, anoView),
        listarAbordadores(loja.id, mesView, anoView),
        listarOrigens(loja.id),
      ]);
      setLancamentos(l);
      setMidias(m);
      setOrcamentos(o);
      setAbordadores(a);
      setOrigens(ori);
      if (onLojaAtualizada) onLojaAtualizada();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro(
        "Não foi possível carregar os dados. Verifique a conexão com o Supabase."
      );
    }
  }, [loja.id, mesView, anoView, onLojaAtualizada]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loja.id, mesView, anoView]);

  // Navegação de mês
  const irMesAnterior = () => {
    let m = mesView - 1;
    let a = anoView;
    if (m < 1) {
      m = 12;
      a -= 1;
    }
    setMesView(m);
    setAnoView(a);
  };
  const irMesPosterior = () => {
    let m = mesView + 1;
    let a = anoView;
    if (m > 12) {
      m = 1;
      a += 1;
    }
    setMesView(m);
    setAnoView(a);
  };
  const voltarHoje = () => {
    setMesView(CONFIG.mes);
    setAnoView(CONFIG.ano);
  };

  // Não deixa navegar pra meses muito no futuro (>1 mês à frente do atual)
  const limiteFuturo = (() => {
    const hojeMes = CONFIG.mes;
    const hojeAno = CONFIG.ano;
    const proxMes = hojeMes === 12 ? 1 : hojeMes + 1;
    const proxAno = hojeMes === 12 ? hojeAno + 1 : hojeAno;
    return mesView === proxMes && anoView === proxAno;
  })();

  // Limite passado: 12 meses pra trás é razoável
  const limitePassado = (() => {
    const dHoje = new Date(CONFIG.ano, CONFIG.mes - 1, 1);
    const dView = new Date(anoView, mesView - 1, 1);
    const diffMeses =
      (dHoje.getFullYear() - dView.getFullYear()) * 12 +
      (dHoje.getMonth() - dView.getMonth());
    return diffMeses >= 12;
  })();

  // Banner do seletor de mês
  const seletorMes = (
    <div
      style={{
        background: ehMesAtual ? "#fff" : "#FEF3C7",
        borderBottom: `1px solid ${ehMesAtual ? COLORS.border : "#FDE68A"}`,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <button
        onClick={irMesAnterior}
        disabled={limitePassado}
        style={{
          background: "transparent",
          border: "none",
          padding: 5,
          cursor: limitePassado ? "default" : "pointer",
          opacity: limitePassado ? 0.3 : 1,
          color: COLORS.fg,
          display: "flex",
          alignItems: "center",
        }}
        aria-label="Mês anterior"
      >
        <ChevronLeft size={20} />
      </button>
      <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: ehMesAtual ? COLORS.muted : "#92400E",
            letterSpacing: 0.5,
          }}
        >
          {ehMesAtual ? "VENDO MÊS ATUAL" : "VENDO MÊS PASSADO"}
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            fontFamily: "Sora",
            color: ehMesAtual ? COLORS.fg : "#92400E",
          }}
        >
          {MES[mesView - 1]} / {anoView}
        </div>
        {!ehMesAtual && (
          <button
            onClick={voltarHoje}
            style={{
              background: "transparent",
              border: "none",
              color: COLORS.primary,
              fontSize: 11,
              fontWeight: 700,
              textDecoration: "underline",
              cursor: "pointer",
              marginTop: 2,
              padding: 0,
            }}
          >
            voltar pro mês atual
          </button>
        )}
      </div>
      <button
        onClick={irMesPosterior}
        disabled={limiteFuturo}
        style={{
          background: "transparent",
          border: "none",
          padding: 5,
          cursor: limiteFuturo ? "default" : "pointer",
          opacity: limiteFuturo ? 0.3 : 1,
          color: COLORS.fg,
          display: "flex",
          alignItems: "center",
        }}
        aria-label="Mês posterior"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );

  return (
    <>
      <Header
        titulo={loja.nome}
        sub={fmtExtenso(CONFIG.hoje)}
        onSair={onSair}
      />
      {seletorMes}
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
                onIrLancarDia={irLancarNoDia}
                mesView={mesView}
                anoView={anoView}
                ehMesAtual={ehMesAtual}
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
                mesView={mesView}
                anoView={anoView}
                periodoInicial={periodoInicialLancar}
              />
            )}
            {tab === "rel" && (
              <Relatorios
                loja={loja}
                lancamentos={lancamentos}
                midias={midias}
                orcamentos={orcamentos}
                origens={origens}
                abordadores={abordadores}
                mesView={mesView}
                anoView={anoView}
              />
            )}
            {tab === "cfg" && (
              <ConfigLoja
                loja={loja}
                origens={origens}
                onSaved={recarregar}
              />
            )}
          </>
        )}
      </div>
      <TabBar
        tabs={TABS}
        active={tab}
        onChange={(t) => {
          // Trocar de aba pela barra inferior limpa o "dia atrasado"
          // pendente, pra não grudar numa data antiga sem querer.
          setPeriodoInicialLancar(null);
          setTab(t);
        }}
      />
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
