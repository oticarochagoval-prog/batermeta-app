// Autenticação local — não usa Supabase Auth.
// O briefing diz: "Sem RLS — o sistema controla login no app".
//
// Credencial master vem hard-coded conforme briefing.
// Credencial loja vem da tabela `lojas` (campos `login` e `senha`).
//
// "Lembrar acesso" persiste a sessão em localStorage. Sem lembrar,
// recarregar o navegador volta pra tela de login.

import { listarLojas } from "../lib/db.js";

const STORAGE_KEY = "batermeta:session";

const MASTER_USER = "master";
const MASTER_PASS = "rocha@master2024";

export async function autenticar(usuario, senha) {
  const u = (usuario || "").toLowerCase().trim();
  const s = senha || "";

  if (u === MASTER_USER && s === MASTER_PASS) {
    return { ok: true, session: { type: "master" } };
  }

  // Loja: busca pela tabela.
  const lojas = await listarLojas();
  const loja = lojas.find((l) => l.login === u);
  if (!loja) return { ok: false, motivo: "credencial" };
  if (loja.ativa === false) return { ok: false, motivo: "desativada" };
  if (loja.senha !== s) return { ok: false, motivo: "credencial" };

  return { ok: true, session: { type: "loja", lojaId: loja.id } };
}

export function salvarSessao(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignora — privacy mode pode bloquear
  }
}

export function carregarSessao() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (obj && (obj.type === "master" || obj.type === "loja")) return obj;
    return null;
  } catch {
    return null;
  }
}

export function limparSessao() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignora
  }
}
