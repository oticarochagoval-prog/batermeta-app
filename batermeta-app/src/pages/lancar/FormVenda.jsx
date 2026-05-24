// Lançar Contratado / Faturado — porte do protótipo (linhas 787-820).
//
// Um lançamento por (loja, periodo, categoria). Se já existir, edição
// substitui e registra no edit_log (feito automaticamente em db.js).
// Suporta "não teve" (marca como zero pra fechar o dia).

import React, { useEffect, useState } from "react";
import { Ban, Check, Pencil } from "lucide-react";
import { CAT_COR, CAT_LABEL, COLORS } from "../../lib/colors.js";
import { fmtBRL, fmtCurto } from "../../lib/format.js";
import { CONFIG } from "../../lib/config.js";
import { upsertVenda } from "../../lib/db.js";
import { Field, btn, inp } from "../../ui/Field.jsx";
import MoneyInput from "../../ui/MoneyInput.jsx";
import PeriodoSeletor from "../../ui/PeriodoSeletor.jsx";

export default function FormVenda({
  loja,
  modo, // 'contratado' | 'faturado'
  lancamentos,
  permitirFuturo,
  viaMaster,
  onSaved,
}) {
  const cor = CAT_COR[modo];
  const num = (v) => parseInt(String(v), 10) || 0;
  const periodoHoje =
    loja.tipoPeriodo === "diario" ? CONFIG.hoje : `S${CONFIG.semanaAtual}`;

  const [periodo, setPeriodo] = useState(periodoHoje);
  const [valor, setValor] = useState(0);
  const [qtdVendas, setQtdVendas] = useState("");
  const [obs, setObs] = useState("");
  const [ok, setOk] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const existente = lancamentos.find(
    (l) =>
      l.lojaId === loja.id && l.periodo === periodo && l.categoria === modo
  );

  useEffect(() => {
    if (existente && !existente.naoTeve) {
      setValor(existente.valor);
      setQtdVendas(existente.qtdVendas ? String(existente.qtdVendas) : "");
      setObs(existente.obs || "");
    } else {
      setValor(0);
      setQtdVendas("");
      setObs("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, modo, existente?.id]);

  const periodoLabelCurto = (p) =>
    p.startsWith("S") ? `Semana ${p.slice(1)}` : fmtCurto(p);

  const ticketPrev = num(qtdVendas) > 0 ? valor / num(qtdVendas) : 0;

  const salvar = async () => {
    if (valor <= 0) return;
    setErro("");
    setSalvando(true);
    try {
      await upsertVenda({
        lojaId: loja.id,
        periodo,
        categoria: modo,
        valor,
        qtdVendas: num(qtdVendas),
        obs,
        naoTeve: false,
        quem: viaMaster ? "master" : "loja",
      });
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
    setErro("");
    setSalvando(true);
    try {
      await upsertVenda({
        lojaId: loja.id,
        periodo,
        categoria: modo,
        valor: 0,
        qtdVendas: 0,
        obs: "",
        naoTeve: true,
        quem: viaMaster ? "master" : "loja",
      });
      setValor(0);
      setQtdVendas("");
      setObs("");
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
        Lançar {CAT_LABEL[modo]} — total{" "}
        {loja.tipoPeriodo === "diario" ? "do dia" : "da semana"}
      </div>
      <div
        style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <PeriodoSeletor
          loja={loja}
          value={periodo}
          onChange={setPeriodo}
          permitirFuturo={permitirFuturo}
        />

        {existente && (
          <div
            style={{
              background: existente.naoTeve ? "#F1F5F9" : "#EEF2FF",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 12,
              color: COLORS.muted,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Pencil size={13} />
            {existente.naoTeve
              ? `${periodoLabelCurto(periodo)} marcado como "não teve" — salvar abaixo substitui.`
              : `Já existe ${fmtBRL(existente.valor)} em ${periodoLabelCurto(
                  periodo
                )} — editar abaixo substitui (fica registrado).`}
          </div>
        )}

        <Field label="Valor total">
          <MoneyInput value={valor} onChange={setValor} />
        </Field>

        <Field label="Nº de vendas (para o ticket médio)">
          <input
            value={qtdVendas}
            onChange={(e) => setQtdVendas(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="0"
            style={{
              ...inp,
              textAlign: "center",
              fontFamily: "Sora",
              fontWeight: 700,
            }}
          />
        </Field>

        {num(qtdVendas) > 0 && (
          <div
            style={{
              background: "#F0FDFA",
              borderRadius: 10,
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.teal,
              textAlign: "center",
            }}
          >
            Ticket médio: {fmtBRL(ticketPrev)} ({num(qtdVendas)} venda
            {num(qtdVendas) > 1 ? "s" : ""})
          </div>
        )}

        <Field label="Observação (opcional)">
          <input
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="ex: incluído sábado"
            style={inp}
          />
        </Field>

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
            disabled={salvando || valor <= 0}
            style={{
              ...btn(ok === "salvo" ? COLORS.success : cor),
              flex: 2,
              opacity: salvando || valor <= 0 ? 0.6 : 1,
              cursor: salvando || valor <= 0 ? "default" : "pointer",
            }}
          >
            {salvando ? (
              "Salvando…"
            ) : ok === "salvo" ? (
              <>
                <Check size={16} /> Salvo!
              </>
            ) : existente && !existente.naoTeve ? (
              `Atualizar ${CAT_LABEL[modo]}`
            ) : (
              `Lançar ${CAT_LABEL[modo]}`
            )}
          </button>
          <button
            onClick={naoTeve}
            disabled={salvando}
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
              cursor: salvando ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              opacity: salvando ? 0.6 : 1,
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
