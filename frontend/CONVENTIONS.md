# Convenções do Frontend (LEIA ANTES DE EDITAR QUALQUER PÁGINA)

Stack: **React 19 + React Router 7 + Zod + Zustand + TypeScript + Vite**.

**Sem framework de UI.** Não há Bootstrap nem bootstrap-icons. A interface é feita com:
- **Componentes React próprios** em `src/components/odontox/`, estilizados com **inline styles** (`CSSProperties`).
- **Ícones SVG próprios** em `src/components/odontox/icons.tsx` (importe o ícone como componente: `import { Plus, Search } from '@/components/odontox/icons'`). NÃO use `<i className="bi bi-...">`.
- **CSS base** em `src/styles/odontox.css` (fonte Plus Jakarta Sans, reset, foco, scrollbar `.ox-scroll`, animação de modal). Variável de marca: `--ox-accent: #0E7A86`.

A infraestrutura (api, tipos, contextos, stores, componentes, layouts, router) **já existe**.
Você implementa páginas em `src/pages/odontox/**`. **NÃO** edite o router, os layouts nem a
infra, salvo instrução explícita. Use SEMPRE o que já existe — não recrie helpers.

## Cliente HTTP — `src/lib/api.ts`

```ts
import { api, ApiError } from '@/lib/api'
const usuario = await api.get<Usuario>('/usuario/perfil')
await api.put<Usuario>('/usuario/perfil', { nome, email })
await api.post('/dentistas', { nome, cro, especialidade })
await api.delete(`/pacientes/${id}`)
```

- Caminhos são **relativos a `/api`** (não inclua o prefixo `/api`).
- `credentials: include` e header **`X-CSRF-Token`** são automáticos. Não se preocupe com CSRF.
- Erros lançam `ApiError` com `.status`, `.type`, `.message` (detail), `.errors` (por campo), `.retryAfter`.
- A API de domínio da clínica é centralizada em `src/lib/odontox/clinicaApi.ts` (consome `/clinica/dados`, `/dentistas`, `/pacientes`, `/consultas`, `/atendimentos`).

## Tipos — `src/lib/types.ts`

Shapes de resposta: `Usuario`, `Dentista`, `Paciente`, `Consulta`, `Atendimento`,
`PaginaResponse<T>`, `MensagemResponse`. Enums como objetos const: `Perfil`.
Tipo de status de consulta: `StatusConsulta` (`'agendada' | 'atendida' | 'cancelada' | 'ausente'`).
**Importe daqui**, não redefina.

## Dados de domínio — contextos (`src/context/`)

O estado da clínica é servido por contextos React, não por fetch ad-hoc nas páginas:

```ts
import { useClinic } from '@/context/ClinicContext'  // dentistas, pacientes, consultas + ações (CRUD)
import { useModal } from '@/context/ModalContext'     // abrir/fechar modais de form/detalhe
```

`ClinicProvider` carrega `GET /clinica/dados` no boot e expõe as listas + mutações.
Páginas leem do `useClinic()` e disparam modais via `useModal()`.

## Estado global — `src/store/`

```ts
import { useAuthStore } from '@/store/authStore'
const usuario = useAuthStore((s) => s.usuario)        // Usuario | null
const setUsuario = useAuthStore((s) => s.setUsuario)  // após editar perfil/foto

import { toast, useUIStore } from '@/store/uiStore'
toast.sucesso('Salvo!'); toast.erro('Falhou'); toast.info('...'); toast.aviso('...')
const pedirConfirmacao = useUIStore((s) => s.pedirConfirmacao)
const mostrarAlerta = useUIStore((s) => s.mostrarAlerta)
```

## Feedback ao usuário (REGRAS)

- **NUNCA** use `alert()`, `confirm()`, `prompt()` nativos.
- Notificações rápidas → `toast.sucesso/erro/aviso/info(msg)`.
- Confirmação de ação destrutiva → `pedirConfirmacao({ mensagem, tipo:'danger', onConfirmar })`.
- Aviso modal → `mostrarAlerta({ mensagem, tipo })`.

## Componentes prontos — `src/components/odontox/`

- `Button` (default): `<Button variant="primary" hoverDim>...</Button>`.
- `Field` (named): `Field`, `TextInput`, `TextArea`, `Select` — wrappers de input com label.
- `Modal` (default): `<Modal title subtitle maxWidth onClose>...</Modal>` + `ModalFooter` (`onCancel`/`onSave`/`saveLabel`).
- `StatusBadge` (default): `<StatusBadge status size />` — etiqueta de `StatusConsulta`.
- `Avatar`, `Logo`, `BrandPanel`, `Sidebar`, `AppLayout`.
- `agenda/` — `AgendaBoard`, `WeekStrip`, `ConsultaBlock`, `FilterChips`.
- `modals/` — forms de consulta/atendimento/dentista/paciente + `ModalRoot`.

## Formatação e máscaras

- `src/lib/format.ts`: `formatarData`, `formatarDataHora`, `formatarHora`, `formatarMoeda`, `formatarBytes`.
- `src/lib/odontox/format.ts`: helpers de agenda (`fmtDate`, `shortDate`, `addDays`, `endTime`, `idade`, `initials`, `avatarColor`, `statusMeta`, `plural`).
- `src/lib/masks.ts`: `mascararCpf`, `mascararTelefone`, `mascararMoeda`, `apenasDigitos`.

## Formulários

- Modais de form (consulta/atendimento/dentista/paciente) usam o hook `@/hooks/useForm`
  para estado + validação. Reutilize-o ao criar novos forms; não recrie controle de estado na mão.
- Validação com Zod:

```ts
import { z } from 'zod'
const schema = z.object({ email: z.string().email('E-mail inválido'), senha: z.string().min(8) })
const parsed = schema.safeParse(form)
if (!parsed.success) { setErros(parsed.error.flatten().fieldErrors); return }
```
Schemas reutilizáveis de auth ficam em `src/lib/schemas.ts`.

## Navegação

`import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'`.
Use `<Link to>` em vez de `<a href>`. Rotas já registradas no router (não altere).

## Visual

- Estilo via **inline styles** (`style={{...}}`) e classes utilitárias próprias em `odontox.css` (`.ox-scroll`, `.ox-row`, `.ox-modal`). Sem classes Bootstrap.
- Cor de marca via `var(--ox-accent)`; paleta e raios seguem os componentes existentes — copie o padrão de uma página/componente vizinho.
- Ícones sempre como componentes SVG de `icons.tsx`.
- **Textareas controladas** NÃO populam via MCP `fill`/`fill_form`; use setter nativo + dispatch de evento `input`.

## Regras de saída

- Cada página é **default export**, nome do componente = nome do arquivo.
- TypeScript **strict** + `noUnusedLocals/Parameters`: não deixe imports/vars sem uso.
- Não use `any` implícito; tipe tudo. O build roda `tsc -b` — precisa passar.
