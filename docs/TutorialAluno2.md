# Tutorial Aluno 2 — CRUD de Especialidades Odontológicas + Select no Cadastro de Dentista

Este tutorial é um passo a passo COMPLETO. Foi escrito para quem está com dificuldade. Não pule nenhum passo. Se você seguir tudo ao pé da letra, no final terá a feature funcionando ponta a ponta (backend + frontend).

> Dica de ouro: faça **um arquivo de cada vez**, na ordem em que eles aparecem aqui. Não tente fazer tudo junto. A cada arquivo concluído, salve. No final tem uma seção "Como testar" e um "Checklist".

---

## O que você vai construir

Você vai criar uma entidade nova chamada **Especialidade** (com um único campo: `nome`). Ela é uma "tabela de apoio": serve para alimentar uma lista de opções. Hoje, no cadastro de dentista, o campo "Especialidade" é um texto livre (o usuário digita qualquer coisa). Depois deste tutorial, esse campo vira um **select** (caixa de seleção) alimentado pela lista de especialidades cadastradas. Você vai espelhar EXATAMENTE o padrão que já existe para "Dentista": SQL puro, repositório, model, DTO de entrada, DTO de resposta, rota protegida, registro no startup, e do lado do front: tipo TypeScript, função no cliente de API, ação no contexto, uma página nova de CRUD, uma rota e um item no menu.

Resultado final:

- Uma tabela `especialidade` no SQLite, criada automaticamente no boot.
- Endpoints REST: `GET/POST/PUT /api/especialidades` (e a lista também volta dentro de `GET /api/clinica/dados`).
- Uma página `/especialidades` no SPA, com listagem e um modal de cadastro/edição.
- Um item "Especialidades" no menu lateral.
- O campo "Especialidade" do modal de dentista vira um `<select>` com as opções vindas do backend.

---

## Pré-requisitos

Você precisa conseguir rodar o projeto ANTES de começar. Abra dois terminais.

**Terminal 1 — Backend** (rodar a partir da pasta `backend/`):

```bash
cd /Volumes/Externo/Ifes/2026.1/PI20261/Projetos/odontox/backend
.venv/bin/python main.py
```

O backend sobe na porta `8400` (padrão de dev). A documentação interativa fica em `http://localhost:8400/docs`. Use sempre o Python do venv (`.venv/bin/python`), nunca o Python global.

**Terminal 2 — Frontend** (rodar a partir da pasta `frontend/`):

```bash
cd /Volumes/Externo/Ifes/2026.1/PI20261/Projetos/odontox/frontend
npm run dev
```

O Vite sobe na porta `5180` e faz proxy de `/api` para o backend (mesma origem, sem CORS). Abra `http://localhost:5180`, faça login com o usuário de seed (`odontox@ifes.site`).

Para checar tipos do front sem buildar:

```bash
npx tsc -b --noEmit
```

Deixe os dois terminais rodando. O backend usa `reload` e o Vite tem hot reload, então as mudanças aparecem sozinhas na maioria das vezes. Quando você mexer em `main.py` ou criar arquivos novos no backend, às vezes é preciso parar (Ctrl+C) e subir de novo.

---

## As camadas e a ordem de implementação

O projeto tem camadas bem definidas. Vamos construir **de baixo para cima** (do banco até a tela). Essa ordem importa: cada camada depende da anterior. Se você começar pela tela, não terá o que chamar.

Ordem que vamos seguir:

**Backend**
1. `backend/sql/especialidade_sql.py` — as queries SQL (NOVO).
2. `backend/model/especialidade_model.py` — o model de domínio (NOVO).
3. `backend/repo/especialidade_repo.py` — o repositório (NOVO).
4. `backend/dtos/especialidade_dto.py` — DTO de entrada (NOVO).
5. `backend/dtos/responses/especialidade_response.py` — DTO de saída (NOVO).
6. `backend/routes/especialidade_routes.py` — o router REST (NOVO).
7. `backend/main.py` — registrar a tabela no startup e registrar o router (EDIÇÃO). **Passo que mais se erra.**
8. `backend/routes/clinica_routes.py` — incluir a lista no agregador (EDIÇÃO).

**Frontend**
9. `frontend/src/lib/types.ts` — o tipo `Especialidade` (EDIÇÃO).
10. `frontend/src/lib/odontox/clinicaApi.ts` — `DadosClinica` + funções da API (EDIÇÃO).
11. `frontend/src/context/ClinicContext.tsx` — estado + ação `saveEspecialidade` (EDIÇÃO).
12. `frontend/src/pages/odontox/EspecialidadesPage.tsx` — a página (NOVO).
13. `frontend/src/components/odontox/modals/EspecialidadeFormModal.tsx` — o modal de form (NOVO).
14. `frontend/src/components/odontox/modals/ModalRoot.tsx` — registrar o modal (EDIÇÃO).
15. `frontend/src/router.tsx` — registrar a rota `/especialidades` (EDIÇÃO).
16. `frontend/src/components/odontox/Sidebar.tsx` — item no menu (EDIÇÃO).
17. `frontend/src/components/odontox/modals/DentistFormModal.tsx` — trocar o TextInput por um `<Select>` (EDIÇÃO).

> Por que essa ordem? O front (passos 9 em diante) só funciona se o backend já devolver os dados certos. E dentro do backend, a rota (passo 6) depende do repo, do model e dos DTOs. Por isso começamos pelo SQL e subimos.

---

## Parte 1 — Backend

### 1. `backend/sql/especialidade_sql.py` — ARQUIVO NOVO

Aqui ficam as queries SQL como **constantes de string**, uma por operação. Não há ORM. Espelha o `dentista_sql.py`, mas com só um campo de dado (`nome`). Como é uma tabela de apoio simples, não temos `ativo`/`toggle` nem `DELETE` (seguimos o mesmo conjunto de operações de dentista: criar tabela, inserir, obter todos, obter por id, atualizar).

```python
CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS especialidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
)
"""

INSERIR = """
INSERT INTO especialidade (nome)
VALUES (?)
"""

OBTER_TODOS = """
SELECT id, nome
FROM especialidade
ORDER BY nome
"""

OBTER_POR_ID = """
SELECT id, nome
FROM especialidade
WHERE id = ?
"""

ATUALIZAR = """
UPDATE especialidade
SET nome = ?
WHERE id = ?
"""
```

Pontos importantes:
- `CREATE TABLE IF NOT EXISTS` — não dá erro se a tabela já existir (roda toda vez no boot).
- `id INTEGER PRIMARY KEY AUTOINCREMENT` — o id é gerado pelo banco.
- Os `?` são **placeholders** (prepared statements). NUNCA monte SQL com f-string interpolando valores — isso abre brecha de SQL injection. O repo passa os valores numa tupla.
- `ORDER BY nome` deixa a lista ordenada (igual ao de dentista).

### 2. `backend/model/especialidade_model.py` — ARQUIVO NOVO

O **model** é a entidade de domínio: uma `@dataclass` pura, em `snake_case`. Espelha `dentista_model.py`, mas só com `id` e `nome`.

```python
from dataclasses import dataclass


@dataclass
class Especialidade:
    id: int
    nome: str
```

Pontos importantes:
- É só um carregador de dados (sem lógica). O repo converte linhas do banco nisto.
- Note que não há `Optional` aqui porque os dois campos são sempre preenchidos.

### 3. `backend/repo/especialidade_repo.py` — ARQUIVO NOVO

O **repositório** tem as funções que falam com o banco. São funções de módulo (não classes). Cada função abre a conexão com o context manager `obter_conexao()` (que já faz commit no sucesso e rollback no erro) e usa prepared statements. Espelha `dentista_repo.py`.

```python
"""Repositório de Especialidades."""

import sqlite3
from typing import Optional

from model.especialidade_model import Especialidade
from sql.especialidade_sql import (
    CRIAR_TABELA,
    INSERIR,
    OBTER_TODOS,
    OBTER_POR_ID,
    ATUALIZAR,
)
from util.db_util import obter_conexao
from util.logger_config import logger


def _row_to_especialidade(row: sqlite3.Row) -> Especialidade:
    return Especialidade(
        id=row["id"],
        nome=row["nome"],
    )


def criar_tabela() -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


def inserir(especialidade: Especialidade) -> Optional[int]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(INSERIR, (
            especialidade.nome,
        ))
        return cursor.lastrowid


def obter_todos() -> list[Especialidade]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        rows = cursor.fetchall()
        return [_row_to_especialidade(row) for row in rows]


def obter_por_id(id: int) -> Optional[Especialidade]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        if row:
            return _row_to_especialidade(row)
        return None


def atualizar(especialidade: Especialidade) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR, (
            especialidade.nome,
            especialidade.id,
        ))
        return cursor.rowcount > 0
```

Pontos importantes:
- `_row_to_especialidade(row)` (com underline na frente = função privada) converte uma linha `sqlite3.Row` no model. Toda entidade tem essa função no padrão do projeto.
- `inserir(...)` retorna `cursor.lastrowid` (o id novo gerado pelo banco).
- `obter_todos()` retorna `list[Especialidade]`; `obter_por_id(id)` retorna `Optional[Especialidade]` (pode ser `None`).
- `atualizar(...)` retorna `cursor.rowcount > 0` (True se realmente alterou alguma linha).
- A vírgula em `(especialidade.nome,)` é OBRIGATÓRIA: sem ela, `(x)` não é uma tupla, é só um parênteses. `execute` precisa de tupla.
- `criar_tabela()` é a função que o `main.py` vai chamar no boot. **Tem que existir com esse nome exato**, senão o registro no startup quebra.
- Importamos `logger` para manter o mesmo padrão dos outros repos (mesmo que aqui não usemos — é o estilo do projeto).

### 4. `backend/dtos/especialidade_dto.py` — ARQUIVO NOVO

O **DTO de entrada** descreve o JSON que o front ENVIA num POST/PUT. É um `pydantic.BaseModel`. Aqui validamos o `nome`. Usamos o validator pronto `validar_string_obrigatoria` de `dtos/validators.py` (mesmo padrão do `PacienteDTO`).

```python
from pydantic import BaseModel, Field, field_validator

from dtos.validators import validar_string_obrigatoria


class EspecialidadeDTO(BaseModel):
    """DTO para criação/edição de especialidade."""

    nome: str = Field(..., description="Nome da especialidade")

    _validar_nome = field_validator("nome")(
        validar_string_obrigatoria(nome_campo="Nome", tamanho_minimo=2, tamanho_maximo=100)
    )
```

Pontos importantes:
- `nome: str = Field(..., ...)` — os três pontos (`...`) significam "obrigatório".
- O validator levanta `ValueError` se o nome for inválido; o FastAPI transforma isso automaticamente numa resposta **422** com o contrato de erro do projeto. Você não trata isso na rota.
- O nome do campo (`nome`) tem que bater EXATAMENTE com o que o front envia. O front vai enviar `{ nome: '...' }`, então está certo.
- A convenção do projeto é prefixar o validator com underline (`_validar_nome`).

### 5. `backend/dtos/responses/especialidade_response.py` — ARQUIVO NOVO

O **DTO de resposta** descreve o JSON que a API DEVOLVE. Tem um classmethod construtor a partir do model. Aqui é onde, se houvesse campos `snake_case` no model, traduziríamos para `camelCase` (como `foto_url` → `fotoUrl` em dentista). Como aqui só temos `id` e `nome`, não há tradução. Espelha `dentista_response.py`.

```python
"""Schemas de resposta do módulo de especialidades."""
from pydantic import BaseModel

from model.especialidade_model import Especialidade


class EspecialidadeResponse(BaseModel):
    """Representação de uma especialidade."""

    id: int
    nome: str

    @classmethod
    def de_especialidade(cls, especialidade: Especialidade) -> "EspecialidadeResponse":
        """Constrói o response a partir da entidade de domínio."""
        return cls(
            id=especialidade.id,
            nome=especialidade.nome,
        )
```

Pontos importantes:
- O classmethod se chama `de_especialidade` (padrão `de_<entidade>`, igual `de_dentista`).
- Esse Response é o "contrato" com o front: o tipo TypeScript `Especialidade` (passo 9) tem que ter os mesmos campos (`id`, `nome`).

### 6. `backend/routes/especialidade_routes.py` — ARQUIVO NOVO

O **router** expõe os endpoints REST. Espelha `dentista_routes.py`, mas SEM o `toggle` (especialidade não tem `ativo`). Toda handler é `async def`, recebe `request: Request` como primeiro parâmetro, termina com `usuario_logado: Optional[UsuarioLogado] = None`, e tem o decorator `@requer_autenticacao()` logo abaixo do decorator de rota.

```python
"""
Rotas para gerenciamento de especialidades odontológicas (API JSON).

Permite que usuários logados:
- Listem especialidades
- Cadastrem novas especialidades
- Editem especialidades
"""

# =============================================================================
# Imports
# =============================================================================

# Standard library
from typing import Optional

# Third-party
from fastapi import APIRouter, HTTPException, Request, status

# DTOs (entrada)
from dtos.especialidade_dto import EspecialidadeDTO

# Schemas (saída)
from dtos.responses.especialidade_response import EspecialidadeResponse

# Models
from model.especialidade_model import Especialidade
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import especialidade_repo

# Utilities
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/especialidades")


# =============================================================================
# Listagem
# =============================================================================

@router.get("", response_model=list[EspecialidadeResponse])
@requer_autenticacao()
async def listar(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista todas as especialidades (ordenadas por nome)."""
    assert usuario_logado is not None
    especialidades = especialidade_repo.obter_todos()
    return [EspecialidadeResponse.de_especialidade(e) for e in especialidades]


# =============================================================================
# Criação
# =============================================================================

@router.post(
    "",
    response_model=EspecialidadeResponse,
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao()
async def criar(
    request: Request,
    dto: EspecialidadeDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cadastra uma nova especialidade."""
    assert usuario_logado is not None

    especialidade = Especialidade(
        id=0,
        nome=dto.nome,
    )
    especialidade_id = especialidade_repo.inserir(especialidade)
    if not especialidade_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar a especialidade. Tente novamente.",
        )

    logger.info(f"Especialidade #{especialidade_id} '{dto.nome}' criada por usuário {usuario_logado.id}")

    criada = especialidade_repo.obter_por_id(especialidade_id)
    return EspecialidadeResponse.de_especialidade(criada)


# =============================================================================
# Edição
# =============================================================================

@router.put("/{id}", response_model=EspecialidadeResponse)
@requer_autenticacao()
async def atualizar(
    request: Request,
    id: int,
    dto: EspecialidadeDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Atualiza uma especialidade existente."""
    assert usuario_logado is not None

    existente = especialidade_repo.obter_por_id(id)
    if not existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Especialidade não encontrada.",
        )

    especialidade = Especialidade(
        id=id,
        nome=dto.nome,
    )
    especialidade_repo.atualizar(especialidade)

    logger.info(f"Especialidade #{id} atualizada por usuário {usuario_logado.id}")

    atualizada = especialidade_repo.obter_por_id(id)
    return EspecialidadeResponse.de_especialidade(atualizada)
```

Pontos importantes:
- `router = APIRouter(prefix="/especialidades")` — o prefixo é SEM `/api`. O `main.py` adiciona o `/api` na frente. Resultado final: `/api/especialidades`.
- `@requer_autenticacao()` fica ABAIXO de `@router.get/post/put`. Ele exige usuário logado (401 se anônimo) e injeta o `usuario_logado`. Por isso, dentro da função, `usuario_logado` chega preenchido e usamos `assert usuario_logado is not None` (deixa o type checker feliz).
- Erros sempre com `raise HTTPException(status_code=..., detail="...")`. Use 404 quando o recurso não existe e 500 quando o repo falha. Os handlers globais convertem para o contrato `{detail, type, errors}`.
- No POST, criamos o model com `id=0` (o banco gera o id real); depois lemos de volta com `obter_por_id` para devolver os dados já com o id.
- No PUT, primeiro checamos se existe (404 se não), depois atualizamos e relemos.
- A validação do `nome` (422) já acontece sozinha por causa do DTO; você não escreve nada para isso na rota.

### 7. `backend/main.py` — EDIÇÃO (passo crítico!)

Este é o passo que os alunos MAIS erram. Sem ele, a tabela não é criada e a rota não existe. São **quatro mudanças** neste arquivo.

**Mudança 7.1 — importar o repo novo.** Procure o bloco de imports de repositórios (começa em `from repo import (`):

Antes:

```python
from repo import (
    usuario_repo,
    configuracao_repo,
    indices_repo,
    dentista_repo,
    paciente_repo,
    consulta_repo,
    atendimento_repo,
)
```

Depois (adicione `especialidade_repo` na lista):

```python
from repo import (
    usuario_repo,
    configuracao_repo,
    indices_repo,
    dentista_repo,
    especialidade_repo,
    paciente_repo,
    consulta_repo,
    atendimento_repo,
)
```

**Mudança 7.2 — importar o router novo.** Procure os imports de rotas (linhas `from routes.X_routes import router as X_router`). Adicione abaixo da linha do `dentista_router`:

```python
from routes.dentista_routes import router as dentista_router
from routes.especialidade_routes import router as especialidade_router
from routes.paciente_routes import router as paciente_router
```

**Mudança 7.3 — registrar a tabela no startup.** Procure a lista `TABELAS = [`. Adicione a tupla `(especialidade_repo, "especialidade")`:

Antes:

```python
TABELAS = [
    (usuario_repo, "usuario"),
    (configuracao_repo, "configuracao"),
    (dentista_repo, "dentista"),
    (paciente_repo, "paciente"),
    (consulta_repo, "consulta"),
    (atendimento_repo, "atendimento"),
]
```

Depois:

```python
TABELAS = [
    (usuario_repo, "usuario"),
    (configuracao_repo, "configuracao"),
    (dentista_repo, "dentista"),
    (especialidade_repo, "especialidade"),
    (paciente_repo, "paciente"),
    (consulta_repo, "consulta"),
    (atendimento_repo, "atendimento"),
]
```

> O loop logo abaixo (`for repo, nome in TABELAS: repo.criar_tabela()`) é o que de fato cria a tabela no boot. Por isso o repo PRECISA ter a função `criar_tabela()` (passo 3).

**Mudança 7.4 — registrar o router.** Procure a lista `ROUTERS = [`. Adicione a tupla do router de especialidades (logo após a de dentistas):

Antes:

```python
ROUTERS = [
    (auth_router, ["Autenticação"], "autenticação"),
    (usuario_router, ["Usuário"], "usuário"),
    (clinica_router, ["Clinica"], "clinica"),
    (dentista_router, ["Dentistas"], "dentistas"),
    (paciente_router, ["Pacientes"], "pacientes"),
    (consulta_router, ["Consultas"], "consultas"),
    (atendimento_router, ["Atendimentos"], "atendimentos"),
]
```

Depois:

```python
ROUTERS = [
    (auth_router, ["Autenticação"], "autenticação"),
    (usuario_router, ["Usuário"], "usuário"),
    (clinica_router, ["Clinica"], "clinica"),
    (dentista_router, ["Dentistas"], "dentistas"),
    (especialidade_router, ["Especialidades"], "especialidades"),
    (paciente_router, ["Pacientes"], "pacientes"),
    (consulta_router, ["Consultas"], "consultas"),
    (atendimento_router, ["Atendimentos"], "atendimentos"),
]
```

> O loop `for router, tags, nome in ROUTERS: app.include_router(router, prefix=API_PREFIX, ...)` inclui tudo sob `/api`. É aqui que `/especialidades` vira `/api/especialidades`.

**Reinicie o backend** (Ctrl+C no Terminal 1 e `.venv/bin/python main.py` de novo). Olhe os logs: deve aparecer `Tabela 'especialidade' criada/verificada` e `Router de especialidades incluído em /api`. Se aparecer um erro de import, releia os passos 7.1 e 7.2.

### 8. `backend/routes/clinica_routes.py` — EDIÇÃO

O endpoint agregador `GET /clinica/dados` devolve tudo de uma vez no boot do SPA. Vamos incluir a lista de especialidades ali, para o front já carregar as opções junto com o resto. São **três mudanças** neste arquivo.

**Mudança 8.1 — importar o Response.** No bloco de imports de schemas de saída, adicione:

```python
# Schemas (saída)
from dtos.responses.dentista_response import DentistaResponse
from dtos.responses.especialidade_response import EspecialidadeResponse
from dtos.responses.paciente_response import PacienteResponse
from dtos.responses.consulta_response import ConsultaResponse
from dtos.responses.atendimento_response import AtendimentoResponse
```

**Mudança 8.2 — importar o repo.** No bloco `from repo import (`, adicione `especialidade_repo`:

```python
from repo import (
    dentista_repo,
    especialidade_repo,
    paciente_repo,
    consulta_repo,
    atendimento_repo,
)
```

**Mudança 8.3 — incluir a lista no retorno.** Dentro da função `dados`, no dicionário retornado, adicione a chave `especialidades`:

```python
    return {
        "dentists": [
            DentistaResponse.de_dentista(d) for d in dentista_repo.obter_todos()
        ],
        "especialidades": [
            EspecialidadeResponse.de_especialidade(e) for e in especialidade_repo.obter_todos()
        ],
        "patients": [
            PacienteResponse.de_paciente(p) for p in paciente_repo.obter_todos()
        ],
        "consultas": [
            ConsultaResponse.de_consulta(c) for c in consulta_repo.obter_todos()
        ],
        "atendimentos": [
            AtendimentoResponse.de_atendimento(a)
            for a in atendimento_repo.obter_todos()
        ],
    }
```

Pontos importantes:
- A chave do JSON é `"especialidades"` (plural, minúsculo). O front (passo 10) vai ler exatamente essa chave. Se você escrever diferente de um lado, quebra.

**Teste rápido do backend** antes de ir para o front. Com o backend rodando e logado no app pelo navegador (para ter o cookie de sessão), você pode também testar pela doc interativa em `http://localhost:8400/docs`: lá aparecem os novos endpoints `Especialidades`. Crie uma especialidade pelo POST e confira no GET.

---

## Parte 2 — Frontend

> Lembrete do projeto: **não existe Zod neste projeto** (o `lib/schemas.ts` da documentação antiga não está presente para o domínio da clínica). A validação real é a do backend (422). No front você só confia no contrato. Não crie schema Zod para especialidade.

### 9. `frontend/src/lib/types.ts` — EDIÇÃO

Os tipos TypeScript espelham os Response DTOs do backend. Vamos adicionar `Especialidade`. Coloque logo após a interface `Dentista` (na seção "OdontoX — domínio da clínica").

```ts
export interface Especialidade {
  id: number
  nome: string
}
```

Pontos importantes:
- Os campos batem com o `EspecialidadeResponse` do backend (`id`, `nome`).
- Não invente campos a mais; o tipo é o "contrato" com a API.

### 10. `frontend/src/lib/odontox/clinicaApi.ts` — EDIÇÃO

Aqui ficam as chamadas HTTP de domínio (sobre o cliente central `@/lib/api`). São **três mudanças**.

**Mudança 10.1 — importar o tipo.** Na linha de import de tipos, adicione `Especialidade`:

```ts
import type { Atendimento, Consulta, Dentista, Especialidade, Paciente, StatusConsulta } from '@/lib/types'
```

**Mudança 10.2 — incluir no `DadosClinica`.** A interface `DadosClinica` descreve o que `GET /clinica/dados` devolve. Adicione a lista:

```ts
export interface DadosClinica {
  dentists: Dentista[]
  especialidades: Especialidade[]
  patients: Paciente[]
  consultas: Consulta[]
  atendimentos: Atendimento[]
}
```

> O nome `especialidades` aqui tem que ser IGUAL à chave do JSON que o backend devolve (passo 8.3).

**Mudança 10.3 — adicionar as funções de API.** Dentro do objeto `clinicaApi`, adicione um bloco de especialidades (pode colocar logo após o bloco de dentistas):

```ts
  // ---- especialidades ----
  createEspecialidade: (f: Partial<Especialidade>) => api.post<Especialidade>('/especialidades', f),
  updateEspecialidade: (id: number, f: Partial<Especialidade>) => api.put<Especialidade>('/especialidades/' + id, f),
```

Pontos importantes:
- Os caminhos são RELATIVOS a `/api` (não escreva `/api/especialidades`, só `/especialidades`). O cliente central adiciona o prefixo, o cookie de sessão e o header CSRF automaticamente.
- `api.post<Especialidade>` diz que a resposta é um `Especialidade`. Isso vem do Response DTO do backend.

### 11. `frontend/src/context/ClinicContext.tsx` — EDIÇÃO

O contexto carrega `GET /clinica/dados` no boot e guarda as listas. Páginas leem daqui (não fazem fetch direto). Vamos: (a) guardar `especialidades` no estado, (b) tipar a ação `saveEspecialidade`, (c) implementar a ação, (d) expor no `value`. São **quatro mudanças**.

**Mudança 11.1 — importar o tipo.** Na linha de import de tipos, adicione `Especialidade`:

```ts
import type { Atendimento, Consulta, Dentista, Especialidade, Paciente, StatusConsulta } from '@/lib/types'
```

**Mudança 11.2 — adicionar ao `ClinicData`.** Procure a interface `ClinicData` e adicione a lista:

```ts
interface ClinicData {
  dentists: Dentista[]
  especialidades: Especialidade[]
  patients: Paciente[]
  consultas: Consulta[]
  atendimentos: Atendimento[]
}
```

**Mudança 11.3 — declarar a ação no contrato.** Na interface `ClinicContextValue`, adicione a assinatura (pode colocar perto de `saveDentist`):

```ts
  saveEspecialidade: (form: Partial<Especialidade> & { id?: number }) => Promise<void>
```

**Mudança 11.4 — inicializar o estado.** Procure o `useState<ClinicData>({ ... })` e adicione `especialidades: []`:

```ts
  const [data, setData] = useState<ClinicData>({ dentists: [], especialidades: [], patients: [], consultas: [], atendimentos: [] })
```

> Você NÃO precisa mexer no `useEffect` que faz `api.getAll()`. Como o backend agora devolve `especialidades` dentro de `/clinica/dados`, o `setData(d)` já preenche a lista sozinho.

**Mudança 11.5 — implementar a ação.** Logo após o bloco `// ---- dentistas ----` (depois de `toggleDentist`), adicione:

```ts
  // ---- especialidades ----
  const saveEspecialidade = useCallback(async (form: Partial<Especialidade> & { id?: number }) => {
    if (form.id) {
      const updated = await api.updateEspecialidade(form.id, form)
      setData((d) => ({ ...d, especialidades: d.especialidades.map((x) => (x.id === form.id ? updated : x)) }))
    } else {
      const created = await api.createEspecialidade(form)
      setData((d) => ({ ...d, especialidades: [...d.especialidades, created] }))
    }
  }, [])
```

**Mudança 11.6 — expor no `value`.** Procure o objeto `const value: ClinicContextValue = { ... }` e adicione `saveEspecialidade` na lista:

```ts
  const value: ClinicContextValue = {
    ...data,
    loading,
    dentist,
    patient,
    atendimentoFor,
    saveConsulta,
    setConsultaStatus,
    savePatient,
    saveDentist,
    toggleDentist,
    saveEspecialidade,
    saveAtendimento,
  }
```

Pontos importantes:
- O padrão de `saveEspecialidade` é igual ao `saveDentist`: se tem `id`, faz PUT e substitui no array; senão faz POST e acrescenta. O estado é atualizado de forma imutável (`map` / spread `[...]`).
- Como `...data` está no `value`, a lista `especialidades` fica disponível para as páginas via `useClinic()`.

### 12. `frontend/src/pages/odontox/EspecialidadesPage.tsx` — ARQUIVO NOVO

A página de CRUD. Segue o padrão das páginas: default export com o mesmo nome do arquivo, inline styles, dados de `useClinic()`, modal via `useModal()`. É mais simples que `DentistasPage` porque a entidade só tem `nome`.

```tsx
import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { Plus, Pencil } from '@/components/odontox/icons';
import Button from '@/components/odontox/Button';

export default function EspecialidadesPage() {
  const { especialidades } = useClinic();
  const { open } = useModal();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <header style={{ padding: '24px 32px', background: '#fff', borderBottom: '1px solid #E6ECEC', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 3px', color: '#0F2225' }}>Especialidades</h1>
          <p style={{ fontSize: 14, color: '#5B6B6E', margin: 0 }}>Lista usada no cadastro de dentistas</p>
        </div>
        <Button onClick={() => open('especialidadeForm')}><Plus /> Nova especialidade</Button>
      </header>

      <div className="ox-scroll" style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {especialidades.length === 0 ? (
          <p style={{ fontSize: 14, color: '#94A3A5' }}>Nenhuma especialidade cadastrada ainda.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {especialidades.map((e) => (
              <div key={e.id} style={{ background: '#fff', border: '1px solid #E6ECEC', borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1B2B2E' }}>{e.nome}</span>
                <Button variant="ghost" hoverDim={false} style={{ padding: 9, fontSize: 13.5 }} onClick={() => open('especialidadeForm', { entity: e })}><Pencil /> Editar</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

Pontos importantes:
- `const { especialidades } = useClinic();` — lê a lista do contexto (não faz fetch ad-hoc).
- `open('especialidadeForm')` abre o modal de criação; `open('especialidadeForm', { entity: e })` abre em modo edição passando a especialidade. O tipo de modal `'especialidadeForm'` é registrado no passo 14.
- Ícones (`Plus`, `Pencil`) vêm de `@/components/odontox/icons`. Não use bibliotecas de ícone externas.
- Inline styles (`CSSProperties`); o projeto não usa Bootstrap.

### 13. `frontend/src/components/odontox/modals/EspecialidadeFormModal.tsx` — ARQUIVO NOVO

O modal de cadastro/edição. Usa o hook `useForm` e os componentes `Modal`/`ModalFooter`/`TextInput`. Espelha o `DentistFormModal`, bem mais enxuto.

```tsx
import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { useForm } from '@/hooks/useForm';
import Modal from '@/components/odontox/Modal';
import ModalFooter from '@/components/odontox/ModalFooter';
import { TextInput } from '@/components/odontox/Field';
import type { Especialidade } from '@/lib/types';

export default function EspecialidadeFormModal({ entity }: { entity?: Especialidade }) {
  const { saveEspecialidade } = useClinic();
  const { close } = useModal();

  const { form, field } = useForm(
    entity
      ? { id: entity.id as number | undefined, nome: entity.nome }
      : { id: undefined as number | undefined, nome: '' }
  );

  const save = () => { saveEspecialidade(form); close(); };

  return (
    <Modal onClose={close} maxWidth={460} title={entity ? 'Editar especialidade' : 'Nova especialidade'}>
      <div className="ox-scroll" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
        <TextInput label="Nome" placeholder="Ex.: Ortodontia" {...field('nome')} />
      </div>
      <ModalFooter onCancel={close} onSave={save} saveLabel="Salvar especialidade" />
    </Modal>
  );
}
```

Pontos importantes:
- `useForm(...)` recebe o estado inicial. Se `entity` existe (edição), pré-preenche; senão começa vazio com `id: undefined`.
- `{...field('nome')}` conecta o input ao estado (faz o `value` e `onChange` automaticamente).
- `save()` chama `saveEspecialidade(form)` (a ação do contexto, passo 11) e fecha o modal.
- `entity?: Especialidade` é opcional: sem ele = criar, com ele = editar.

### 14. `frontend/src/components/odontox/modals/ModalRoot.tsx` — EDIÇÃO

O `ModalRoot` decide qual modal renderizar com base no `type`. São **duas mudanças**.

**Mudança 14.1 — importar o modal.** Adicione o import junto dos outros:

```tsx
import DentistFormModal from './DentistFormModal';
import EspecialidadeFormModal from './EspecialidadeFormModal';
import AtendimentoFormModal from './AtendimentoFormModal';
```

**Mudança 14.2 — adicionar o case.** Dentro do `switch (modal.type)`, adicione (perto do `dentistForm`):

```tsx
    case 'dentistForm':
      return <DentistFormModal entity={modal.entity as never} />;
    case 'especialidadeForm':
      return <EspecialidadeFormModal entity={modal.entity as never} />;
```

Pontos importantes:
- A string `'especialidadeForm'` tem que ser IGUAL à que você usou no `open('especialidadeForm', ...)` da página (passo 12). Se digitar diferente, o modal não abre.
- `entity={modal.entity as never}` segue o mesmo padrão dos outros modais.

### 15. `frontend/src/router.tsx` — EDIÇÃO

Registre a rota `/especialidades` dentro do guard de autenticação. São **duas mudanças**.

**Mudança 15.1 — importar a página.** Adicione junto dos outros imports de página:

```tsx
import DentistasPage from '@/pages/odontox/DentistasPage'
import EspecialidadesPage from '@/pages/odontox/EspecialidadesPage'
```

**Mudança 15.2 — adicionar a rota.** Dentro do `children` do `<AppLayout />` (que está dentro do `<OdontoxGuard />`), adicione a rota:

```tsx
            children: [
              { path: '/agenda', element: <AgendaPage /> },
              { path: '/pacientes', element: <PacientesPage /> },
              { path: '/paciente/:id', element: <PacienteDetalhePage /> },
              { path: '/dentistas', element: <DentistasPage /> },
              { path: '/especialidades', element: <EspecialidadesPage /> },
            ],
```

Pontos importantes:
- A rota tem que ficar DENTRO do `<OdontoxGuard />` → `<AppLayout />` (assim ela é protegida por login e ganha a sidebar). Não coloque junto das rotas públicas (`/login`).

### 16. `frontend/src/components/odontox/Sidebar.tsx` — EDIÇÃO

Adicione o item de menu. São **duas mudanças**.

**Mudança 16.1 — importar um ícone.** O menu já importa ícones de `./icons`. Reutilize um existente para não inventar nada. Adicione `Check` (ou outro disponível) à linha de import:

```tsx
import { Calendar, Users, Tooth, Check, LogOut } from './icons'
```

**Mudança 16.2 — adicionar ao array `NAV`.** Acrescente o item:

```tsx
const NAV = [
  { to: '/agenda', label: 'Agenda', Icon: Calendar },
  { to: '/pacientes', label: 'Pacientes', Icon: Users, match: ['/pacientes', '/paciente'] },
  { to: '/dentistas', label: 'Dentistas', Icon: Tooth },
  { to: '/especialidades', label: 'Especialidades', Icon: Check },
]
```

Pontos importantes:
- `to` tem que ser igual ao `path` da rota (`/especialidades`).
- `Icon` é um componente de `icons.tsx`. Ícones disponíveis: `Check`, `Calendar`, `Users`, `Tooth`, `LogOut`, `ChevronLeft/Right/Down`, `Plus`, `Search`, `Edit`, `Pencil`, `Phone`, `Mail`, `AlertTriangle`. Escolha um e importe.

### 17. `frontend/src/components/odontox/modals/DentistFormModal.tsx` — EDIÇÃO

Agora o passo principal pedido: trocar o `TextInput` "Especialidade" por um `<Select>` alimentado pela lista. O projeto já tem um componente `Select` pronto em `@/components/odontox/Field`. São **três mudanças**.

**Mudança 17.1 — importar o `Select`.** Na linha que importa de `Field`, adicione `Select`:

```tsx
import { Field, TextInput, Select } from '@/components/odontox/Field';
```

**Mudança 17.2 — pegar a lista do contexto.** No início do componente, o `useClinic()` já é usado. Inclua `especialidades` na desestruturação:

```tsx
  const { saveDentist, especialidades } = useClinic();
```

**Mudança 17.3 — trocar o input pelo select.** Procure este bloco (o segundo input do grid de duas colunas):

```tsx
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextInput label="CRO" placeholder="CRO-SP 00000" {...field('cro')} />
          <TextInput label="Especialidade" placeholder="Ex.: Ortodontia" {...field('especialidade')} />
        </div>
```

E substitua o segundo campo (`Especialidade`) por um `Select`:

```tsx
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextInput label="CRO" placeholder="CRO-SP 00000" {...field('cro')} />
          <Select
            label="Especialidade"
            options={[
              { value: '', label: 'Selecione...' },
              ...especialidades.map((e) => ({ value: e.nome, label: e.nome })),
            ]}
            {...field('especialidade')}
          />
        </div>
```

Pontos importantes:
- O componente `Select` recebe `options` como um array de `{ value, label }`. A primeira opção `{ value: '', label: 'Selecione...' }` é o placeholder.
- `...especialidades.map((e) => ({ value: e.nome, label: e.nome }))` transforma a lista do contexto nas opções. Usamos o `nome` como `value` porque o campo `especialidade` do dentista guarda o texto da especialidade (é assim que o backend de dentista espera). Não mudamos o contrato do dentista.
- `{...field('especialidade')}` conecta o select ao mesmo campo do form que antes estava no TextInput. O `useForm` já trata `onChange` de `<select>`, então funciona sem mexer em mais nada.
- Tudo o mais do modal (nome, telefone, e-mail, ativo, salvar) continua igual.

> Por que `value` é o `nome` e não o `id`? Porque a entidade Dentista, no backend, guarda `especialidade` como TEXTO (string), não como id. Estamos só trocando "digitar" por "escolher da lista" — sem alterar o formato dos dados de dentista. Se um dia o dentista passasse a guardar `especialidade_id`, aí o `value` seria o `id` e haveria mudança no backend de dentista (fora do escopo deste tutorial).

---

## Como testar

### Passo a passo manual (fluxo de tela)

1. **Reinicie o backend** (Terminal 1: Ctrl+C, depois `.venv/bin/python main.py`). Confira nos logs: `Tabela 'especialidade' criada/verificada` e `Router de especialidades incluído em /api`.
2. **Garanta o front rodando** (Terminal 2: `npm run dev`). Abra `http://localhost:5180` e faça login.
3. No menu lateral, clique em **Especialidades**. A página deve abrir (vazia no começo).
4. Clique em **Nova especialidade**, digite `Ortodontia` e salve. Ela aparece na lista (sem recarregar a página).
5. Cadastre mais umas: `Endodontia`, `Implantodontia`.
6. Clique em **Editar** numa delas, mude o nome, salve. A alteração aparece na hora.
7. Vá em **Dentistas** → **Novo dentista** (ou Editar). O campo **Especialidade** agora é um **select** com as opções que você cadastrou. Escolha uma e salve o dentista.
8. Confira que o dentista salvou com a especialidade escolhida (aparece no card do dentista).

### Teste pela documentação interativa (opcional)

Com o backend rodando e logado no navegador (para ter o cookie de sessão), abra `http://localhost:8400/docs`. Devem aparecer os endpoints sob a tag **Especialidades**. Teste o `POST /api/especialidades` com `{ "nome": "Periodontia" }` e depois o `GET /api/especialidades`.

### Typecheck do front

Antes de considerar pronto, rode na pasta `frontend/`:

```bash
npx tsc -b --noEmit
```

Não pode haver erro de tipo. Se reclamar de `especialidades` não existir em algum lugar, você esqueceu de editar `types.ts`, `clinicaApi.ts` ou `ClinicContext.tsx`.

### Teste automatizado (opcional, se quiser seguir o padrão)

O projeto usa pytest no backend. Um teste de unidade simples do repo (rodar a partir de `backend/`):

```bash
.venv/bin/python -m pytest tests/unit -k especialidade
```

Se você quiser escrever um, espelhe um teste existente de `dentista_repo` em `tests/unit/`, criando, lendo e atualizando uma especialidade. (Não é obrigatório para a feature funcionar.)

---

## Erros comuns e como resolver

1. **"A página /especialidades abre mas a lista está sempre vazia, mesmo depois de cadastrar."**
   Provável causa: a chave do JSON não bate. Confira que o backend devolve `"especialidades"` em `clinica_routes.py` (passo 8.3) e que o front lê `especialidades` em `DadosClinica` (passo 10.2) e em `ClinicData` (passo 11.2). Tem que ser a MESMA palavra nos dois lados.

2. **"Erro 404 ao salvar / a tabela não foi criada."**
   Você esqueceu de registrar no `main.py`. Reabra o passo 7 e confira as quatro mudanças: importar `especialidade_repo`, importar `especialidade_router`, adicionar `(especialidade_repo, "especialidade")` em `TABELAS`, adicionar a tupla em `ROUTERS`. Reinicie o backend e veja se aparece `Tabela 'especialidade' criada/verificada` nos logs. Este é o erro #1 da turma.

3. **"Erro de import ao subir o backend (ModuleNotFoundError / ImportError)."**
   Nome de arquivo ou função errado. O repo PRECISA ter a função `criar_tabela()` (sem ela o loop de `TABELAS` quebra). Os imports usam o nome exato do arquivo: `from repo import especialidade_repo`, `from routes.especialidade_routes import router as especialidade_router`. Confira a grafia.

4. **"403 ao salvar pelo front (mas no /docs funciona)."**
   É CSRF. O cliente central (`@/lib/api`) já manda o header `X-CSRF-Token` e o cookie automaticamente — mas só se você usar `clinicaApi`/`api` (passos 10 e 11). NUNCA chame `fetch` direto na página. Se você criou a chamada fora do `clinicaApi`, mova para lá.

5. **"O campo Especialidade do dentista some / não mostra as opções."**
   Confira o passo 17: importou `Select`? pegou `especialidades` do `useClinic()`? O `options` precisa começar com o placeholder `{ value: '', label: 'Selecione...' }` e depois o `...especialidades.map(...)`. Se `especialidades` for `undefined`, é porque o passo 11.4 (inicializar `especialidades: []` no estado) ficou faltando.

6. **"O typecheck (`tsc`) reclama que `saveEspecialidade` não existe em `useClinic()`."**
   No `ClinicContext.tsx` faltou um dos quatro pontos: declarar na interface `ClinicContextValue` (11.3), implementar a função (11.5) e colocá-la no objeto `value` (11.6). Os três têm que existir.

7. **"422 ao salvar especialidade com nome curto."**
   Isso é esperado: o DTO exige nome com 2 a 100 caracteres (passo 4). Digite um nome válido. A mensagem de erro vem do backend; se quiser exibir bonito, leia `ApiError.errors` no front (mas o toast padrão já mostra a mensagem).

---

## Checklist final

Marque cada item só depois de conferir de verdade.

**Backend**
- [ ] `backend/sql/especialidade_sql.py` criado com `CRIAR_TABELA`, `INSERIR`, `OBTER_TODOS`, `OBTER_POR_ID`, `ATUALIZAR`.
- [ ] `backend/model/especialidade_model.py` criado (dataclass `Especialidade` com `id` e `nome`).
- [ ] `backend/repo/especialidade_repo.py` criado com `_row_to_especialidade`, `criar_tabela`, `inserir`, `obter_todos`, `obter_por_id`, `atualizar`.
- [ ] `backend/dtos/especialidade_dto.py` criado (`EspecialidadeDTO` com validador de `nome`).
- [ ] `backend/dtos/responses/especialidade_response.py` criado (`EspecialidadeResponse` com `de_especialidade`).
- [ ] `backend/routes/especialidade_routes.py` criado (GET/POST/PUT, `@requer_autenticacao()`, prefix `/especialidades`).
- [ ] `backend/main.py`: importou o repo, importou o router, adicionou `(especialidade_repo, "especialidade")` em `TABELAS`, adicionou a tupla em `ROUTERS`.
- [ ] `backend/routes/clinica_routes.py`: importou Response e repo, e incluiu `"especialidades"` no retorno de `/dados`.
- [ ] Backend reinicia sem erro e os logs mostram a tabela criada e o router incluído.

**Frontend**
- [ ] `frontend/src/lib/types.ts`: interface `Especialidade` adicionada.
- [ ] `frontend/src/lib/odontox/clinicaApi.ts`: tipo importado, `especialidades` no `DadosClinica`, `createEspecialidade`/`updateEspecialidade`.
- [ ] `frontend/src/context/ClinicContext.tsx`: tipo importado, `especialidades` no `ClinicData`, estado inicial `especialidades: []`, assinatura + implementação `saveEspecialidade`, exposto no `value`.
- [ ] `frontend/src/pages/odontox/EspecialidadesPage.tsx` criado.
- [ ] `frontend/src/components/odontox/modals/EspecialidadeFormModal.tsx` criado.
- [ ] `frontend/src/components/odontox/modals/ModalRoot.tsx`: import + `case 'especialidadeForm'`.
- [ ] `frontend/src/router.tsx`: import da página + rota `/especialidades` dentro do guard.
- [ ] `frontend/src/components/odontox/Sidebar.tsx`: item `Especialidades` no `NAV`.
- [ ] `frontend/src/components/odontox/modals/DentistFormModal.tsx`: `Select` importado, `especialidades` do contexto, campo "Especialidade" virou `<Select>`.
- [ ] `npx tsc -b --noEmit` passa sem erros.

**Fluxo de ponta a ponta**
- [ ] Consigo criar, listar e editar especialidades pela tela `/especialidades`.
- [ ] O modal de dentista mostra a especialidade como select com as opções cadastradas.
- [ ] Salvar um dentista com a especialidade escolhida funciona e aparece no card.

Pronto! Se todos os itens estão marcados, a feature está completa e seguindo o padrão real do projeto.
