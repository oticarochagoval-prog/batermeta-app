// WhatsModal — gera relatório (Diário OU Mensal) e copia/envia ao WhatsApp.
//
// FIX (01/06/2026): adicionado toggle "Dia | Mês":
//   • "Dia" — comportamento original (resumo de um dia/semana específica)
//   • "Mês" — fechamento do mês selecionado (busca dados frescos do mês alvo)
//
// Default quando abre:
//   • Se hoje for dia 1-5 do mês → assume que usuário quer fechar mês anterior
//     (defaultMes/defaultAno = mês passado, aba já abre em "Mês")
//   • Caso contrário → abre em "Dia" como antes

import React, { useEffect, useState } from "react";
import {
  Calendar,
  CalendarDays,
  Check,
  FileText,
  Send,
  X,
} from "lucide-react";
import { COLORS } from "../lib/colors.js";
import { CONFIG } from "../lib/config.js";
import { DOW, MES, fmtCurto, parseISO } from "../lib/format.js";
import { montaMsg, montaMsgMensal } from "../lib/whats.js";
import {
  listarLancamentos,
  listarMidias,
  listarOrcamentos,
  listarOrigens,
} from "../lib/db.js";
import { CalendarModal } from "./Calendar.jsx";
import { inp, btn } from "./Field.jsx";

export default function WhatsModal({
  loja,
  lancamentos,
  midias,
  orcamentos,
  onClose,
}) {
  const diario = loja.tipoPeriodo === "diario";
  const periodoHoje = diario ? CONFIG.hoje : `S${CONFIG.semanaAtual}`;

  // fix6.2: o relatório abre SEMPRE no mês atual (aba "Dia" com hoje).
  // Se o usuário quiser um mês fechado anterior, troca pra aba "Mês" e
  // usa o seletor de mês. Antes, no início do mês (dia 1-5), abria
  // direto no mês passado — o que confundia.
  const defaultMes = CONFIG.mes;
  const defaultAno = CONFIG.ano;

  const [aba, setAba] = useState("dia");

  // Aba "Dia"
  const [alvo, setAlvo] = useState(periodoHoje);
  const [showCal, setShowCal] = useState(false);

  // Aba "Mês"
  const [mesAlvo, setMesAlvo] = useState(defaultMes);
  const [anoAlvo, setAnoAlvo] = useState(defaultAno);
  const [dadosMes, setDadosMes] = useState(null);
  const [carregandoMes, setCarregandoMes] = useState(false);
  const [erroMes, setErroMes] = useState("");

  const [copiado, setCopiado] = useState(false);

  // Quando entra na aba "Mês" ou troca o mês, busca dados frescos do banco
  useEffect(() => {
    if (aba !== "mes") return;
    let cancelado = false;
    (async () => {
      setCarregandoMes(true);
      setErroMes("");
      try {
        const [l, m, o, ori] = await Promise.all([
          listarLancamentos(loja.id, mesAlvo, anoAlvo),
          listarMidias(loja.id, mesAlvo, anoAlvo),
          listarOrcamentos(loja.id, mesAlvo, anoAlvo),
          listarOrigens(loja.id),
        ]);
        if (!cancelado) {
          setDadosMes({ lancamentos: l, midias: m, orcamentos: o, origens: ori });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        if (!cancelado)
          setErroMes("Não foi possível carregar os dados desse mês.");
      } finally {
        if (!cancelado) setCarregandoMes(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [aba, mesAlvo, anoAlvo, loja.id]);

  // Constrói a mensagem
  let msg = "";
  if (aba === "dia") {
    msg = montaMsg(loja, lancamentos, midias, orcamentos, alvo);
  } else if (dadosMes) {
    msg = montaMsgMensal(
      loja,
      dadosMes.lancamentos,
      dadosMes.midias,
      dadosMes.orcamentos,
      dadosMes.origens,
      mesAlvo,
      anoAlvo
    );
  } else {
    msg = "Carregando…";
  }

  const copiar = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(msg);
      } else {
        const ta = document.createElement("textarea");
        ta.value = msg;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      setCopiado(false);
    }
  };

  // Opções de meses pra dropdown: últimos 12 meses
  const opcoesMes = (() => {
    const out = [];
    let m = CONFIG.mes;
    let a = CONFIG.ano;
    for (let i = 0; i < 12; i++) {
      out.push({ mes: m, ano: a, label: `${MES[m - 1]}/${a}` });
      m--;
      if (m < 1) {
        m = 12;
        a--;
      }
    }
    return out;
  })();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "18px 18px 0 0",
          width: "100%",
          maxWidth: 440,
          padding: 18,
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: 12 }}
        >
          <span style={{ fontWeight: 800, fontFamily: "Sora" }}>
            Relatório — WhatsApp
          </span>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#F1F5F9",
              borderRadius: 8,
              padding: 5,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Toggle Dia | Mês */}
        <div className="flex gap-2" style={{ marginBottom: 14 }}>
          <button
            onClick={() => setAba("dia")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              border: `1.5px solid ${COLORS.teal}`,
              background: aba === "dia" ? COLORS.teal : "#fff",
              color: aba === "dia" ? "#fff" : COLORS.teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Calendar size={15} /> {diario ? "Dia" : "Semana"}
          </button>
          <button
            onClick={() => setAba("mes")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              border: `1.5px solid ${COLORS.primary}`,
              background: aba === "mes" ? COLORS.primary : "#fff",
              color: aba === "mes" ? "#fff" : COLORS.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <CalendarDays size={15} /> Mês fechado
          </button>
        </div>

        {/* SELETOR DA ABA "DIA" */}
        {aba === "dia" && diario && (
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.muted,
                marginBottom: 4,
              }}
            >
              RELATÓRIO DE QUAL DIA?
            </div>
            <button
              onClick={() => setShowCal(true)}
              style={{
                ...inp,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>
                {fmtCurto(alvo)} — {DOW[parseISO(alvo).getDay()]}
                {alvo === CONFIG.hoje ? " (hoje)" : ""}
              </span>
              <Calendar size={16} color={COLORS.teal} />
            </button>
            <div
              style={{
                fontSize: 11,
                color: COLORS.muted,
                marginTop: 5,
              }}
            >
              Esqueceu de mandar um dia? Escolha a data e o relatório se monta
              com os números daquele dia.
            </div>
            {showCal && (
              <CalendarModal
                valueISO={alvo}
                onPick={setAlvo}
                onClose={() => setShowCal(false)}
              />
            )}
          </div>
        )}

        {aba === "dia" && !diario && (
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.muted,
                marginBottom: 4,
              }}
            >
              RELATÓRIO DE QUAL SEMANA?
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setAlvo(`S${s}`)}
                  disabled={s > CONFIG.semanaAtual}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 9,
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "Sora",
                    cursor: s > CONFIG.semanaAtual ? "default" : "pointer",
                    border: `1.5px solid ${
                      alvo === `S${s}` ? COLORS.teal : COLORS.border
                    }`,
                    background:
                      alvo === `S${s}`
                        ? COLORS.teal
                        : s > CONFIG.semanaAtual
                        ? "#F8FAFC"
                        : "#fff",
                    color:
                      alvo === `S${s}`
                        ? "#fff"
                        : s > CONFIG.semanaAtual
                        ? "#CBD5E1"
                        : COLORS.fg,
                  }}
                >
                  S{s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SELETOR DA ABA "MÊS" */}
        {aba === "mes" && (
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: COLORS.muted,
                marginBottom: 4,
              }}
            >
              RELATÓRIO DE QUAL MÊS?
            </div>
            <select
              value={`${mesAlvo}-${anoAlvo}`}
              onChange={(e) => {
                const [m, a] = e.target.value.split("-").map(Number);
                setMesAlvo(m);
                setAnoAlvo(a);
              }}
              style={{
                ...inp,
                cursor: "pointer",
                fontWeight: 700,
                color: COLORS.primary,
              }}
            >
              {opcoesMes.map((o) => (
                <option key={`${o.mes}-${o.ano}`} value={`${o.mes}-${o.ano}`}>
                  {o.label}
                  {o.mes === CONFIG.mes && o.ano === CONFIG.ano
                    ? " (atual)"
                    : ""}
                </option>
              ))}
            </select>
            <div
              style={{
                fontSize: 11,
                color: COLORS.muted,
                marginTop: 5,
              }}
            >
              Fechamento do mês inteiro. Use no dia 1º pra enviar o resumo do
              mês passado, ou pra consultar meses anteriores.
            </div>
          </div>
        )}

        {/* MENSAGEM */}
        {aba === "mes" && carregandoMes ? (
          <div
            style={{
              padding: 30,
              textAlign: "center",
              color: COLORS.muted,
              fontSize: 13,
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
            }}
          >
            Carregando dados de {MES[mesAlvo - 1]}/{anoAlvo}…
          </div>
        ) : erroMes ? (
          <div
            style={{
              padding: 16,
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: COLORS.error,
              borderRadius: 12,
              fontSize: 13,
            }}
          >
            {erroMes}
          </div>
        ) : (
          <pre
            style={{
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: 14,
              fontSize: 12.5,
              whiteSpace: "pre-wrap",
              fontFamily: "Manrope",
              color: COLORS.fg,
              lineHeight: 1.5,
            }}
          >
            {msg}
          </pre>
        )}

        <button
          onClick={copiar}
          disabled={aba === "mes" && (carregandoMes || !!erroMes)}
          style={{
            ...btn(copiado ? COLORS.success : COLORS.primary, {
              width: "100%",
              marginTop: 12,
              opacity: aba === "mes" && (carregandoMes || !!erroMes) ? 0.6 : 1,
              cursor:
                aba === "mes" && (carregandoMes || !!erroMes)
                  ? "default"
                  : "pointer",
            }),
          }}
        >
          {copiado ? (
            <>
              <Check size={16} /> Copiado! Cole no grupo do WhatsApp
            </>
          ) : (
            <>
              <FileText size={16} /> Copiar relatório
            </>
          )}
        </button>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: 8,
            width: "100%",
            padding: "11px",
            borderRadius: 10,
            border: `1.5px solid ${COLORS.border}`,
            background: "#fff",
            color: COLORS.muted,
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Send size={15} /> Abrir WhatsApp direto
        </a>

        <p
          style={{
            fontSize: 11,
            color: COLORS.muted,
            textAlign: "center",
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          Recomendado: toque em <b>Copiar relatório</b> e cole no grupo. É o
          jeito que sempre funciona, sem o aviso do navegador.
        </p>
      </div>
    </div>
  );
}
