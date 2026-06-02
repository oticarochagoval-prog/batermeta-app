// Lançar Mídia — porte do protótipo (linhas 822-924).
//
// LISTA ÚNICA: mostra todas as origens ativas da loja, gerente preenche
// o que houve e salva tudo de uma vez. "Não teve" zera o dia.
//
// Totalizador inteligente: mostra o valor total digitado vs. o
// Contratado do mesmo dia (alerta se faltou/sobrou).

import React, { useEffect, useState } from "react";
import { Ban, Check, Lock, Settings } from "lucide-react";
import { CAT_COR, COLORS } from "../../lib/colors.js";
import { fmtBRL } from "../../lib/format.js";
import { CONFIG } from "../../lib/config.js";
import { setMidiaLote, naoTeveMidia, buscarLancamento } from "../../lib/db.js";
import { podeEditar } from "../../lib/janela_edicao.js";
import { btn } from "../../ui/Field.jsx";
import MoneyInput from "../../ui/MoneyInput.jsx";
import PeriodoSeletor from "../../ui/PeriodoSeletor.jsx";

export default function FormMidia({
  loja,
  origens,
  midias,
  lancamentos,
  permitirFuturo,
  viaMaster,
  onSaved,
  onIrConfig,
  mesView,
  anoView,
}) {
  const cor = CAT_COR.midia;
  const num = (v) => parseInt(String(v), 10) || 0;

  // Default do período (todas as lojas são diárias):
  // mês ATUAL → hoje; outro mês → último dia daquele mês.
  const ehMesAtual =
    !mesView || (mesView === CONFIG.mes && anoView === CONFIG.ano);
  let periodoHoje;
  if (ehMesAtual) {
    periodoHoje = CONFIG.hoje;
  } else {
    const ultimoDia = new Date(anoView, mesView, 0).getDate();
    periodoHoje = `${anoView}-${String(mesView).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  }

  const oriDaLoja = origens.filter((o) => o.lojaId === loja.id);
  const oriAtivas = oriDaLoja.filter((o) => o.ativa !== false);

  const [mPeriodo, setMPeriodo] = useState(periodoHoje);
  const [mLinhas, setMLinhas] = useState({}); // { origemId: {qtd, valor} }
  const [ok, setOk] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const base = {};
    oriAtivas.forEach((o) => {
      const ja = midias.find(
        (m) =>
          m.lojaId === loja.id &&
          m.periodo === mPeriodo &&
          m.origemId === o.id &&
          !m.naoTeve
      );
      base[o.id] = ja
        ? { qtd: String(ja.quantidade), valor: ja.valor }
        : { qtd: "", valor: 0 };
    });
    setMLinhas(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mPeriodo, midias.length]);

  const setLinha = (oid, campo, v) =>
    setMLinhas((p) => ({ ...p, [oid]: { ...p[oid], [campo]: v } }));

  const gate = podeEditar(mPeriodo, viaMaster);
  const bloqueado = !gate.permitido;

  const salvar = async () => {
    if (bloqueado) {
      setErro(gate.motivo);
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      const itens = oriAtivas
        .map((o) => ({
          origemId: o.id,
          quantidade: num(mLinhas[o.id]?.qtd),
          valor: mLinhas[o.id]?.valor || 0,
        }))
        .filter((it) => it.quantidade > 0);
      await setMidiaLote(loja.id, mPeriodo, itens);
      setOk("salvo");
      setTimeout(() => setOk(""), 1800);
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const naoTeve = async () => {
    if (bloqueado) {
      setErro(gate.motivo);
      return;
    }
    setErro("");
    setSalvando(true);
    try {
      await naoTeveMidia(loja.id, mPeriodo);
      setOk("naoteve");
      setTimeout(() => setOk(""), 1800);
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  // Totais ao vivo + comparação com Contratado do mesmo dia
  const totalQtd = Object.values(mLinhas).reduce(
    (s, l) => s + num(l?.qtd),
    0
  );
  const totalValor = Object.values(mLinhas).reduce(
    (s, l) => s + (l?.valor || 0),
    0
  );
  // FIX (fix6.4 / Bug C na mídia): em vez de procurar o contratado no
  // array `lancamentos` (que só tem o mês visualizado), busca direto no
  // banco sempre que a data muda. Assim, ao editar uma data antiga, o
  // "Contratado do dia" aparece certo — e não R$ 0 / "não foi lançado".
  const [contratadoDiaDb, setContratadoDiaDb] = useState(null);
  useEffect(() => {
    let cancelado = false;
    // chute imediato pelo array (evita piscar), depois confirma no banco
    const noArray = lancamentos.find(
      (l) =>
        l.lojaId === loja.id &&
        l.periodo === mPeriodo &&
        l.categoria === "contratado" &&
        !l.naoTeve
    );
    if (noArray) setContratadoDiaDb(noArray);
    (async () => {
      try {
        const achado = await buscarLancamento(loja.id, mPeriodo, "contratado");
        if (!cancelado) setContratadoDiaDb(achado && !achado.naoTeve ? achado : null);
      } catch (e) {
        if (!cancelado && !noArray) setContratadoDiaDb(null);
      }
    })();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mPeriodo, loja.id]);

  const lancContratado = contratadoDiaDb;
  const contratadoDia = lancContratado ? lancContratado.valor : 0;
  const temContratado = !!lancContratado;
  const diff = totalValor - contratadoDia;
  const bateu = temContratado && Math.abs(diff) < 0.01;
  const faltou = temContratado && diff < -0.01;
  const sobrou = temContratado && diff > 0.01;
  const corStatus = bateu
    ? COLORS.success
    : faltou
    ? COLORS.warning
    : sobrou
    ? COLORS.error
    : COLORS.muted;
  const bgStatus = bateu
    ? "#ECFDF3"
    : faltou
    ? "#FFFBEB"
    : sobrou
    ? "#FEF2F2"
    : "#F1F5F9";
  const bordaStatus = bateu
    ? "#A7F3D0"
    : faltou
    ? "#FDE68A"
    : sobrou
    ? "#FECACA"
    : COLORS.border;

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: cor,
          color: "#fff",
          padding: "10px 16px",
          fontWeight: 700,
          fontFamily: "Sora",
          fontSize: 14,
        }}
      >
        Lançar Mídia — todos os nomes
      </div>
      <div
        style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}
      >
        <PeriodoSeletor
          loja={loja}
          value={mPeriodo}
          onChange={setMPeriodo}
          permitirFuturo={permitirFuturo}
        />

        {bloqueado && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12,
              color: COLORS.error,
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              lineHeight: 1.4,
            }}
          >
            <Lock size={13} style={{ marginTop: 1, flexShrink: 0 }} />
            <span>
              <b>Mês fechado.</b> {gate.motivo}
            </span>
          </div>
        )}

        {/* TOTALIZADOR */}
        <div
          style={{
            background: bgStatus,
            border: `1.5px solid ${bordaStatus}`,
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 4 }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: COLORS.muted,
                  letterSpacing: 0.5,
                }}
              >
                TOTAL MÍDIA HOJE
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  fontFamily: "Sora",
                  color: COLORS.fg,
                  lineHeight: 1,
                  marginTop: 2,
                }}
              >
                {fmtBRL(totalValor)}
              </div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 3 }}>
                {totalQtd} {totalQtd === 1 ? "cliente" : "clientes"}
              </div>
            </div>
            {temContratado && (
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: COLORS.muted,
                    letterSpacing: 0.5,
                  }}
                >
                  CONTRATADO HOJE
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    fontFamily: "Sora",
                    color: COLORS.fg,
                    marginTop: 2,
                  }}
                >
                  {fmtBRL(contratadoDia)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: corStatus,
                    marginTop: 3,
                  }}
                >
                  {bateu
                    ? "= Bateu certo"
                    : `${diff > 0 ? "+" : ""}${fmtBRL(diff)}`}
                </div>
              </div>
            )}
          </div>
          {!temContratado && (
            <div
              style={{
                fontSize: 11,
                color: COLORS.muted,
                marginTop: 6,
                fontStyle: "italic",
              }}
            >
              Contratado do dia ainda não foi lançado.
            </div>
          )}
          {temContratado && (
            <>
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "#fff",
                  border: `1px solid ${bordaStatus}`,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: corStatus,
                    letterSpacing: 0.3,
                  }}
                >
                  {bateu && "OK · VALOR BATEU CERTO"}
                  {faltou &&
                    `ATENÇÃO · FALTAM ${fmtBRL(Math.abs(diff))} EM MÍDIA`}
                  {sobrou &&
                    `ERRO · MÍDIA EXCEDE O CONTRATADO EM ${fmtBRL(diff)}`}
                </div>
                {!bateu && (
                  <div
                    style={{
                      fontSize: 10.5,
                      color: COLORS.muted,
                      marginTop: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {faltou &&
                      "Verifique se todas as vendas têm origem de mídia lançada."}
                    {sobrou &&
                      "Possível mídia lançada em duplicidade. Quando o mesmo cliente faz 2 OS, lance só 1 mídia (com o valor total das 2 OS)."}
                  </div>
                )}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: COLORS.muted,
                  marginTop: 8,
                  lineHeight: 1.4,
                  fontStyle: "italic",
                }}
              >
                Só o VALOR precisa bater com o Contratado. A quantidade de
                clientes pode ser menor (1 cliente fazendo 2 OS = 2 vendas no
                Contratado, 1 mídia).
              </div>
            </>
          )}
        </div>

        <div
          style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}
        >
          Preencha quem trouxe cliente. Quem não trouxe, deixe zerado. No fim,{" "}
          <b>um</b> botão salva tudo.
        </div>

        {oriAtivas.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: COLORS.muted,
              fontSize: 13,
              padding: 10,
            }}
          >
            Nenhum nome cadastrado. Toque abaixo para adicionar.
          </div>
        )}

        {oriAtivas.map((o) => (
          <div
            key={o.id}
            style={{
              borderBottom: `1px solid ${COLORS.border}`,
              paddingBottom: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              {o.nome}
            </div>
            <div className="flex gap-2" style={{ alignItems: "flex-end" }}>
              <div style={{ width: 90 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: COLORS.muted,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Clientes
                </span>
                <input
                  value={mLinhas[o.id]?.qtd ?? ""}
                  onChange={(e) =>
                    setLinha(o.id, "qtd", e.target.value.replace(/\D/g, ""))
                  }
                  inputMode="numeric"
                  placeholder="0"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: 10,
                    fontSize: 14,
                    outline: "none",
                    background: "#fff",
                    textAlign: "center",
                    fontFamily: "Sora",
                    fontWeight: 700,
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: COLORS.muted,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Valor das vendas
                </span>
                <MoneyInput
                  value={mLinhas[o.id]?.valor || 0}
                  onChange={(v) => setLinha(o.id, "valor", v)}
                />
              </div>
            </div>
          </div>
        ))}

        {onIrConfig && (
          <button
            onClick={onIrConfig}
            style={{
              background: "none",
              border: "none",
              color: COLORS.teal,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
              alignSelf: "flex-start",
            }}
          >
            <Settings size={13} /> Cadastrar / gerenciar nomes
          </button>
        )}

        {erro && (
          <div
            style={{
              background: "#FEF2F2",
              color: COLORS.error,
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {erro}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={salvar}
            disabled={salvando || bloqueado}
            style={{
              ...btn(ok === "salvo" ? COLORS.success : cor),
              flex: 2,
              opacity: salvando || bloqueado ? 0.6 : 1,
              cursor: salvando || bloqueado ? "default" : "pointer",
            }}
          >
            {salvando ? (
              "Salvando…"
            ) : ok === "salvo" ? (
              <>
                <Check size={16} /> Salvo!
              </>
            ) : bloqueado ? (
              <>
                <Lock size={14} /> Mês fechado
              </>
            ) : (
              "Salvar Mídia"
            )}
          </button>
          <button
            onClick={naoTeve}
            disabled={salvando || bloqueado}
            style={{
              flex: 1,
              border: `1.5px solid ${
                ok === "naoteve" ? COLORS.success : COLORS.border
              }`,
              background: "#fff",
              color: ok === "naoteve" ? COLORS.success : COLORS.muted,
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 12.5,
              cursor: salvando || bloqueado ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              opacity: salvando || bloqueado ? 0.5 : 1,
            }}
          >
            {ok === "naoteve" ? (
              <>
                <Check size={14} /> Ok
              </>
            ) : (
              <>
                <Ban size={14} /> Não teve
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
