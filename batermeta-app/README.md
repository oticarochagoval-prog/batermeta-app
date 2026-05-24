# BaterMeta

Sistema de acompanhamento de metas das óticas (Rocha 1-11 + GV Optical).
Frontend React + Vite. Backend Supabase. Hospedado no Vercel.

> Este é o resultado da **Etapa 2**: tela de Lançar funcionando
> (Contratado, Faturado, Mídia, Orçamento, Abordador) + modal de
> WhatsApp + CRUD real no Supabase. As telas de Relatórios, Config e
> Painel Master entram na Etapa 3.

---

## 1. Rodar localmente

```bash
npm install
cp .env.example .env.local
# Abra .env.local e cole a anon key do projeto Supabase `batermeta`.
npm run dev
```

Acesse http://localhost:5173

---

## 2. Migrações novas da Etapa 2 (SQL Editor do Supabase)

Rode na ordem, **só as 005 e 006** (as 001-004 já foram rodadas na Etapa 1).

| Arquivo | O que faz |
|---|---|
| `supabase/migrations/005_seed_origens.sql` | Cadastra 6 origens padrão (Abordador, Cliente, Indicação, Passando, Google, Instagram) pras 12 lojas |
| `supabase/migrations/006_edit_log_schema.sql` | Garante colunas no `edit_log` (tipo, periodo, de, para, quem, quando) |

Todas idempotentes. Pode rodar de novo sem medo.

---

## 3. Funcionalidades da Etapa 2

### Tela Lançar (aba "+" na barra inferior)

5 sub-abas no topo:

1. **Contratado** — total do dia, MoneyInput estilo máquina, nº de vendas (calcula ticket médio ao vivo), observação, "Não teve". Substitui se já existir e registra no `edit_log`.
2. **Faturado** — idêntico ao Contratado, mas pra faturamento.
3. **Mídia** — lista única com todas as origens ativas da loja. Preenche tudo e salva de uma vez. Totalizador inteligente comparando com Contratado do mesmo dia (alerta se faltou ou sobrou).
4. **Orçamento** — lista mensal de clientes que pediram orçamento. Filtros: hoje/semana/mês/só pendentes. Marcar comprou tocando na bolinha.
5. **Abordador** — lista mensal de clientes trazidos pelo abordador. Flag PROMOÇÃO existe APENAS aqui (não em Mídia, não em Orçamento). Header mostra meta de clientes do mês. **Aba some completamente se `meta_abordador = 0`.**

### Modal de WhatsApp

Botão verde no Dashboard ("Enviar Relatório via WhatsApp") abre modal que:
- Permite escolher qual dia (calendário) ou qual semana (S1-S4)
- Monta a mensagem formatada (Contratado, Faturado, Mídia, Orçamento)
- Botão "Copiar relatório" pro clipboard
- Link "Abrir WhatsApp direto" (wa.me)

### Janela de edição

- **Gerente da loja:** mês atual é livre. Mês recém-fechado pode ser ajustado até **5 dias** após a virada (configurável depois pelo master). Depois, só o master corrige.
- **Master:** ignora a janela. Edita qualquer dia de qualquer mês. Toda alteração fica em `edit_log` com `quem='master'`.

> A interface mostra um banner no topo da tela Lançar explicando a regra.
> Hoje em dia o gate é informativo — qualquer um pode salvar; bloqueio
> efetivo entra na Etapa 3 junto com Config Master.

---

## 4. Credenciais

Iguais à Etapa 1.

- **Loja:** `rocha1` / `rocha1`, …, `gvoptical` / `gvoptical`
- **Master:** `master` / `rocha@master2024`

---

## 5. Publicar no GitHub e Vercel (via Claude Code)

Quando o Claude Code subir essa nova versão:

```
sobe a Etapa 2 do BaterMeta. faz commit, push pra main, Vercel
faz deploy automático.
```

---

## 6. Estrutura do código

```
src/
├── App.jsx                      Root: sessão + roteamento
├── main.jsx                     Bootstrap React
├── index.css                    CSS global mínimo
├── auth/
│   ├── Login.jsx                Tela de login (limpa, sem dica de credenciais)
│   └── session.js               autenticar() + localStorage
├── lib/
│   ├── supabase.js              Cliente
│   ├── colors.js                Paleta exata do protótipo
│   ├── format.js                fmtBRL, parseISO, etc.
│   ├── config.js                CONFIG: mês corrente, dias úteis, semana
│   ├── calc.js                  calcMeta(), statusDia()
│   ├── db.js                    Acesso ao Supabase (CRUD completo)
│   ├── janela_edicao.js         Regra de janela de edição
│   └── whats.js                 montaMsg() pra WhatsApp
├── ui/
│   ├── components.jsx           Card, Header, TabBar, BlocoMeta
│   ├── Field.jsx                Field, inp, btn (compartilhados)
│   ├── MoneyInput.jsx           Campo de dinheiro estilo máquina
│   ├── Calendar.jsx             CalendarModal + DateField
│   ├── PeriodoSeletor.jsx       Data (diário) ou S1-S4 (semanal)
│   └── WhatsModal.jsx           Modal de envio de relatório
└── pages/
    ├── Dashboard.jsx            Dashboard da loja (Etapa 1)
    ├── LojaApp.jsx              Shell + roteamento das 4 abas
    ├── MasterApp.jsx            Stub (Etapa 3)
    ├── Lancar.jsx               Orquestra os 5 modos
    └── lancar/
        ├── FormVenda.jsx        Contratado / Faturado
        ├── FormMidia.jsx        Mídia (lista única + totalizador)
        ├── FormOrcamento.jsx    Orçamento (lista de clientes)
        └── FormAbordador.jsx    Abordador (lista + promoção + meta)
```

---

## 7. O que ainda falta (Etapa 3)

- **Relatórios** da loja: tabelas por categoria, ranking de origens, lista completa de orçamentos e abordadores do mês
- **Visão Master** consolidada: KPIs por loja, comparativo entre lojas
- **Ranking de Mídia** (master): qual origem traz mais clientes/valor por loja
- **Config Loja:** editar metas, gerenciar origens (criar/arquivar/reativar), trocar senha da loja
- **Config Master:**
  - Lojas: criar/desativar/renomear, redefinir senha de loja, **redefinir senha do master** (mover de hard-coded pra `master_config`)
  - Janela de edição: configurar `janelaEdicaoDias`
  - Conta
- **Histórico mensal real** (3 meses anteriores) para o comparativo "Mês atual x Melhor mês" no Dashboard
- **Bloqueio efetivo** da janela de edição pra gerente da loja
