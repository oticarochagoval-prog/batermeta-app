// MasterLojaView — porte do protótipo (linhas 2208-2272).
//
// Master entra como uma loja específica, com edição livre.
// Inclui um seletor pra trocar de loja sem voltar pra home.
// Tabs: Painel, Lançar, Relatórios, Config, Senha (gerar nova).
//
// FIX (28/05/2026): Master agora tem acesso à Config da loja
// (Metas + Origens). Antes só o gerente conseguia editar metas
// e origens; agora se o gerente está de férias / sem acesso,
// o master consegue ajustar tudo.

import React, { useCallback, useEffect, useState } from "react";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "../../ui/components.jsx";
import { COLORS } from "../../lib/colors.js";
import { CONFIG } from "../../lib/config.js";
import { MES } from "../../lib/format.js";
import {
  listarAbordadores,
  listarLancamentos,
  listarMidias,
  listarOrcamentos,
  listarOrigens,
  redefinirSenhaLoja,
} from "../../lib/db.js";
import { Card } from "../../ui/components.jsx";
import { btn, inp } from "../../ui/Field.jsx";
import Dashboard from "../Dashboard.jsx";
import Lancar from "../Lancar.jsx";
import Relatorios from "../Relatorios.jsx";
import ConfigurarMetas from "../config/ConfigurarMetas.jsx";
import OrigensMidia from "../config/OrigensMidia.jsx";
import WhatsModal from "../../ui/WhatsModal.jsx";

export default function MasterLojaView({
  loja,
  lojasState,
  onBack,
  setOpenLojaId,
  recarregarLojas,
}) {
  const [mtab, setMtab] = useState("painel");
  const [subCfg, setSubCfg] = useState("metas");
  const [whats, setWhats] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // Clique num dia atrasado no Painel → abre Lançar já naquele dia.
  const [periodoInicialLancar, setPeriodoInicialLancar] = useState(null);
  const irLancarNoDia = (periodo) => {
    setPeriodoInicialLancar(periodo);
    setMtab("lancar");
  };

  // Mês/ano em visualização (igual ao gerente). Default = mês atual.
  // Permite ao master ver/editar/lançar meses passados em todas as abas.
  const [mesView, setMesView] = useState(CONFIG.mes);
  const [anoView, setAnoView] = useState(CONFIG.ano);
  const ehMesAtual = mesView === CONFIG.mes && anoView === CONFIG.ano;

  // Estado dos dados da loja escolhida
  const [lancamentos, setLancamentos] = useState([]);
  const [midias, setMidias] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [abordadores, setAbordadores] = useState([]);
  const [origens, setOrigens] = useState([]);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
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
    } catch (e) {
      console.error(e);
    }
  }, [loja.id, mesView, anoView]);

  // Usado quando master edita Metas/Origens. Recarrega lojas (pra
  // refletir metas novas) e dados da loja atual.
  const onLojaAtualizada = async () => {
    if (recarregarLojas) await recarregarLojas();
    await recarregar();
  };

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

  const gerarSenha = async () => {
    const s = "rocha" + Math.floor(1000 + Math.random() * 9000);
    setSalvandoSenha(true);
    try {
      await redefinirSenhaLoja(loja.id, s);
      setNovaSenha(s);
      recarregarLojas && (await recarregarLojas());
    } catch (e) {
      console.error(e);
    } finally {
      setSalvandoSenha(false);
    }
  };

  const mtabs = [
    ["painel", "Painel"],
    ["lancar", "Lançar"],
    ["rel", "Relatórios"],
    ["cfg", "Config"],
    ["senha", "Senha"],
  ];

  // ----- Navegação de mês (igual ao gerente) -----
  const irMesAnterior = () => {
    let m = mesView - 1;
    let a = anoView;
    if (m < 1) { m = 12; a -= 1; }
    setMesView(m);
    setAnoView(a);
  };
  const irMesPosterior = () => {
    let m = mesView + 1;
    let a = anoView;
    if (m > 12) { m = 1; a += 1; }
    setMesView(m);
    setAnoView(a);
  };
  const voltarHoje = () => {
    setMesView(CONFIG.mes);
    setAnoView(CONFIG.ano);
  };
  const limiteFuturo = (() => {
    const proxMes = CONFIG.mes === 12 ? 1 : CONFIG.mes + 1;
    const proxAno = CONFIG.mes === 12 ? CONFIG.ano + 1 : CONFIG.ano;
    return mesView === proxMes && anoView === proxAno;
  })();
  const limitePassado = (() => {
    const dHoje = new Date(CONFIG.ano, CONFIG.mes - 1, 1);
    const dView = new Date(anoView, mesView - 1, 1);
    const diff =
      (dHoje.getFullYear() - dView.getFullYear()) * 12 +
      (dHoje.getMonth() - dView.getMonth());
    return diff >= 12;
  })();

  // As abas Config e Senha não dependem de mês — só mostram o seletor
  // nas abas que mexem com dados do período.
  const mostraSeletor = mtab === "painel" || mtab === "lancar" || mtab === "rel";

  return (
    <>
      <Header
        titulo="Visão Master"
        sub={`Operando: ${loja.nome}`}
        onBack={onBack}
      />
      <div
        style={{
          padding: "10px 16px",
          background: "#fff",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: COLORS.muted,
            marginBottom: 4,
          }}
        >
          TROCAR DE LOJA
        </div>
        <select
          value={loja.id}
          onChange={(e) => {
            setOpenLojaId(Number(e.target.value));
            setNovaSenha("");
          }}
          style={{
            ...inp,
            fontWeight: 700,
            color: COLORS.primary,
          }}
        >
          {lojasState.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome}
            </option>
          ))}
        </select>
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            marginTop: 10,
          }}
        >
          {mtabs.map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => {
                setPeriodoInicialLancar(null);
                setMtab(k);
              }}
              style={{
                flex: "0 0 auto",
                padding: "7px 14px",
                borderRadius: 9,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                border: `1.5px solid ${COLORS.primary}`,
                background: mtab === k ? COLORS.primary : "#fff",
                color: mtab === k ? "#fff" : COLORS.primary,
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {mostraSeletor && (
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
      )}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: COLORS.muted,
              fontSize: 13,
            }}
          >
            Carregando…
          </div>
        ) : (
          <>
            {mtab === "painel" && (
              <Dashboard
                loja={loja}
                lancamentos={lancamentos}
                midias={midias}
                orcamentos={orcamentos}
                onWhats={() => setWhats(true)}
                onIrLancar={() => setMtab("lancar")}
                onIrLancarDia={irLancarNoDia}
                mesView={mesView}
                anoView={anoView}
                ehMesAtual={ehMesAtual}
              />
            )}
            {mtab === "lancar" && (
              <>
                <div
                  style={{
                    background: "#EEF2FF",
                    margin: "16px 16px 0",
                    borderRadius: 10,
                    padding: "8px 12px",
                    fontSize: 12,
                    color: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Pencil size={13} /> Você está lançando por{" "}
                  <b>{loja.nome}</b> com a senha master — fica registrado como
                  lançado pelo master.
                </div>
                <Lancar
                  loja={loja}
                  origens={origens}
                  lancamentos={lancamentos}
                  midias={midias}
                  orcamentos={orcamentos}
                  abordadores={abordadores}
                  viaMaster={true}
                  onSaved={recarregar}
                  mesView={mesView}
                  anoView={anoView}
                  periodoInicial={periodoInicialLancar}
                />
              </>
            )}
            {mtab === "rel" && (
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
            {mtab === "cfg" && (
              <div style={{ padding: 16 }}>
                <div
                  style={{
                    background: "#EEF2FF",
                    borderRadius: 10,
                    padding: "8px 12px",
                    fontSize: 12,
                    color: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 14,
                  }}
                >
                  <Pencil size={13} /> Editando as configurações de{" "}
                  <b>{loja.nome}</b> como master.
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  {/* Sub-aba interna: Metas vs Origens */}
                  {(() => {
                    const SubButton = ({ k, lbl }) => (
                      <button
                        onClick={() => setSubCfg(k)}
                        style={{
                          flex: 1,
                          padding: "9px 4px",
                          borderRadius: 10,
                          fontWeight: 700,
                          fontSize: 12.5,
                          cursor: "pointer",
                          border: `1.5px solid ${COLORS.primary}`,
                          background: subCfg === k ? COLORS.primary : "#fff",
                          color: subCfg === k ? "#fff" : COLORS.primary,
                        }}
                      >
                        {lbl}
                      </button>
                    );
                    return (
                      <>
                        <SubButton k="metas" lbl="Metas" />
                        <SubButton k="midia" lbl="Origens" />
                      </>
                    );
                  })()}
                </div>
                {subCfg === "metas" && (
                  <ConfigurarMetas loja={loja} onSaved={onLojaAtualizada} />
                )}
                {subCfg === "midia" && (
                  <OrigensMidia
                    loja={loja}
                    origens={origens}
                    onSaved={recarregar}
                  />
                )}
              </div>
            )}
            {mtab === "senha" && (
              <div style={{ padding: 16 }}>
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
                    Redefinir senha — {loja.nome}
                  </div>
                  <div style={{ padding: 16 }}>
                    <p
                      style={{
                        fontSize: 12,
                        color: COLORS.muted,
                        lineHeight: 1.5,
                        marginBottom: 14,
                      }}
                    >
                      Use quando o gerente esquecer a senha. O sistema gera uma
                      senha nova; você passa pra ele, ele entra e troca pela
                      dele. Ninguém vê a senha antiga.
                    </p>
                    <button
                      onClick={gerarSenha}
                      disabled={salvandoSenha}
                      style={{
                        ...btn(COLORS.primary, {
                          width: "100%",
                          opacity: salvandoSenha ? 0.6 : 1,
                        }),
                      }}
                    >
                      {salvandoSenha ? "Gerando…" : "Gerar nova senha"}
                    </button>
                    {novaSenha && (
                      <div
                        style={{
                          marginTop: 14,
                          background: "#ECFDF3",
                          border: "1px solid #A7F3D0",
                          borderRadius: 10,
                          padding: 14,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{ fontSize: 12, color: COLORS.muted }}
                        >
                          Nova senha de <b>{loja.nome}</b>
                        </div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 800,
                            fontFamily: "Sora",
                            color: COLORS.success,
                            letterSpacing: 1,
                            margin: "4px 0",
                          }}
                        >
                          {novaSenha}
                        </div>
                        <div
                          style={{ fontSize: 11, color: COLORS.muted }}
                        >
                          Passe pro gerente e peça pra ele trocar no primeiro
                          acesso.
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
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
