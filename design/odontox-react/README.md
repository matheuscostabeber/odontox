# OdontoX — Gestão Odontológica (MVP)

Sistema de gestão para clínica odontológica: **agenda diária por profissional, pacientes, dentistas e registro de atendimentos**. Convertido do protótipo de design para um projeto React componentizado e navegável, com fonte de dados fictícia em JSON.

## Stack

- **React 19** + **Vite**
- **React Router v8** (navegação por URL real — importado de `react-router`)
- **Context API** para estado global (autenticação, dados da clínica, modais)
- **Estilos inline** (fiéis ao design original) + um `global.css` para fontes, scrollbar e animações
- **Dados fictícios em JSON** servidos por uma **camada de serviço assíncrona** que simula uma API

## Como rodar

```bash
cd odontox-react
npm install
npm run dev
```

Abra http://localhost:5173. Na tela de login, clique em **Entrar** (ambiente de demonstração — qualquer credencial funciona).

Para gerar o build de produção: `npm run build` e depois `npm run preview`.

## Estrutura

```
src/
├── main.jsx                 # entrypoint: providers + router
├── App.jsx                  # definição das rotas (login + área protegida)
├── data/                    # fonte de dados fictícia (JSON)
│   ├── clinic.json          # nome da clínica, data "atual", usuário
│   ├── dentists.json
│   ├── patients.json
│   ├── consultas.json
│   └── atendimentos.json
├── services/
│   └── api.js               # API fictícia assíncrona (CRUD em memória, simula latência)
├── context/
│   ├── AuthContext.jsx      # login/logout
│   ├── ClinicContext.jsx    # dados + ações (carrega da API, CRUD)
│   └── ModalContext.jsx     # qual modal está aberto
├── hooks/
│   └── useForm.js           # formulário controlado simples
├── utils/
│   ├── constants.js         # grade da agenda, opções de duração/status
│   └── format.js            # datas, horários, iniciais, idade, status
├── pages/
│   ├── LoginPage.jsx
│   ├── AgendaPage.jsx
│   ├── PacientesPage.jsx
│   ├── PacienteDetalhePage.jsx
│   └── DentistasPage.jsx
└── components/
    ├── AppLayout.jsx        # sidebar + conteúdo + modais
    ├── Sidebar.jsx
    ├── RequireAuth.jsx      # guarda de rota
    ├── Logo.jsx, icons.jsx  # marca e ícones SVG
    ├── Avatar.jsx, Button.jsx, StatusBadge.jsx, Field.jsx, Modal.jsx, ModalFooter.jsx
    ├── agenda/              # WeekStrip, FilterChips, AgendaBoard, ConsultaBlock
    └── modals/              # ModalRoot + 5 modais (consulta detalhe/form, paciente, dentista, atendimento)
```

## Rotas

| Rota | Tela |
|------|------|
| `/login` | Login |
| `/esqueci-senha` | Recuperação de senha |
| `/agenda` | Agenda diária por profissional |
| `/pacientes` | Lista de pacientes (busca) |
| `/paciente/:id` | Detalhe + histórico de atendimentos |
| `/dentistas` | Profissionais (cards) |

## Trocar por um backend real

A UI nunca fala com os JSON diretamente — só com `src/services/api.js`. Para plugar um backend de verdade, troque o corpo de cada função desse arquivo por chamadas `fetch()`; o restante do app não muda.

> Os dados são mantidos em memória: criar/editar pacientes, consultas e atendimentos funciona durante a sessão, mas recarregar a página restaura os dados-semente dos JSON.
