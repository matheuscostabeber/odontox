# WebSPA — Frontend (SPA React)

SPA que consome a **API JSON** do backend FastAPI (ver [`../backend`](../backend)).
Parte da **arquitetura SPLIT** do DefaultWebApp; a referência completa de arquitetura
e do contrato de API está no **[`../CLAUDE.md`](../CLAUDE.md)** (raiz do repositório).

> **Antes de editar páginas, leia [`CONVENTIONS.md`](./CONVENTIONS.md).** A infra (cliente
> HTTP, tipos, stores, componentes, layouts, router) **já existe** — em geral só se
> implementam páginas em `src/pages/**`. Não recrie helpers nem edite a infra sem motivo.

## Stack

- **React 19** + **React Router 7** + **TypeScript** + **Vite 6**
- **Zod** (validação de resposta) + **Zustand** (estado global)
- **Sem framework de UI**: componentes React próprios com inline styles, ícones SVG próprios
  (`components/odontox/icons.tsx`) e CSS base em `styles/odontox.css`. NÃO usa Bootstrap.
- **Vitest** + Testing Library (jsdom)

## Comandos

```bash
npm install
npm run dev            # Vite dev server na porta 5180 (proxy /api, /static, /health -> backend)
npm run build          # tsc -b && vite build  (saída em dist/)
npm run preview        # serve o build
npm run test           # vitest run
npm run test:watch     # vitest em watch
npx tsc -b --noEmit    # typecheck isolado
npm run lint           # eslint
```

> **Dev precisa do backend rodando.** O Vite proxia `/api`, `/static` e `/health` para
> `VITE_BACKEND_URL` (fallback `http://127.0.0.1:8400`), mantendo same-origin para que o
> cookie de sessão e o CSRF funcionem sem CORS. Ajuste `VITE_BACKEND_URL` se o backend
> subir em outra porta. Em produção o build de `dist/` é servido pelo próprio FastAPI.

## Estrutura (`src/`)

```
src/
├── main.tsx          # entrypoint; importa styles/odontox.css
├── router.tsx        # rotas; RootGate (sessão), OdontoxGuard (protegidas)
├── lib/              # api.ts (cliente HTTP), schemas.ts (Zod), types.ts, format.ts, masks.ts, odontox/
├── context/          # ClinicContext (dados da clínica), ModalContext (modais)
├── store/            # Zustand: authStore (sessão/usuário), uiStore (toast/confirmação/alerta)
├── components/odontox/ # UI própria: AppLayout, Sidebar, Button, Field, Modal, StatusBadge, icons, agenda/, modals/
├── pages/odontox/    # Login, EsqueciSenha, Agenda, Pacientes, PacienteDetalhe, Dentistas
├── styles/           # odontox.css
└── test/             # setup do Vitest
```

Alias `@` → `src/` (configurado em `vite.config.ts` e `tsconfig.json`).

## Regras essenciais (resumo de CONVENTIONS.md)

- **Cliente HTTP**: `import { api, ApiError } from '@/lib/api'`. Caminhos relativos a `/api`
  (não incluir o prefixo). `credentials:'include'` e header `X-CSRF-Token` são automáticos.
  Erros lançam `ApiError` (`.status`, `.type`, `.message`, `.errors`, `.retryAfter`).
- **Tipos e enums** (`Usuario`, `Dentista`, `Paciente`, `Consulta`, `Atendimento`,
  `PaginaResponse<T>`, `Perfil`, `StatusConsulta`): importe de `@/lib/types` — não redefina.
- **Feedback**: `toast.sucesso/erro/aviso/info`, `pedirConfirmacao`, `mostrarAlerta`
  (de `@/store/uiStore`). **NUNCA** `alert()/confirm()/prompt()` nativos.
- **Dados da clínica**: `useClinic()` (de `@/context/ClinicContext`) e modais via `useModal()`.
- **Componentes prontos** (`components/odontox/`): `Button`, `Field`/`TextInput`/`TextArea`/`Select`,
  `Modal`/`ModalFooter`, `StatusBadge`, `Avatar`. Ícones SVG em `icons.tsx`. Reutilize, não recrie.

## Documentação Adicional

- **[`CONVENTIONS.md`](./CONVENTIONS.md)** — guia detalhado para implementar páginas (LEIA antes de editar).
- **[`../CLAUDE.md`](../CLAUDE.md)** — arquitetura, contrato de API e convenções do repositório.
