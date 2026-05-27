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
import { Pencil } from "lucide-react";
import { Header } from "../../ui/components.jsx";
import { COLORS } from "../../lib/colors.js";
import { CONFIG } from "../../lib/config.js";
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
      console.error(e);
    }
  }, [loja.id]);

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
              {l.nome} {l.tipoPeriodo === "semanal" ? "(semanal)" : ""}
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
              onClick={() => setMtab(k)}
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
