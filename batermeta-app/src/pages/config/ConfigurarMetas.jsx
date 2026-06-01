// Configurar Metas — porte do protótipo (linhas 1524-1665).
//
// Permite editar:
//   - Tipo de período (diário vs semanal)
//   - Divisor (dias úteis ou semanas)
//   - Metas de Contratado e Faturado (Meta, Super Meta, Gold opcional)
//   - Meta do Abordador (clientes/mês — 0 desliga o módulo)
//
// Validação: Super Meta > Meta, Gold > Super Meta.

import React, { useState } from "react";
import { AlertTriangle, Calendar, Check, Star, Target, Trophy } from "lucide-react";
import { Card } from "../../ui/components.jsx";
import { CAT_COR, CAT_LABEL, COLORS } from "../../lib/colors.js";
import { CONFIG } from "../../lib/config.js";
import { fmtBRL, MES } from "../../lib/format.js";
import { salvarConfigLoja, salvarMetaAbordador } from "../../lib/db.js";
import { Field, btn, inp } from "../../ui/Field.jsx";
import MoneyInput from "../../ui/MoneyInput.jsx";

export default function ConfigurarMetas({ loja, onSaved }) {
  const [tipo, setTipo] = useState(loja.tipoPeriodo);
  const [divisor, setDivisor] = useState(
    loja.tipoPeriodo === "diario" ? loja.diasUteis : loja.semanas
  );
  const [cat, setCat] = useState("contratado");
  const [vals, setVals] = useState({
    contratado: { ...loja.metas.contratado },
    faturado: { ...loja.metas.faturado },
  });
  const [metaAb, setMetaAb] = useState(loja.metaAbordador || 0);
  const [ok, setOk] = useState(false);
  const [okAbord, setOkAbord] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const m = vals[cat];
  const setM = (campo, v) =>
    setVals({ ...vals, [cat]: { ...vals[cat], [campo]: v } });
  const divisorLabel = tipo === "diario" ? "dias úteis" : "semanas";
  const porPeriodo = (v) => (divisor ? (v || 0) / divisor : 0);
  const metaPeriodo = porPeriodo(m.meta);
  const unidade = tipo === "diario" ? "dia" : "semana";
  const erroOrdem =
    m.superMeta && m.meta && m.superMeta <= m.meta
      ? "Super Meta deve ser maior que a Meta"
      : m.gold && m.superMeta && m.gold <= m.superMeta
      ? "Gold deve ser maior que a Super Meta"
      : "";

  const salvar = async () => {
    if (erroOrdem) return;
    setErro("");
    setSalvando(true);
    try {
      await salvarConfigLoja(loja.id, {
        tipoPeriodo: tipo,
        divisor,
        metas: vals,
      });
      setOk(true);
      setTimeout(() => setOk(false), 2000);
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const salvarAbord = async (v) => {
    const valor = parseInt(String(v), 10) || 0;
    setMetaAb(valor);
    try {
      await salvarMetaAbordador(loja.id, valor);
      setOkAbord(true);
      setTimeout(() => setOkAbord(false), 1500);
      onSaved && onSaved();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErro("Não foi possível salvar a meta do abordador.");
    }
  };

  const NumPicker = ({ value, onChange }) => (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        style={{
          ...btn(COLORS.primary, {
            width: 44,
            height: 44,
            borderRadius: 99,
            padding: 0,
            fontSize: 20,
          }),
        }}
      >
        −
      </button>
      <div
        style={{
          width: 70,
          textAlign: "center",
          fontSize: 26,
          fontWeight: 800,
          fontFamily: "Sora",
          border: `1.5px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: "6px 0",
        }}
      >
        {value}
      </div>
      <button
        onClick={() => onChange(Math.min(31, value + 1))}
        style={{
          ...btn(COLORS.primary, {
            width: 44,
            height: 44,
            borderRadius: 99,
            padding: 0,
            fontSize: 20,
          }),
        }}
      >
        +
      </button>
    </div>
  );

  return (
    <>
      {/* divisor */}
      <Card style={{ padding: 16, marginBottom: 14 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            fontFamily: "Sora",
            marginBottom: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Calendar size={15} strokeWidth={1.8} color={COLORS.primary} />
          {tipo === "diario" ? "Dias úteis do mês" : "Semanas do mês"}
        </div>
        <p
          style={{
            fontSize: 12,
            color: COLORS.muted,
            marginBottom: 14,
            lineHeight: 1.5,
          }}
        >
          {tipo === "diario"
            ? "Quantos dias úteis tem este mês (sem contar sábado e domingo). A meta é dividida por esse número."
            : "Quantas semanas tem este mês. A meta é dividida por esse número."}
        </p>
        <NumPicker value={divisor} onChange={setDivisor} />
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: COLORS.muted,
            marginTop: 10,
          }}
        >
          Mês atual: {MES[CONFIG.mes - 1]} de {CONFIG.ano}
        </div>
      </Card>

      {/* metas */}
      <Card style={{ overflow: "hidden", marginBottom: 14 }}>
        <div className="flex">
          {["contratado", "faturado"].map((k) => (
            <button
              key={k}
              onClick={() => setCat(k)}
              style={{
                flex: 1,
                padding: "12px 0",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "Sora",
                background: cat === k ? CAT_COR[k] : "#fff",
                color: cat === k ? "#fff" : COLORS.muted,
                borderBottom:
                  cat === k ? "none" : `1px solid ${COLORS.border}`,
              }}
            >
              {CAT_LABEL[k]}
            </button>
          ))}
        </div>
        <div
          style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <Field label="Meta *">
              <MoneyInput
                value={m.meta || 0}
                onChange={(v) => setM("meta", v)}
              />
            </Field>
            <div
              style={{
                fontSize: 11,
                color: CAT_COR[cat],
                fontWeight: 700,
                marginTop: 5,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Target size={12} strokeWidth={1.8} /> Meta por {unidade}:{" "}
              {fmtBRL(metaPeriodo)}
            </div>
          </div>
          <div>
            <Field label="Super Meta *">
              <MoneyInput
                value={m.superMeta || 0}
                onChange={(v) => setM("superMeta", v)}
              />
            </Field>
            <div
              style={{
                fontSize: 11,
                color: CAT_COR[cat],
                fontWeight: 700,
                marginTop: 5,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Star size={12} strokeWidth={1.8} /> Super Meta por {unidade}:{" "}
              {fmtBRL(porPeriodo(m.superMeta))}
            </div>
          </div>
          <div>
            <Field label="Gold — opcional">
              <MoneyInput
                value={m.gold || 0}
                onChange={(v) => setM("gold", v)}
              />
            </Field>
            {m.gold ? (
              <div
                style={{
                  fontSize: 11,
                  color: COLORS.gold,
                  fontWeight: 700,
                  marginTop: 5,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Trophy size={12} strokeWidth={1.8} /> Gold por {unidade}:{" "}
                {fmtBRL(porPeriodo(m.gold))}
              </div>
            ) : null}
          </div>
          {erroOrdem && (
            <div
              style={{
                fontSize: 12,
                color: COLORS.error,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <AlertTriangle size={14} /> {erroOrdem}
            </div>
          )}
        </div>
      </Card>

      {/* Meta do Abordador */}
      <Card style={{ padding: 16, marginTop: 12 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.fg,
            marginBottom: 4,
          }}
        >
          Abordador
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: COLORS.muted,
            marginBottom: 12,
            lineHeight: 1.4,
          }}
        >
          Quantos clientes o abordador deve trazer por mês. Se a loja não tem
          abordador, deixa <b>0</b> e o módulo some das telas.
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={metaAb}
            onChange={(e) => salvarAbord(e.target.value)}
            style={{
              ...inp,
              width: 110,
              textAlign: "center",
              fontFamily: "Sora",
              fontWeight: 800,
              fontSize: 18,
            }}
          />
          <span style={{ fontSize: 12, color: COLORS.muted }}>
            clientes / mês
          </span>
          {okAbord && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 800,
                color: COLORS.success,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Check size={13} /> Salvo!
            </span>
          )}
          {!okAbord && metaAb > 0 && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 800,
                color: COLORS.success,
                background: "#ECFDF3",
                padding: "3px 8px",
                borderRadius: 6,
              }}
            >
              ATIVO
            </span>
          )}
          {!okAbord && metaAb === 0 && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 800,
                color: COLORS.muted,
                background: "#F1F5F9",
                padding: "3px 8px",
                borderRadius: 6,
              }}
            >
              DESLIGADO
            </span>
          )}
        </div>
      </Card>

      {erro && (
        <div
          style={{
            background: "#FEF2F2",
            color: COLORS.error,
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 12.5,
            fontWeight: 600,
            marginTop: 12,
          }}
        >
          {erro}
        </div>
      )}

      <button
        onClick={salvar}
        disabled={salvando}
        style={{
          ...btn(ok ? COLORS.success : COLORS.primary, {
            width: "100%",
            marginTop: 12,
            opacity: salvando ? 0.6 : 1,
            cursor: salvando ? "default" : "pointer",
          }),
        }}
      >
        {salvando ? (
          "Salvando…"
        ) : ok ? (
          <>
            <Check size={16} /> Configurações salvas!
          </>
        ) : (
          "Salvar configurações"
        )}
      </button>
      <p
        style={{
          fontSize: 11,
          color: COLORS.muted,
          textAlign: "center",
          marginTop: 10,
          lineHeight: 1.5,
        }}
      >
        A meta permanece a mesma o ano todo — mês a mês você só ajusta os{" "}
        {divisorLabel}.
      </p>
    </>
  );
}
