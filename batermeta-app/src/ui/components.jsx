// Componentes de UI base — portados do protótipo.
// Card (307), Header (1886), TabBar (1859), ProgressBar (350),
// MetaLinha (432), BlocoMeta (447), AvisoIncompleto (497), EmBreve (1879).

import React from "react";
import {
  ArrowLeft,
  LogOut,
  Target,
  Star,
  Trophy,
  Ticket,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { COLORS, CAT_LABEL } from "../lib/colors.js";
import { fmtBRL } from "../lib/format.js";
import { barColor } from "../lib/calc.js";

export const Card = ({ children, style, ...rest }) => (
  <div
    {...rest}
    style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      boxShadow: "0 1px 2px rgba(15,23,42,.04)",
      ...style,
    }}
  >
    {children}
  </div>
);

export function Header({ titulo, sub, onSair, onBack }) {
  return (
    <div
      style={{
        background: COLORS.inkDark,
        color: "#fff",
        padding: "14px 16px",
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: "rgba(255,255,255,.10)",
                border: "none",
                borderRadius: 8,
                padding: 5,
                cursor: "pointer",
                color: "#fff",
                display: "flex",
              }}
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                fontFamily: "Sora",
                letterSpacing: -0.2,
              }}
            >
              {titulo}
            </div>
            {sub && (
              <div style={{ fontSize: 12, color: COLORS.inkSub }}>{sub}</div>
            )}
          </div>
        </div>
        {onSair && (
          <button
            onClick={onSair}
            style={{
              background: "rgba(255,255,255,.10)",
              border: "none",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <LogOut size={13} /> Sair
          </button>
        )}
      </div>
    </div>
  );
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <div
      className="flex"
      style={{
        borderTop: `1px solid ${COLORS.border}`,
        background: "#fff",
        position: "sticky",
        bottom: 0,
      }}
    >
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              flex: 1,
              border: "none",
              background: "none",
              padding: "8px 0 10px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              position: "relative",
              color: isActive ? COLORS.primary : COLORS.muted,
            }}
          >
            <t.icon size={20} strokeWidth={isActive ? 2 : 1.6} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>
              {t.label}
            </span>
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "30%",
                  right: "30%",
                  height: 2,
                  background: COLORS.primary,
                  borderRadius: 2,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ProgressBar({ pct, cor }) {
  const w = Math.max(0, Math.min(100, pct));
  return (
    <div
      style={{
        height: 9,
        background: "#EEF2F7",
        borderRadius: 99,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${w}%`,
          height: "100%",
          background: cor || barColor(pct),
          borderRadius: 99,
          transition: "width .5s ease",
        }}
      />
    </div>
  );
}

export function MetaLinha({ Icon, nome, valor, pct, sub, cor }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="flex items-baseline justify-between" style={{ marginBottom: 5 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.fg,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {Icon && (
            <Icon size={14} color={cor || COLORS.muted} strokeWidth={1.8} />
          )}
          {nome} ·{" "}
          <span style={{ fontFamily: "Sora", fontWeight: 700 }}>
            {fmtBRL(valor)}
          </span>
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            fontFamily: "Sora",
            color: barColor(pct),
          }}
        >
          {pct.toFixed(1)}%
        </span>
      </div>
      <ProgressBar pct={pct} />
      {sub && (
        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 5 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function BlocoMeta({ titulo, cor, calc }) {
  const cd = calc.diferenca >= 0;
  const linhaSub = (valorNivel) => {
    const porPer = calc.divisor > 0 ? valorNivel / calc.divisor : 0;
    const esperado = porPer * calc.decorridos;
    const dif = calc.acumulado - esperado;
    const cred = dif >= 0;
    return (
      <span>
        Meta/{calc.unidade} {fmtBRL(porPer)} · Acumulado{" "}
        {fmtBRL(calc.acumulado)} · Esperado {fmtBRL(esperado)}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            marginLeft: 6,
            color: cred ? COLORS.success : COLORS.error,
            fontWeight: 700,
          }}
        >
          {cred ? (
            <TrendingUp size={11} strokeWidth={2} />
          ) : (
            <TrendingDown size={11} strokeWidth={2} />
          )}
          {cred ? "Crédito" : "Débito"} {fmtBRL(Math.abs(dif))}
        </span>
      </span>
    );
  };
  return (
    <Card style={{ overflow: "hidden", marginBottom: 14 }}>
      <div
        style={{
          background: cor,
          padding: "10px 16px",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          fontFamily: "Sora",
        }}
      >
        {titulo}
      </div>
      <div style={{ padding: 16 }}>
        <MetaLinha
          Icon={Target}
          cor={COLORS.metaCor}
          nome="Meta"
          valor={calc.metas.meta}
          pct={calc.pctMeta}
          sub={linhaSub(calc.metas.meta)}
        />
        {calc.metas.superMeta ? (
          <MetaLinha
            Icon={Star}
            cor={COLORS.superCor}
            nome="Super Meta"
            valor={calc.metas.superMeta}
            pct={calc.pctSuper}
            sub={linhaSub(calc.metas.superMeta)}
          />
        ) : null}
        {calc.metas.gold ? (
          <MetaLinha
            Icon={Trophy}
            cor={COLORS.goldCor}
            nome="Gold"
            valor={calc.metas.gold}
            pct={calc.pctGold}
            sub={linhaSub(calc.metas.gold)}
          />
        ) : null}

        <div
          className="flex items-center gap-2"
          style={{
            marginTop: 4,
            padding: "8px 12px",
            borderRadius: 10,
            background: cd ? "#ECFDF3" : "#FEF2F2",
            color: cd ? COLORS.success : COLORS.error,
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {cd ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {cd ? "Crédito" : "Débito"} {fmtBRL(Math.abs(calc.diferenca))}
          <span
            style={{
              marginLeft: "auto",
              fontWeight: 500,
              color: COLORS.muted,
              fontSize: 11,
            }}
          >
            vs. esperado
          </span>
        </div>

        <div
          className="flex items-center gap-2"
          style={{
            marginTop: 8,
            padding: "8px 12px",
            borderRadius: 10,
            background: "#F8FAFF",
            fontSize: 12.5,
            color: COLORS.fg,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: COLORS.muted,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ticket size={13} strokeWidth={1.8} /> Ticket médio
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontWeight: 800,
              fontFamily: "Sora",
              color: cor,
            }}
          >
            {calc.qtdMes > 0 ? fmtBRL(calc.ticketMes) : "—"}
          </span>
          <span
            style={{ fontWeight: 500, color: COLORS.muted, fontSize: 11 }}
          >
            · {calc.qtdMes} venda{calc.qtdMes === 1 ? "" : "s"} no mês
          </span>
        </div>
      </div>
    </Card>
  );
}

export function AvisoIncompleto({ status, onIr, periodoLabel }) {
  if (status.completo) return null;
  return (
    <Card
      style={{
        background: "#FFFBEB",
        border: `1px solid #FDE68A`,
        padding: 14,
        marginBottom: 14,
      }}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle
          size={18}
          color={COLORS.warning}
          style={{ marginTop: 1, flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#92400E" }}>
            {periodoLabel} ainda está incompleto
          </div>
          <div style={{ fontSize: 12, color: "#B45309", marginTop: 2 }}>
            Falta lançar:{" "}
            {status.faltam.map((k) => CAT_LABEL[k]).join(", ")}
          </div>
          <button
            onClick={onIr}
            style={{
              background: COLORS.warning,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "7px 12px",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            <Plus size={14} /> Ir para Lançar
          </button>
        </div>
      </div>
    </Card>
  );
}

export function AvisoAtrasados({ dias, onLancarDia }) {
  // Sem atraso → aviso verde "tudo em dia".
  if (!dias || dias.length === 0) {
    return (
      <Card
        style={{
          background: "#F0FDF4",
          border: "1px solid #BBF7D0",
          padding: 14,
          marginBottom: 14,
        }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} color={COLORS.success} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#15803D" }}>
              Tudo em dia!
            </div>
            <div style={{ fontSize: 12, color: "#16A34A", marginTop: 1 }}>
              Nenhum dia útil (seg–sex) atrasado neste mês.
            </div>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <Card
      style={{
        background: "#FFFBEB",
        border: "1px solid #FDE68A",
        padding: 14,
        marginBottom: 14,
      }}
    >
      <div className="flex items-start gap-2" style={{ marginBottom: 4 }}>
        <AlertTriangle
          size={18}
          color={COLORS.warning}
          style={{ marginTop: 1, flexShrink: 0 }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#92400E" }}>
            {dias.length === 1
              ? "1 dia útil sem lançar"
              : `${dias.length} dias úteis sem lançar`}
          </div>
          <div style={{ fontSize: 11.5, color: "#B45309", marginTop: 2 }}>
            O dia de hoje não conta (ainda não acabou). Toque pra lançar cada dia:
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 7 }}>
        {dias.map((d) => (
          <div
            key={d.periodo}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              background: "#fff",
              border: "1px solid #FDE68A",
              borderRadius: 10,
              padding: "8px 10px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#92400E" }}>
                {d.label}
              </div>
              <div style={{ fontSize: 10.5, color: COLORS.warning, marginTop: 1 }}>
                Falta: {d.faltam.map((k) => CAT_LABEL[k]).join(", ")}
              </div>
            </div>
            <button
              onClick={() => onLancarDia && onLancarDia(d.periodo)}
              style={{
                background: COLORS.warning,
                color: "#fff",
                border: "none",
                borderRadius: 9,
                padding: "8px 12px",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <Plus size={13} /> Lançar
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function EmBreve({ nome, descricao }) {
  return (
    <div style={{ padding: 60, textAlign: "center", color: COLORS.muted }}>
      <Sparkles
        size={32}
        style={{ margin: "0 auto 10px", display: "block", opacity: 0.4 }}
      />
      <div style={{ fontWeight: 700, color: COLORS.fg }}>{nome}</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>
        {descricao || "Módulo na próxima iteração."}
      </div>
    </div>
  );
}
