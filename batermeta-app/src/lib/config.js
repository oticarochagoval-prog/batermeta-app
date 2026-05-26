// CONFIG do sistema.
// No protótipo (linhas 60-65), "hoje" era fixo. No sistema real,
// usamos a data corrente. mes, ano e diasUteisDecorridos são
// derivados em tempo real.
//
// janelaEdicaoDias entra na Etapa 3 (Config Master), por ora fica fixo aqui.

import { toISO, parseISO, pad } from "./format.js";

function hojeISO() {
  return toISO(new Date());
}

function diasUteisAteHoje(ano, mes /* 1-12 */, hojeISOStr) {
  // Conta dias úteis (segunda a sábado) do dia 1 até "hoje", inclusive.
  // Domingo fica de fora — mesma regra do protótipo (linhas 84-91).
  const hoje = parseISO(hojeISOStr);
  let count = 0;
  for (let d = 1; d <= hoje.getDate(); d++) {
    const dt = new Date(ano, mes - 1, d);
    if (dt.getDay() !== 0) count++;
  }
  return count;
}

function semanaDoMes(hojeISOStr) {
  // Aproximação: semana 1 = dias 1-7, semana 2 = 8-14, etc.
  const d = parseISO(hojeISOStr).getDate();
  return Math.min(4, Math.ceil(d / 7));
}

function buildConfig() {
  const today = new Date();
  const ano = today.getFullYear();
  const mes = today.getMonth() + 1;
  const hoje = hojeISO();
  return {
    ano,
    mes,
    hoje,
    diasUteisDecorridos: diasUteisAteHoje(ano, mes, hoje),
    semanaAtual: semanaDoMes(hoje),
    janelaEdicaoDias: 5, // (futuro) virá de master_config.janela_edicao_dias
  };
}

export const CONFIG = buildConfig();

/**
 * Hidrata o CONFIG com valores vindos da tabela master_config.
 * Mutates `CONFIG` in place — chame uma vez no boot (App.jsx) antes
 * de pintar a UI. Se a tabela não estiver disponível, mantém defaults.
 */
export async function hidratarConfigDoServidor(listarMasterConfig) {
  try {
    const cfg = await listarMasterConfig();
    if (cfg.janela_edicao_dias != null) {
      const n = parseInt(String(cfg.janela_edicao_dias), 10);
      if (Number.isFinite(n) && n >= 0) CONFIG.janelaEdicaoDias = n;
    }
    if (cfg.nome_rede) CONFIG.nomeRede = String(cfg.nome_rede);
    if (cfg.senha_master) CONFIG.senhaMaster = String(cfg.senha_master);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[config] hidrate falhou, usando defaults:", e.message);
  }
}

// Dias do mês corrente, úteis + sábados (p/ lançar). Domingo fica de fora.
// Espelha a constante DIAS_MES do protótipo (linhas 84-91), mas dinâmica.
export const DIAS_MES = (() => {
  const out = [];
  const ultimoDia = new Date(CONFIG.ano, CONFIG.mes, 0).getDate();
  for (let d = 1; d <= ultimoDia; d++) {
    const iso = `${CONFIG.ano}-${pad(CONFIG.mes)}-${pad(d)}`;
    if (parseISO(iso).getDay() !== 0) out.push(iso);
  }
  return out;
})();

export const SEMANAS = [1, 2, 3, 4];
