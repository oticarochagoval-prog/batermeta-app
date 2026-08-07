# BaterMeta

Sistema de acompanhamento de metas das óticas (Rocha 1-11 + GV Optical).
Frontend React + Vite. Backend Supabase. Hospedado no Vercel.

> Este é o resultado da **Etapa 3** (final). Sistema completo: gerente
> tem todas as 4 abas funcionando (Início, Lançar, Relatórios, Config),
> master tem painel consolidado, ranking de mídia, relatórios da rede e
> CRUD completo (lojas, janela de edição, senha master, nome da rede).

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

## 2. Migração nova da Etapa 3 (SQL Editor do Supabase)

Rode **apenas a 007** (as 001-006 já foram aplicadas nas etapas anteriores).

| Arquivo | O que faz |
|---|---|
| `supabase/migrations/007_master_config.sql` | Cria a tabela `master_config` (chave/valor) com defaults: `janela_edicao_dias=5` e `nome_rede=Óticas Rocha`. Sem a senha master cadastrada (usa fallback do briefing). |

Idempotente. Pode rodar de novo sem medo.

---

## 3. Novidades da Etapa 3

### Para o gerente (loja)

#### Tela "Relatórios" (antes "Em breve")
- **Vendas:** cards Contratado/Faturado clicáveis (filtram a lista). 1 selecionado mostra lista única ampliada. Cada lista tem resumo com Meta/Super/Gold (saldo + %) no topo.
- **Orçamentos:** stats do mês (atendimentos, compraram, pendentes, conversão) + lista completa.
- **Mídia:** card destaque com total da rede + lista de origens com barras proporcionais ao valor.
- **Abordador:** card de meta de clientes (paraMeta = total - promoção) + stats detalhados + lista com flag PROMOÇÃO.

#### Tela "Config" (antes "Em breve")
3 sub-abas:
- **Metas:** editar tipo de período (diário/semanal), divisor (dias úteis ou semanas), Meta/Super/Gold de Contratado e Faturado, meta do Abordador. Validação Super > Meta, Gold > Super.
- **Origens:** lista de origens ativas (Arquivar) + lista arquivadas (Reativar). Adicionar novas. Arquivar NÃO apaga — histórico preservado.
- **Senha:** o gerente troca a própria senha confirmando a atual.

#### Bloqueio efetivo da janela de edição
Antes era só informativo. Agora é regra real:
- Mês atual: sempre editável.
- Mês fechado: gerente edita até X dias após a virada (configurável pelo master, default 5).
- Master: **ignora janela**, edita qualquer dia de qualquer mês.

Quando bloqueado, aparece banner vermelho com cadeado e os botões "Lançar"/"Não teve" ficam desabilitados.

### Para o master (visão da rede)

Login `master` agora abre um painel completo com 4 abas:

#### Painel
- Card consolidado escuro: Faturamento mês, Ticket geral, Total do dia, Qtd. vendas.
- Alerta: lojas com lançamento incompleto hoje.
- Faturamento por loja (barras + ordenação Loja/Faturamento/% Meta).
- Lista de cards clicáveis — toca para abrir aquela loja.

#### Ranking
Top 3 destaque + ranking completo (Top 10/20/Todos). **Agrega origens por nome:** Instagram da Rocha 1 + Instagram da Rocha 2 = um item só. Ordenação por valor, clientes ou ticket médio.

#### Relatórios
3 sub-abas: Vendas (resumo da rede), Mídia (origens consolidadas), Comparativo (linha por loja com ordenação). Botão "Copiar relatório" gera texto formatado pronto pro WhatsApp.

#### Config
- **Lojas:** CRUD completo. Renomear, redefinir senha, ativar/desativar, editar meta_abordador inline, criar loja nova.
- **Janela:** define quantos dias o gerente edita após virar o mês (3, 5, 10, 30).
- **Conta:** trocar nome da rede + alterar senha do master.

#### Master ver como loja
Ao tocar numa loja no Painel, o master entra na visão dela em modo de **edição livre**. Pode:
- Ver o **Painel** (Dashboard) daquela loja
- **Lançar** por ela (banner azul "Você está lançando por X com a senha master")
- Ver **Relatórios** dela
- **Gerar nova senha** (botão `rocha + 4 dígitos` aleatórios)

Tem um seletor no topo pra trocar de loja sem voltar.

---

## 4. Credenciais

- **Loja:** mesmas das etapas anteriores (`rocha1`/`rocha1`, etc.)
- **Master:** `master` / `rocha@master2024` (fallback). Quando você trocar a senha pela tela Config > Conta, a nova senha passa a valer.

---

## 5. Estrutura do código (Etapa 3)

```
src/
├── App.jsx                            Boot + hidrata CONFIG do banco
├── auth/
│   ├── Login.jsx
│   └── session.js                     Senha master vem do CONFIG (banco)
├── lib/
│   ├── supabase.js, colors.js, format.js
│   ├── config.js                      CONFIG + hidratarConfigDoServidor()
│   ├── calc.js                        +calcMidia, +calcOrc, +calcAbord
│   ├── db.js                          ~25 funções de READ/WRITE
│   ├── janela_edicao.js               podeEditar() — bloqueio efetivo
│   └── whats.js
├── ui/                                Field, MoneyInput, Calendar,
│                                      PeriodoSeletor, WhatsModal, components
└── pages/
    ├── Dashboard.jsx                  (sem mudanças, etapa 1)
    ├── LojaApp.jsx                    Shell loja, agora com tudo real
    ├── MasterApp.jsx                  Shell master completo
    ├── Lancar.jsx
    ├── Relatorios.jsx                 NOVO — 4 sub-abas
    ├── ConfigLoja.jsx                 NOVO — 3 sub-abas
    ├── lancar/                        FormVenda (com bloqueio), FormMidia
    │                                  (com bloqueio), FormOrcamento, FormAbordador
    ├── relatorios/                    NOVO — RelVendas, RelOrcamentos,
    │                                  RelMidia, RelAbordador
    ├── config/                        NOVO — ConfigurarMetas, OrigensMidia,
    │                                  TrocarSenha
    └── master/                        NOVO — MasterHome, RankingMidia,
                                       RelatoriosConsolidados, ConfigMaster,
                                       CfgLojas, CfgJanela, CfgConta,
                                       MasterLojaView
```

---

## 6. Subir nova versão (Claude Code + PowerShell)

Mesmo padrão das etapas anteriores. Lembre-se:

1. Extrai o ZIP em `Downloads`
2. Abre PowerShell, vai para `C:\Users\Usuário\Downloads\batermeta-app`
3. **Garante que está nessa pasta** com `pwd` antes de qualquer destrutivo (`git clean`, `Remove-Item`)
4. Esvazia a subpasta `batermeta-app/` (estrutura existente do repo):
   ```powershell
   Get-ChildItem -Path ".\batermeta-app\" -Force | Remove-Item -Recurse -Force
   ```
5. Copia o conteúdo do ZIP novo pra dentro dela:
   ```powershell
   Copy-Item -Path "C:\Users\Usuário\Downloads\batermeta-app-etapa3\*" -Destination ".\batermeta-app\" -Recurse -Force
   ```
6. Commit + push:
   ```powershell
   git add .
   git commit -m "Etapa 3 — Relatórios + Config + Master completo"
   git push origin main
   ```
7. Roda a migração 007 no Supabase SQL Editor.
8. Espera 2-3 min pro Vercel deployar. Acessa `batermeta-app.vercel.app`.

---

## 7. Testes recomendados

### Como gerente
1. Login `rocha1` / `rocha1`
2. **Lançar:** Contratado + Faturado de hoje, R$ 1.500 cada
3. **Mídia:** preencha uma origem com 2 clientes e R$ 1.500
4. **Relatórios > Vendas:** clica nos cards Contratado/Faturado e vê a lista filtrar
5. **Relatórios > Mídia:** vê a origem que você acabou de lançar com barra
6. **Config > Metas:** muda a meta de Contratado pra R$ 100.000, salva
7. **Config > Origens:** adiciona "Tiktok", arquiva, reativa
8. **Config > Senha:** troca a senha por `nova123`, sai e entra de novo

### Como master
1. Login `master` / `rocha@master2024`
2. **Painel:** vê o consolidado, alertas de loja incompleta, faturamento por loja
3. Toca numa loja → entra na visão dela. Lança algo. Volta.
4. **Ranking:** vê as origens consolidadas
5. **Relatórios > Comparativo:** ordena por % Meta, copia relatório
6. **Config > Lojas:** renomeia a Rocha 1, define meta_abordador 30, vê aparecer "ATIVO"
7. **Config > Janela:** muda pra 10 dias e salva
8. **Config > Conta:** troca a senha master por uma nova. Sai e entra com a nova.
