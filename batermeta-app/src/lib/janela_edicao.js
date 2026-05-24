// Janela de edição.
//
// Regra do briefing (#5):
//   - Master: ignora janela, edita qualquer mês a qualquer momento.
//   - Gerente da loja: mês atual é livre. Mês recém-fechado pode ser
//     ajustado até `janelaEdicaoDias` (default 5) após a virada.
//     Mais antigo que isso, só o master corrige.
//
// O período do lançamento determina o "mês de referência":
//   - Diário ('2026-04-20'): mês 4, ano 2026
//   - Semanal ('S2'): semana do mês corrente (CONFIG.mes/CONFIG.ano)

import { CONFIG } from "./config.js";
import { parseISO } from "./format.js";

// Retorna { permitido, motivo } para um dado período + tipo de sessão.
// viaMaster=true → sempre permitido.
export function podeEditar(periodo, viaMaster = false) {
  if (viaMaster) return { permitido: true, motivo: null };

  // Mês de referência do período
  let mesRef, anoRef;
  if (periodo.startsWith("S")) {
    // Semanal — assumimos mês corrente
    mesRef = CONFIG.mes;
    anoRef = CONFIG.ano;
  } else {
    const dt = parseISO(periodo);
    mesRef = dt.getMonth() + 1;
    anoRef = dt.getFullYear();
  }

  // Mês atual: sempre permitido.
  if (anoRef === CONFIG.ano && mesRef === CONFIG.mes) {
    return { permitido: true, motivo: null };
  }

  // Calcula a virada do mês de referência (1º dia do mês SEGUINTE).
  const virada = new Date(anoRef, mesRef, 1); // mesRef é 1-12, então mesRef vira mes+1 em 0-11
  const hoje = parseISO(CONFIG.hoje);
  const diasDesdeVirada = Math.floor((hoje - virada) / 86400000);

  if (diasDesdeVirada < 0) {
    // Período é no futuro (improvável aqui, mas defensive).
    return { permitido: true, motivo: null };
  }

  if (diasDesdeVirada <= CONFIG.janelaEdicaoDias) {
    return { permitido: true, motivo: null };
  }

  return {
    permitido: false,
    motivo: `Mês fechado há mais de ${CONFIG.janelaEdicaoDias} dias. Só o master corrige agora.`,
  };
}
