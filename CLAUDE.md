# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

**OdontoX** — agenda clínica odontológica interna (projeto integrador). **Arquitetura SPLIT**: API REST JSON em FastAPI + SPA React, repos separados na mesma raiz. Foi derivado de um boilerplate educacional, mas os módulos genéricos do starter kit já foram removidos (ver "Módulos de domínio").

- `backend/` — FastAPI (Python 3.11+, SQLite **sem ORM**, SQL puro com prepared statements). Serve **apenas JSON** sob `/api` + `static/`. Em produção também serve o `index.html` do SPA buildado.
- `frontend/` — SPA React 19 + React Router 7 + TypeScript + Zod + Zustand + Vite. **Sem framework de UI**: componentes React próprios com **inline styles** (`CSSProperties`), ícones SVG próprios (`components/odontox/icons.tsx`) e CSS base em `src/styles/odontox.css`. NÃO usa Bootstrap nem bootstrap-icons.
- Deploy: **dwa.ifes.site** (`deploy/`: Dockerfile, docker-compose.yml, Jenkinsfile). Em dev, Vite faz proxy de `/api`, `/static`, `/health` → backend (same-origin, sem CORS).
- `projects/` e `.lesson-bridge/` são **workspace externo** (specs de outros projetos, plugins) — não fazem parte deste app; **ignore-os** ao analisar/editar o código.

> **Esquema de portas**: **8000** = porta interna do container (Uvicorn no Docker; imutável). **8400** = dev local (default do backend em `util/config.py`, alvo do proxy Vite). **8414** = porta publicada no VPS (`deploy/docker-compose.yml` mapeia `8414:8000`).

## Comandos

### Backend (rodar a partir de `backend/`)
O `.python-version` aponta para 3.14 (não instalado) — **sempre** usar o interpretador do venv:

```bash
backend/.venv/bin/python main.py                    # sobe API (porta via .env PORT; default dev 8400)
backend/.venv/bin/python -m pytest                  # todos os testes
backend/.venv/bin/python -m pytest tests/unit       # só unitários
backend/.venv/bin/python -m pytest tests/integration/test_x.py::TestClasse::test_metodo  # um teste
backend/.venv/bin/python -m pytest -m "not slow"    # markers: slow, integration, unit, auth, crud
```
Docs interativas em `/docs`. `pytest.ini` usa `asyncio_mode=auto`.

### Frontend (rodar a partir de `frontend/`)
```bash
npm run dev          # Vite dev server na porta 5180 (proxy /api -> VITE_BACKEND_URL, fallback 8400)
npm run build        # tsc -b && vite build  (saída em dist/, servida pelo backend em prod)
npm run test         # vitest run
npx tsc -b --noEmit  # typecheck isolado
npm run lint         # eslint
```

## Contrato de API — eixo central da conformidade backend↔frontend

Mudou algo de um lado, espelhe no outro. Os dois lados têm que bater **exato**.

- **Prefixo único `/api`**: backend monta todos os routers sob `API_PREFIX="/api"` (`backend/main.py`); frontend `src/lib/api.ts` usa `BASE='/api'`. Caminhos no front são **relativos a `/api`** (não incluir o prefixo).
- **Cliente HTTP central**: `frontend/src/lib/api.ts` — `credentials:'include'`, header `X-CSRF-Token` automático, classe `ApiError` (`.status`, `.type`, `.message`, `.errors`, `.retryAfter`). **Toda** chamada passa por aqui.
- **Contrato de erro**: `{detail, type, errors}` via handlers globais em `backend/util/exception_handlers.py`. Validação 422 → `util/validation_util.py:processar_erros_validacao_lista` chaveia erros por `loc[-1]` (último segmento; body aninhado vira chave simples). Traceback de dev fica fora do contrato.
- **Paginação**: envelope `PaginaResponse[T]` (`backend/dtos/responses/comum.py`: `items/pagina/por_pagina/total/total_paginas`) ↔ `PaginaResponse<T>` em `frontend/src/lib/types.ts`. Params `pagina`/`por_pagina`.
- **CSRF**: mutações enviam `X-CSRF-Token`; `GET /api/csrf-token` → `{token}`.
- **Tipos espelhados**: Response DTOs em `backend/dtos/responses/*.py` ↔ tipos em `frontend/src/lib/types.ts` ↔ validação Zod em `frontend/src/lib/schemas.ts`.
- **Enums batem exato dos dois lados**: Perfil (Administrador/Cliente/Vendedor) e StatusConsulta (agendada/atendida/cancelada/ausente).

## Arquitetura backend (`backend/`)

Camadas: **Routes → DTOs → Repos → SQL → DB**. `main.py` registra repos (criação de tabelas) e routers.

- **Auth**: decorator `@requer_autenticacao()` (`util/auth_decorator.py`) + dataclass `UsuarioLogado` (NUNCA dict). Sessão por cookie (`SessionMiddleware`, `SameSite=lax`).
- **Ordem dos middlewares importa** (último `add_middleware` é o mais externo): SegurançaHeaders (externo) → Session → CSRF. CSRF precisa de `request.session` já populado.
- **Perfis**: enum `Perfil` de `util/perfis.py` (fonte única; NUNCA strings literais). Enums de domínio herdam de `EnumEntidade` (`util/enum_base.py`).
- **DB datetime**: usar `agora()` de `util/datetime_util.py` ao salvar (NUNCA `.strftime()`).
- **Validação de form**: validators em `dtos/validators.py`; levantam `ValueError` → 422.
- **Rate limit**: `util/api_helpers.py:checar_rate_limit` (já emite header `Retry-After`), usado pelas rotas sensíveis de `auth` e `usuario` (login/cadastro/esqueci-senha/foto/senha). As rotas de domínio da clínica não aplicam rate limit. `util/rate_limiter.py` contém as classes `RateLimiter`/`DynamicRateLimiter`/`RegistroLimiters` e o helper `obter_identificador_cliente`.
- **Seed**: `util/seed_data.py:inicializar_dados` roda no boot e faz duas cargas idempotentes. (1) `backend/data/admin_seed.json` cria o usuário de acesso (`odontox@ifes.site`, perfil Administrador) — sempre, em dev e produção; se ausente, gera um usuário por perfil do enum como fallback. (2) `backend/seed_assets/odontox_seed.json` (snapshot versionado) carrega os dados de demonstração da clínica (dentistas, pacientes, consultas, atendimentos) e copia as fotos de `seed_assets/dentistas/*.jpg` para `static/uploads/dentistas/` — também em dev **e** produção (guarda: só executa em banco sem dentistas).
- **App perfil-agnóstico**: o acesso é só "autenticado ou não" (`@requer_autenticacao()`); não há área restrita por perfil. O enum `Perfil` (Administrador/Cliente/Vendedor) é herança do enum-base; toda a UI é igual para qualquer usuário logado (equipe interna da clínica).

## Arquitetura frontend (`frontend/src/`)

**Leia `frontend/CONVENTIONS.md` antes de editar páginas.** A infra (api, tipos, stores, componentes, layouts, router) já existe — em geral só se implementam páginas em `src/pages/**`; não recriar helpers.

- `lib/` — `api.ts` (cliente), `schemas.ts` (Zod de auth), `types.ts` (tipos+enums const), `format.ts` (`formatarData/DataHora/Hora/Moeda/Bytes`), `masks.ts` (`mascararCpf/Telefone/Moeda`). `lib/odontox/` — `clinicaApi.ts` (chamadas da clínica), `constants.ts` (clínica/grade/opções; `TODAY` é a data fixa do ambiente de demo), `format.ts` (helpers de agenda).
- `context/` — fonte dos dados de domínio: `ClinicProvider`/`useClinic` (carrega `GET /clinica/dados` no boot; dentistas/pacientes/consultas + ações CRUD) e `ModalProvider`/`useModal` (abre/fecha os modais). Páginas leem daqui, não fazem fetch ad-hoc.
- `store/` — Zustand: `authStore` (sessão/usuário, `login`/`logout`/`isAdmin()`), `uiStore` (toast/confirmação/alerta). Feedback **sempre** via `toast.sucesso/erro/aviso/info` ou `pedirConfirmacao`/`mostrarAlerta` — **NUNCA** `alert()/confirm()/prompt()` nativos.
- `hooks/useForm.ts` — estado/validação de formulários (usado pelos modais de form).
- `router.tsx` — `RootGate` (carrega sessão via `/api/me`; 401 anônimo é esperado) + `OdontoxGuard` (rotas protegidas) + `AppLayout`. Rotas: `/login`, `/esqueci-senha` (públicas); `/agenda`, `/pacientes`, `/paciente/:id`, `/dentistas` (protegidas); `/` e `*` redirecionam para `/agenda` (não há página 404 dedicada).
- `components/odontox/` — UI própria da clínica: `AppLayout`, `Sidebar`, `Field`, `Button`, `Modal`/`ModalFooter`, `StatusBadge`, `Avatar`, `Logo`, `BrandPanel`, `icons.tsx` (SVGs), subpastas `agenda/` (board/semana/filtros) e `modals/` (forms de consulta/atendimento/dentista/paciente + `ModalRoot`). `components/routing/` — `RootGate`, `OdontoxGuard`, `RouteError`.
- Alias `@` → `src/`. Páginas em `src/pages/odontox/**`.
- **Textareas controladas** NÃO populam via MCP `fill`/`fill_form`; usar setter nativo + dispatch de evento `input`.

## Módulos de domínio (rota backend ↔ página frontend)

O app é uma **agenda clínica interna OdontoX**. Os módulos genéricos do starter kit (chamados, pagamentos, chat, notificações, admin core de usuários/configurações/backups/auditoria) foram **removidos** — não fazem parte do escopo. Routers backend ativos: `auth`, `usuario`, `clinica`, `dentista`, `paciente`, `consulta`, `atendimento`.

- **auth**: login/logout/cadastrar/esqueci-senha/redefinir-senha/me/csrf-token.
- **usuario**: perfil (ver/editar/foto base64/senha). Foto: máx 10MB, valida tipo+tamanho no cliente.
- **clinica**: `GET /clinica/dados` — bootstrap do SPA (dentistas + pacientes + consultas + dados da clínica).
- **dentista**: CRUD de dentistas (`DentistasPage`).
- **paciente**: CRUD de pacientes (`PacientesPage`, `PacienteDetalhePage`).
- **consulta**: agendamento e mudança de status (`AgendaPage`). StatusConsulta: agendada/atendida/cancelada/ausente.
- **atendimento**: registro clínico do que foi feito numa consulta.

## Legado do starter kit REMOVIDO

Features genéricas do boilerplate que **não existem** neste fork — não há rotas, repos, models, DTOs nem páginas para elas; não as recrie nem as documente como ativas: **chamados/tickets, chat, pagamentos (Mercado Pago/Stripe/PayPal), notificações, backups, auditoria, e a área admin de usuários/configurações** (`/api/admin/*`). O enum `Perfil` (Administrador/Cliente/Vendedor) sobrevive do enum-base mas o app é perfil-agnóstico (ver acima).

O resíduo de config do legado já foi removido: `util/config.py`, `util/migrar_config.py` e `backend/.env.example` não declaram/semeiam mais chaves de pagamento (`MERCADOPAGO_*`, `STRIPE_*`, `PAYPAL_*`, `payment_provider`) nem rate limits de chat/chamados/backups/admin. O único vestígio remanescente é a entrada **inerte** `/api/pagamentos/webhook` em `CSRF_EXEMPT_PATHS` (`util/csrf_protection.py`) — sem rota que a sirva neste fork, mantida apenas porque `tests/integration/test_csrf_protection.py` ainda a referencia.

Infra core que **sobreviveu** e é usada: auth por sessão+CSRF, contrato de erro JSON, paginação, rate limit (auth/usuario), upload de foto base64, e-mail via Resend (recuperação de senha), config híbrida (`configuracao` + cache), seed idempotente.

## Convenções de commit (do usuário)

- `git add` **SELETIVO**: só os arquivos que esta sessão alterou. NUNCA `git add -A/./-u`, `git commit -a/-am`. Rodar `git status --short` e cruzar com a lista de arquivos editados antes de commitar (há múltiplos agentes paralelos no mesmo repo).
- Pedir confirmação antes de push. PR só com permissão explícita por PR. Não se identificar como Claude nos commits.
