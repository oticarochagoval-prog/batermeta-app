// Helpers de formatação — extraídos do protótipo (linhas 47-57).

export const fmtBRL = (n) =>
  "R$ " +
  (n || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const DOW = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
export const DOW3 = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
export const MES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const pad = (n) => String(n).padStart(2, "0");

export const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const fmtExtenso = (iso) => {
  const dt = parseISO(iso);
  return `${DOW[dt.getDay()]}, ${dt.getDate()} de ${MES[dt.getMonth()]}`;
};

export const fmtCurto = (iso) => {
  const dt = parseISO(iso);
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}`;
};

export const isWeekend = (iso) => {
  const d = parseISO(iso).getDay();
  return d === 0 || d === 6;
};
