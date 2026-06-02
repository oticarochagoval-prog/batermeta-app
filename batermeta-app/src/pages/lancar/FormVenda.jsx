// Lançar Contratado / Faturado — porte do protótipo (linhas 787-820).
//
// Um lançamento por (loja, periodo, categoria). Se já existir, edição
// substitui e registra no edit_log (feito automaticamente em db.js).
// Suporta "não teve" (marca como zero pra fechar o dia).

import React, { useEffect, useState } from "react";
import { Ban, Check, Lock, Pencil } from "lucide-react";
import { CAT_COR, CAT_LABEL, COLORS } from "../../lib/colors.js";
import { fmtBRL, fmtCurto } from "../../lib/format.js";
import { CONFIG } from "../../lib/config.js";
import { upsertVenda, buscarLancamento } from "../../lib/db.js";
import { podeEditar } from "../../lib/janela_edicao.js";
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
  mesView,
  anoView,
  periodoInicial,
}) {
  const cor = CAT_COR[modo];
  const num = (v) => parseInt(String(v), 10) || 0;

  // Default do período (todas as lojas são diárias):
  // - se veio periodoInicial (clique num dia atrasado) → usa ele
  // - mês ATUAL → "hoje"
  // - outro mês → último dia desse mês
  const ehMesAtual =
    !mesView || (mesView === CONFIG.mes && anoView === CONFIG.ano);
  let periodoHoje;
  if (periodoInicial) {
    periodoHoje = periodoInicial;
  } else if (ehMesAtual) {
    periodoHoje = CONFIG.hoje;
  } else {
    const ultimoDia = new Date(anoView, mesView, 0).getDate();
    periodoHoje = `${anoView}-${String(mesView).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  }

  const [periodo, setPeriodo] = useState(periodoHoje);
  const [valor, setValor] = useState(0);
  const [qtdVendas, setQtdVendas] = useState("");
  const [obs, setObs] = useState("");
  const [ok, setOk] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // Lançamento existente para (loja, periodo, categoria).
  // FIX (Bug C): em vez de procurar no array `lancamentos` — que só
  // contém o mês visualizado —, busca direto no banco sempre que a
  // data muda. Assim escolher uma data de outro mês no calendário
  // carrega o valor certo, não R$ 0.
  const [existente, setExistente] = useState(null);
  const [carregandoExist, setCarregandoExist] = useState(false);

  useEffect(() => {
    let cancelado = false;
    // Otimização: se o periodo estiver no array já carregado, usa ele
    // na hora (sem flicker) — e ainda assim confirma com o banco.
    const noArray = lancamentos.find(
      (l) =>
        l.lojaId === loja.id && l.periodo === periodo && l.categoria === modo
    );
    if (noArray) setExistente(noArray);
    setCarregandoExist(true);
    (async () => {
      try {
        const achado = await buscarLancamento(loja.id, periodo, modo);
        if (!cancelado) setExistente(achado);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[FormVenda] buscarLancamento:", e);
        if (!cancelado && !noArray) setExistente(null);
      } finally {
        if (!cancelado) setCarregandoExist(false);
      }
    })();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, modo, loja.id]);

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
  }, [periodo, modo, existente?.id, existente?.naoTeve]);

  const periodoLabelCurto = (p) =>
    p.startsWith("S") ? `Semana ${p.slice(1)}` : fmtCurto(p);

  const ticketPrev = num(qtdVendas) > 0 ? valor / num(qtdVendas) : 0;

  // BLOQUEIO EFETIVO da janela de edição (regra de negócio #5).
  // Master sempre pode (viaMaster=true). Gerente respeita janela.
  const gate = podeEditar(periodo, viaMaster);
  const bloqueado = !gate.permitido;

  const salvar = async () => {
    if (valor <= 0) return;
    if (bloqueado) {
      setErro(gate.motivo);
      return;
    }
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
      // Atualiza a faixa "já existe" mesmo que a data editada esteja
      // fora do mês visualizado (onSaved só recarrega o mês visto).
      try {
        setExistente(await buscarLancamento(loja.id, periodo, modo));
      } catch (_) {
        /* ignora */
      }
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
      try {
        setExistente(await buscarLancamento(loja.id, periodo, modo));
      } catch (_) {
        /* ignora */
      }
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
        Lançar {CAT_LABEL[modo]} — total do dia
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
            disabled={salvando || valor <= 0 || bloqueado}
            style={{
              ...btn(ok === "salvo" ? COLORS.success : cor),
              flex: 2,
              opacity: salvando || valor <= 0 || bloqueado ? 0.6 : 1,
              cursor:
                salvando || valor <= 0 || bloqueado ? "default" : "pointer",
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
            ) : existente && !existente.naoTeve ? (
              `Atualizar ${CAT_LABEL[modo]}`
            ) : (
              `Lançar ${CAT_LABEL[modo]}`
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
