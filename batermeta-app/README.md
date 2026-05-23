# BaterMeta

Sistema de acompanhamento de metas das óticas (Rocha 1-11 + GV Optical).
Frontend React + Vite. Backend Supabase. Hospedado no Vercel.

> Este é o resultado da **Etapa 1**: estrutura base + login + dashboard
> inicial (modo visualização). As telas de Lançar, Relatórios, Config e
> Painel Master entram nas próximas etapas.

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

## 2. Rodar as migrações no Supabase

Antes do primeiro login funcionar, rode os 4 SQLs no **SQL Editor** do
painel Supabase, na ordem:

| Arquivo | O que faz |
|---|---|
| `supabase/migrations/001_add_meta_abordador.sql` | Adiciona `lojas.meta_abordador` |
| `supabase/migrations/002_add_promocao_abordador.sql` | Adiciona `abordadores.promocao` |
| `supabase/migrations/003_lojas_schema_defensivo.sql` | Garante colunas + UNIQUE no login |
| `supabase/migrations/004_seed_lojas.sql` | **Opcional.** Insere as 12 lojas iniciais com as metas do protótipo |

Todos são idempotentes (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`),
pode rodar de novo sem medo.

> **Se você já tem a tabela `lojas` populada manualmente**, pule a 004
> e ajuste a 003 se o schema diferir do esperado (ela tenta apenas
> ADICIONAR colunas que faltarem).

---

## 3. Credenciais

Conforme briefing:

- **Loja:** `rocha1` / `rocha1`, `rocha2` / `rocha2`, …, `gvoptical` / `gvoptical`
- **Master:** `master` / `rocha@master2024`

A senha do master é hard-coded no app (`src/auth/session.js`).
A senha das lojas vem da tabela `lojas.senha` — podem ser trocadas pelo
master no Config Master (Etapa 3).

---

## 4. Publicar no GitHub e Vercel (via Claude Code)

Abra o Claude Code do seu computador dentro desta pasta e diga:

> publica no GitHub e Vercel igual fizemos com comissao-rocha-app

O Claude Code já sabe os teus padrões:
- GitHub `oticarochagoval-prog`
- Vercel `oticarochagoval-7334s-projects`

Depois do deploy, vá em **Vercel > Project Settings > Environment Variables**
e configure:

```
VITE_SUPABASE_URL       = https://ztckueiecmzudvaaslbl.supabase.co
VITE_SUPABASE_ANON_KEY  = <a anon key do painel Supabase>
```

Redeploy. O sistema estará no ar em `batermeta-app.vercel.app`.

---

## 5. Estrutura do código

```
src/
├── App.jsx                  Root: estado de sessão + roteamento
├── main.jsx                 Bootstrap React
├── index.css                CSS global mínimo (utility classes)
├── auth/
│   ├── Login.jsx            Tela de login (eye toggle, lembrar acesso)
│   └── session.js           autenticar() + localStorage
├── lib/
│   ├── supabase.js          Cliente
│   ├── colors.js            Paleta exata do protótipo
│   ├── format.js            fmtBRL, parseISO, fmtExtenso, etc.
│   ├── config.js            CONFIG: mês corrente, dias úteis, semana
│   ├── calc.js              calcMeta(), statusDia()
│   └── db.js                Acesso ao Supabase (listar* + mappers)
├── ui/
│   └── components.jsx       Card, Header, TabBar, BlocoMeta, etc.
└── pages/
    ├── Dashboard.jsx        Dashboard da loja (visualização)
    ├── LojaApp.jsx          Shell: header + tabbar + 4 abas
    └── MasterApp.jsx        Stub (Etapa 3)
```

---

## 6. O que ainda falta

- **Etapa 2:** Telas de Lançar — Contratado, Faturado, Mídia,
  Orçamento, Abordador. Modal de WhatsApp. CRUD via Supabase
  (insert/update em `lancamentos`, `midias`, `orcamentos`,
  `abordadores`).

- **Etapa 3:** Relatórios (loja e master), Visão Master
  consolidada, Ranking de Mídia, Config Loja (metas, origens,
  troca de senha), Config Master (lojas, janela de edição, conta),
  histórico mensal para o comparativo "Mês atual x Melhor mês",
  log de edições (`edit_log`).
