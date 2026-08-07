// Paleta extraída diretamente do protótipo (linhas 23-44).
// Não alterar sem alinhar com o protótipo: cores estão amarradas
// às categorias (Contratado/Faturado/Mídia/Orçamento/Abordador)
// e aos cabeçalhos escuros do padrão Comissão.

export const COLORS = {
  primary: "#1E3A8A",      // azul-marinho escuro (sidebar/destaques)
  tint: "#475569",         // cinza-azulado (substitui o laranja)
  bg: "#F1F5F9",           // fundo cinza claro (não branco)
  surface: "#FFFFFF",
  fg: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  success: "#15803D",      // verde mais sóbrio
  warning: "#B45309",      // âmbar sóbrio
  error: "#B91C1C",        // vermelho sóbrio
  teal: "#1E3A8A",         // mídia agora usa o mesmo azul-marinho
  roxo: "#1E40AF",         // "contratado" agora é um azul mais claro (não roxo berrante)
  gold: "#A16207",         // dourado mais terra
  metaCor: "#475569",      // META: cinza azulado (base, o mínimo)
  superCor: "#6D28D9",     // SUPER META: roxo vivo (o desafio)
  goldCor: "#B45309",      // GOLD: dourado quente (a conquista)
  inkDark: "#0B1220",      // azul quase preto do cabeçalho do Comissão
  inkSub: "#94A3B8",       // cinza claro pra label em fundo escuro
};

export const CAT_COR = {
  contratado: COLORS.roxo,
  faturado: COLORS.primary,
  midia: COLORS.teal,
  orcamento: COLORS.tint,
  abordador: "#B45309",
};

export const CAT_LABEL = {
  contratado: "Contratado",
  faturado: "Faturado",
  midia: "Mídia",
  orcamento: "Orçamento",
  abordador: "Abordador",
};
