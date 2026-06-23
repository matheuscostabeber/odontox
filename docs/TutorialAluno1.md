# Tutorial — CRUD de Procedimentos + select no formulário de consulta

> Tutorial passo a passo, do zero ao funcionando. Leia com calma e siga **na ordem**. Não pule etapas. Cada passo mostra o **caminho completo do arquivo**, se ele é **NOVO** ou **EDIÇÃO**, o **código** e uma explicação curta. Se você seguir tudo ao pé da letra, a feature vai funcionar.

---

## O que você vai construir

Você vai adicionar uma entidade nova chamada **Procedimento** (com os campos `nome`, `duracao_minutos` e `valor_referencia`) ao sistema OdontoX, copiando fielmente o padrão que já existe para a entidade **Dentista**. Será um CRUD completo (criar, listar, editar) ponta a ponta: do banco de dados SQLite até uma página React. No final, o cadastro de procedimentos alimenta um **campo de seleção (select)** no formulário de agendamento de consulta — hoje esse campo é um texto livre e vamos trocá-lo por uma lista pronta.

Resultado final que você vai ter:

- Uma **tabela `procedimento`** no banco, criada automaticamente quando o backend sobe.
- Um **endpoint REST** `/api/procedimentos` com `GET`, `POST` e `PUT` (listar, criar, editar).
- A lista de procedimentos incluída no **agregador** `GET /api/clinica/dados` (a carga inicial do SPA).
- Um **tipo TypeScript** `Procedimento` e chamadas no cliente de domínio do front.
- Uma **página nova** `/procedimentos` com lista e formulário, acessível pela **Sidebar**.
- O campo "Procedimento previsto" do **formulário de consulta** virou um **select** alimentado por essa lista.

---

## Pré-requisitos

Antes de começar, deixe os dois servidores rodando. Abra **dois terminais**.

### Terminal 1 — Backend (rodar a partir da pasta `backend/`)

O `.python-version` aponta para uma versão de Python que pode não estar instalada. **Sempre** use o interpretador do `venv` do projeto:

```bash
cd backend
.venv/bin/python main.py
```

O backend sobe (em dev, na porta `8400`). A documentação interativa fica em `http://localhost:8400/docs`.

> Dica: deixe esse terminal aberto. Quando você editar arquivos `.py`, o servidor recarrega sozinho (reload ativado em dev). Se não recarregar, pare com `Ctrl+C` e rode de novo.

### Terminal 2 — Frontend (rodar a partir da pasta `frontend/`)

```bash
cd frontend
npm run dev
```

O Vite sobe na porta `5180` e faz proxy de `/api` para o backend. Abra `http://localhost:5180` no navegador.

### Login

A aplicação exige usuário logado. Use o usuário-semente:

- E-mail: `odontox@ifes.site`
- (A senha do seed; consulte o seed/admin com seu professor se não souber.)

---

## As camadas que vamos tocar e a ORDEM de implementação

O backend deste projeto segue as camadas **Routes → DTOs → Repos → SQL → DB** (sem ORM, SQL puro). O segredo para não se perder é implementar **de baixo para cima**: primeiro a base (banco), depois o que usa a base, e por último a tela. Assim, quando você for testar uma camada, a camada de baixo já existe e funciona.

Ordem que vamos seguir:

**Backend**

1. `backend/sql/procedimento_sql.py` — **(NOVO)** as queries SQL (cria tabela, insere, lista, etc.).
2. `backend/model/procedimento_model.py` — **(NOVO)** o `@dataclass` de domínio.
3. `backend/repo/procedimento_repo.py` — **(NOVO)** funções que executam o SQL.
4. `backend/dtos/procedimento_dto.py` — **(NOVO)** o DTO de **entrada** (o que o front envia).
5. `backend/dtos/responses/procedimento_response.py` — **(NOVO)** o DTO de **saída** (o que a API responde).
6. `backend/routes/procedimento_routes.py` — **(NOVO)** o router com os endpoints.
7. `backend/main.py` — **(EDIÇÃO)** registrar a **tabela** no startup e o **router** sob `/api`.
8. `backend/routes/clinica_routes.py` — **(EDIÇÃO)** incluir a lista de procedimentos no agregador `/clinica/dados`.

**Frontend**

9. `frontend/src/lib/types.ts` — **(EDIÇÃO)** o tipo `Procedimento`.
10. `frontend/src/lib/odontox/clinicaApi.ts` — **(EDIÇÃO)** `DadosClinica` ganha `procedimentos` + chamadas CRUD.
11. `frontend/src/context/ClinicContext.tsx` — **(EDIÇÃO)** estado e ações `saveProcedimento`.
12. `frontend/src/components/odontox/modals/ProcedimentoFormModal.tsx` — **(NOVO)** o modal de formulário.
13. `frontend/src/components/odontox/modals/ModalRoot.tsx` — **(EDIÇÃO)** registrar o novo modal.
14. `frontend/src/pages/odontox/ProcedimentosPage.tsx` — **(NOVO)** a página.
15. `frontend/src/router.tsx` — **(EDIÇÃO)** a rota `/procedimentos`.
16. `frontend/src/components/odontox/Sidebar.tsx` — **(EDIÇÃO)** o item de menu.
17. `frontend/src/components/odontox/modals/ConsultaFormModal.tsx` — **(EDIÇÃO)** trocar o texto livre por um select.

**Por que essa ordem?** Cada arquivo depende do que vem antes dele. O repo importa o SQL e o model; o router importa o DTO, o response e o repo; o front importa o tipo. Se você criar a tela primeiro, nada vai funcionar porque o endpoint ainda não existe. Indo de baixo para cima, você consegue testar cada camada assim que a termina.

> ⚠️ Os passos **7** (registrar tabela e router no `main.py`) e **15/16** (registrar rota e menu) são os que os alunos **mais esquecem**. Sem eles, a tabela não é criada, o endpoint dá 404, e a página não aparece. Preste atenção dobrada neles.

---

# PARTE 1 — BACKEND

## Passo 1 — SQL da entidade

**Arquivo:** `backend/sql/procedimento_sql.py`
**Tipo:** ARQUIVO NOVO

Cada entidade tem um arquivo de SQL com as queries em **constantes de string**. Copiamos a estrutura de `sql/dentista_sql.py`, trocando os campos. Use placeholders `?` (prepared statements) — **nunca** monte a query com f-string.

```python
CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS procedimento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    duracao_minutos INTEGER NOT NULL DEFAULT 30,
    valor_referencia REAL NOT NULL DEFAULT 0
)
"""

INSERIR = """
INSERT INTO procedimento (nome, duracao_minutos, valor_referencia)
VALUES (?, ?, ?)
"""

OBTER_TODOS = """
SELECT id, nome, duracao_minutos, valor_referencia
FROM procedimento
ORDER BY nome
"""

OBTER_POR_ID = """
SELECT id, nome, duracao_minutos, valor_referencia
FROM procedimento
WHERE id = ?
"""

ATUALIZAR = """
UPDATE procedimento
SET nome = ?, duracao_minutos = ?, valor_referencia = ?
WHERE id = ?
"""
```

Pontos importantes:

- `id INTEGER PRIMARY KEY AUTOINCREMENT`: o banco gera o id sozinho.
- `duracao_minutos` é `INTEGER` (número inteiro de minutos).
- `valor_referencia` é `REAL` (número com casas decimais, o "preço base").
- `CREATE TABLE IF NOT EXISTS`: cria só se não existir; pode rodar várias vezes sem erro.
- A ordem das colunas no `INSERT`/`SELECT`/`UPDATE` precisa **bater** com a ordem dos `?` que o repo vai passar. Mantenha igual.

---

## Passo 2 — Model (entidade de domínio)

**Arquivo:** `backend/model/procedimento_model.py`
**Tipo:** ARQUIVO NOVO

O model é um `@dataclass` puro, em `snake_case`. Copiamos o estilo de `model/dentista_model.py`.

```python
from dataclasses import dataclass


@dataclass
class Procedimento:
    id: int
    nome: str
    duracao_minutos: int
    valor_referencia: float
```

Pontos importantes:

- É só um "saco de dados" tipado. Sem lógica, sem banco.
- Os nomes dos campos são **iguais aos da tabela** (`snake_case`). Isso facilita a conversão linha→model.

---

## Passo 3 — Repo (funções que falam com o banco)

**Arquivo:** `backend/repo/procedimento_repo.py`
**Tipo:** ARQUIVO NOVO

O repo importa as constantes do SQL e expõe **funções de módulo** (não classes). Cada função abre a conexão com `obter_conexao()` (um context manager que já faz commit no sucesso e rollback no erro). Copiamos fielmente `repo/dentista_repo.py`.

```python
"""Repositório de Procedimentos."""

import sqlite3
from typing import Optional

from model.procedimento_model import Procedimento
from sql.procedimento_sql import (
    CRIAR_TABELA,
    INSERIR,
    OBTER_TODOS,
    OBTER_POR_ID,
    ATUALIZAR,
)
from util.db_util import obter_conexao
from util.logger_config import logger


def _row_to_procedimento(row: sqlite3.Row) -> Procedimento:
    return Procedimento(
        id=row["id"],
        nome=row["nome"],
        duracao_minutos=row["duracao_minutos"],
        valor_referencia=row["valor_referencia"],
    )


def criar_tabela() -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


def inserir(procedimento: Procedimento) -> Optional[int]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(INSERIR, (
            procedimento.nome,
            procedimento.duracao_minutos,
            procedimento.valor_referencia,
        ))
        return cursor.lastrowid


def obter_todos() -> list[Procedimento]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        rows = cursor.fetchall()
        return [_row_to_procedimento(row) for row in rows]


def obter_por_id(id: int) -> Optional[Procedimento]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        if row:
            return _row_to_procedimento(row)
        return None


def atualizar(procedimento: Procedimento) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR, (
            procedimento.nome,
            procedimento.duracao_minutos,
            procedimento.valor_referencia,
            procedimento.id,
        ))
        return cursor.rowcount > 0
```

Pontos importantes:

- `_row_to_procedimento(row)`: função privada que converte uma linha do banco no model. No dentista ela normaliza `NULL` e converte inteiro↔bool; aqui não precisamos disso porque os campos são `NOT NULL` com default.
- `inserir(...)` retorna `cursor.lastrowid` (o id novo).
- `atualizar(...)` retorna `cursor.rowcount > 0` (`True` se realmente atualizou alguma linha).
- A **ordem** dos valores na tupla do `execute` precisa bater com a ordem dos `?` no SQL. Compare com o Passo 1.
- `criar_tabela()` é o que o `main.py` vai chamar no startup (Passo 7).
- Repare que importamos o `logger`; mesmo sem usar agora, mantemos o padrão do projeto. Se o seu linter reclamar de import não usado, pode remover esta linha — mas o `dentista_repo` mantém ela, então deixe.

---

## Passo 4 — DTO de entrada (o que o front envia)

**Arquivo:** `backend/dtos/procedimento_dto.py`
**Tipo:** ARQUIVO NOVO

O DTO de entrada é um `BaseModel` do Pydantic. Ele descreve **exatamente** o JSON que o front manda no corpo do `POST`/`PUT`. Copiamos o estilo de `dtos/dentista_dto.py`.

```python
from pydantic import BaseModel, Field


class ProcedimentoDTO(BaseModel):
    """DTO para criação/edição de procedimento."""

    nome: str = Field(..., description="Nome do procedimento")
    duracao_minutos: int = Field(default=30, description="Duração padrão em minutos")
    valor_referencia: float = Field(default=0, description="Valor de referência (R$)")
```

Pontos importantes:

- `nome: str = Field(...)` → o `...` significa **obrigatório**. Se o front não mandar `nome`, o Pydantic devolve **422** automaticamente.
- `duracao_minutos` e `valor_referencia` têm `default`, então são opcionais.
- **Importante (contrato):** os nomes dos campos do DTO precisam casar com o que o front envia. Como o front vai mandar um objeto `Procedimento` cru (veja Passo 10), use os mesmos nomes do tipo TypeScript. No nosso caso, vamos usar `snake_case` (`duracao_minutos`, `valor_referencia`) tanto no front quanto aqui — então fica consistente. **Não troque a grafia de um lado só.**

---

## Passo 5 — Response (o que a API devolve)

**Arquivo:** `backend/dtos/responses/procedimento_response.py`
**Tipo:** ARQUIVO NOVO

O Response descreve o JSON de **saída** e tem um classmethod que constrói a resposta a partir do model. É aqui que (no caso do dentista) acontece a tradução `snake_case → camelCase`. Copiamos `dtos/responses/dentista_response.py`.

Para manter simples e consistente com o tipo do front, vamos manter os mesmos nomes de campo (`duracaoMinutos` e `valorReferencia` em camelCase para a API). Atenção: **o que sai aqui precisa ser idêntico ao tipo TypeScript do Passo 9.** Vamos usar camelCase na saída, seguindo o padrão de `fotoUrl` do dentista.

```python
"""Schemas de resposta do módulo de procedimentos."""

from pydantic import BaseModel, Field

from model.procedimento_model import Procedimento


class ProcedimentoResponse(BaseModel):
    """Representação de um procedimento."""

    id: int
    nome: str
    duracaoMinutos: int = Field(..., description="Duração padrão em minutos")
    valorReferencia: float = Field(..., description="Valor de referência (R$)")

    @classmethod
    def de_procedimento(cls, procedimento: Procedimento) -> "ProcedimentoResponse":
        """Constrói o response a partir da entidade de domínio."""
        return cls(
            id=procedimento.id,
            nome=procedimento.nome,
            duracaoMinutos=procedimento.duracao_minutos,
            valorReferencia=procedimento.valor_referencia,
        )
```

Pontos importantes:

- `duracaoMinutos`/`valorReferencia` (camelCase na API) ↔ `duracao_minutos`/`valor_referencia` (snake_case no model/DB). A tradução acontece **só aqui**, no classmethod `de_procedimento`.
- Esse classmethod (`de_procedimento`) é o que o router vai usar para montar a resposta. Compare com `DentistaResponse.de_dentista`.

> Decisão de naming: o **DTO de entrada** (Passo 4) usa `snake_case` e o **Response de saída** usa `camelCase`. Isso espelha exatamente o dentista (entrada `cro`, saída `fotoUrl` etc.). No front, o que você **manda** no POST é snake_case e o que você **recebe** é camelCase. Vamos cuidar disso no Passo 9/10.

---

## Passo 6 — Router (os endpoints)

**Arquivo:** `backend/routes/procedimento_routes.py`
**Tipo:** ARQUIVO NOVO

Um router por módulo. Cada handler é `async def`, recebe `request: Request` como **primeiro parâmetro** e termina com `usuario_logado: Optional[UsuarioLogado] = None`. O decorator `@requer_autenticacao()` exige usuário logado (401 se anônimo) e injeta o `usuario_logado`. Copiamos `routes/dentista_routes.py` (sem a parte de cor/foto, que é específica do dentista).

```python
"""
Rotas para gerenciamento de procedimentos (API JSON).

Permite que usuários logados:
- Listem procedimentos
- Cadastrem novos procedimentos
- Editem procedimentos
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Request, status

# DTOs (entrada)
from dtos.procedimento_dto import ProcedimentoDTO

# Schemas (saída)
from dtos.responses.procedimento_response import ProcedimentoResponse

# Models
from model.procedimento_model import Procedimento
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import procedimento_repo

# Utilities
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger

router = APIRouter(prefix="/procedimentos")


# ---- Listagem ----

@router.get("", response_model=list[ProcedimentoResponse])
@requer_autenticacao()
async def listar(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista todos os procedimentos (ordenados por nome)."""
    assert usuario_logado is not None
    procedimentos = procedimento_repo.obter_todos()
    return [ProcedimentoResponse.de_procedimento(p) for p in procedimentos]


# ---- Criação ----

@router.post(
    "",
    response_model=ProcedimentoResponse,
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao()
async def criar(
    request: Request,
    dto: ProcedimentoDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cadastra um novo procedimento."""
    assert usuario_logado is not None

    procedimento = Procedimento(
        id=0,
        nome=dto.nome,
        duracao_minutos=dto.duracao_minutos,
        valor_referencia=dto.valor_referencia,
    )
    procedimento_id = procedimento_repo.inserir(procedimento)
    if not procedimento_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar o procedimento. Tente novamente.",
        )

    logger.info(f"Procedimento #{procedimento_id} '{dto.nome}' criado por usuário {usuario_logado.id}")

    criado = procedimento_repo.obter_por_id(procedimento_id)
    return ProcedimentoResponse.de_procedimento(criado)


# ---- Edição ----

@router.put("/{id}", response_model=ProcedimentoResponse)
@requer_autenticacao()
async def atualizar(
    request: Request,
    id: int,
    dto: ProcedimentoDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Atualiza um procedimento existente."""
    assert usuario_logado is not None

    existente = procedimento_repo.obter_por_id(id)
    if not existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Procedimento não encontrado.",
        )

    procedimento = Procedimento(
        id=id,
        nome=dto.nome,
        duracao_minutos=dto.duracao_minutos,
        valor_referencia=dto.valor_referencia,
    )
    procedimento_repo.atualizar(procedimento)

    logger.info(f"Procedimento #{id} atualizado por usuário {usuario_logado.id}")

    atualizado = procedimento_repo.obter_por_id(id)
    return ProcedimentoResponse.de_procedimento(atualizado)
```

Pontos importantes:

- `router = APIRouter(prefix="/procedimentos")` → o prefixo **NÃO** inclui `/api`. O `/api` é adicionado pelo `main.py`. O caminho final será `/api/procedimentos`.
- Toda handler tem `request: Request` como primeiro parâmetro e `usuario_logado: Optional[UsuarioLogado] = None` por último. O `@requer_autenticacao()` precisa dessa assinatura.
- O decorator `@requer_autenticacao()` fica **abaixo** do decorator de rota (`@router.get/post/put`).
- No `criar`, montamos um `Procedimento(id=0, ...)` (id provisório), inserimos, pegamos o id novo e devolvemos o registro recém-criado já no formato Response.
- No `atualizar`, primeiro checamos se existe (`404` se não). Depois atualizamos e devolvemos o atualizado.
- Erros sempre com `raise HTTPException(status_code=..., detail="...")`. Os handlers globais transformam isso no contrato `{detail, type, errors}`.
- Não há `DELETE` neste tutorial (espelhamos o dentista, que também não deleta). Se quiser, dá para adicionar depois.

---

## Passo 7 — Registrar a TABELA e o ROUTER no startup ⚠️

**Arquivo:** `backend/main.py`
**Tipo:** EDIÇÃO

Este é o passo que **mais gente esquece**. Sem ele, a tabela `procedimento` nunca é criada e o endpoint dá 404. São **três** pequenas edições no mesmo arquivo.

### 7.1 — Importar o repo novo

Procure o bloco de import dos repositórios (perto da linha 26). Está assim:

```python
# Repositórios (criação das tabelas)
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

Adicione `procedimento_repo` na lista:

```python
# Repositórios (criação das tabelas)
from repo import (
    usuario_repo,
    configuracao_repo,
    indices_repo,
    dentista_repo,
    paciente_repo,
    consulta_repo,
    atendimento_repo,
    procedimento_repo,
)
```

### 7.2 — Importar o router novo

Logo abaixo, procure o bloco de import das rotas (perto da linha 37):

```python
# Rotas (API JSON)
from routes.auth_routes import router as auth_router
from routes.usuario_routes import router as usuario_router
from routes.clinica_routes import router as clinica_router
from routes.dentista_routes import router as dentista_router
from routes.paciente_routes import router as paciente_router
from routes.consulta_routes import router as consulta_router
from routes.atendimento_routes import router as atendimento_router
```

Adicione a linha do procedimento:

```python
from routes.procedimento_routes import router as procedimento_router
```

### 7.3 — Registrar a tabela na lista `TABELAS`

Procure a lista `TABELAS` (perto da linha 90):

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

Adicione a tupla do procedimento:

```python
TABELAS = [
    (usuario_repo, "usuario"),
    (configuracao_repo, "configuracao"),
    (dentista_repo, "dentista"),
    (paciente_repo, "paciente"),
    (consulta_repo, "consulta"),
    (atendimento_repo, "atendimento"),
    (procedimento_repo, "procedimento"),
]
```

O loop logo abaixo (`for repo, nome in TABELAS: repo.criar_tabela()`) vai chamar `procedimento_repo.criar_tabela()` no startup. **É isso que cria a tabela no banco.**

### 7.4 — Registrar o router na lista `ROUTERS`

Procure a lista `ROUTERS` (perto da linha 125):

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

Adicione a tupla do procedimento:

```python
ROUTERS = [
    (auth_router, ["Autenticação"], "autenticação"),
    (usuario_router, ["Usuário"], "usuário"),
    (clinica_router, ["Clinica"], "clinica"),
    (dentista_router, ["Dentistas"], "dentistas"),
    (paciente_router, ["Pacientes"], "pacientes"),
    (consulta_router, ["Consultas"], "consultas"),
    (atendimento_router, ["Atendimentos"], "atendimentos"),
    (procedimento_router, ["Procedimentos"], "procedimentos"),
]
```

O loop `for router, tags, nome in ROUTERS: app.include_router(router, prefix=API_PREFIX, ...)` registra tudo sob `/api`. Como o router tem `prefix="/procedimentos"`, o resultado final é `/api/procedimentos`.

> ✅ Depois desta edição, **reinicie o backend** (Ctrl+C e `.venv/bin/python main.py`). Procure no log a linha `Tabela 'procedimento' criada/verificada` e `Router de procedimentos incluído em /api`. Se elas aparecerem, deu certo.

---

## Passo 8 — Incluir procedimentos no agregador `/clinica/dados`

**Arquivo:** `backend/routes/clinica_routes.py`
**Tipo:** EDIÇÃO

O SPA carrega tudo de uma vez via `GET /clinica/dados`. Vamos incluir a lista de procedimentos nessa carga. Duas edições no arquivo.

### 8.1 — Importar o response e o repo

No topo do arquivo, encontre os imports de schemas e de repos:

```python
# Schemas (saída)
from dtos.responses.dentista_response import DentistaResponse
from dtos.responses.paciente_response import PacienteResponse
from dtos.responses.consulta_response import ConsultaResponse
from dtos.responses.atendimento_response import AtendimentoResponse
```

Adicione o response de procedimento:

```python
from dtos.responses.procedimento_response import ProcedimentoResponse
```

E no bloco de repositórios:

```python
# Repositories
from repo import (
    dentista_repo,
    paciente_repo,
    consulta_repo,
    atendimento_repo,
)
```

Adicione `procedimento_repo`:

```python
# Repositories
from repo import (
    dentista_repo,
    paciente_repo,
    consulta_repo,
    atendimento_repo,
    procedimento_repo,
)
```

### 8.2 — Adicionar a chave no JSON de resposta

Encontre o `return` do handler `dados` e adicione a chave `procedimentos`:

```python
    return {
        "dentists": [
            DentistaResponse.de_dentista(d) for d in dentista_repo.obter_todos()
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
        "procedimentos": [
            ProcedimentoResponse.de_procedimento(p)
            for p in procedimento_repo.obter_todos()
        ],
    }
```

Pontos importantes:

- A chave `"procedimentos"` é o nome que o front vai esperar em `DadosClinica` (Passo 10). **Os dois lados têm que bater exato.**

> Neste ponto o backend está completo. Teste no navegador: acesse `http://localhost:8400/docs`, faça login pelo front (para ter o cookie de sessão), e olhe se o endpoint `GET /procedimentos` aparece na documentação. Você também pode criar um procedimento direto pelo `/docs`.

---

# PARTE 2 — FRONTEND

## Passo 9 — Tipo TypeScript `Procedimento`

**Arquivo:** `frontend/src/lib/types.ts`
**Tipo:** EDIÇÃO

Os tipos do front espelham os Response DTOs do backend (camelCase). Encontre a seção `// ===== OdontoX — domínio da clínica =====` e adicione a interface (pode ser logo depois da interface `Dentista`):

```ts
export interface Procedimento {
  id: number
  nome: string
  duracaoMinutos: number
  valorReferencia: number
}
```

Pontos importantes:

- `duracaoMinutos` e `valorReferencia` em **camelCase**, exatamente como o `ProcedimentoResponse` devolve (Passo 5). Se você digitar `duracao_minutos` aqui, os dados chegam `undefined` na tela.

---

## Passo 10 — Cliente de domínio (`clinicaApi`)

**Arquivo:** `frontend/src/lib/odontox/clinicaApi.ts`
**Tipo:** EDIÇÃO

As páginas não chamam `api` direto; chamam este wrapper. Três edições.

### 10.1 — Importar o tipo

No topo, encontre o import de tipos e adicione `Procedimento`:

```ts
import type { Atendimento, Consulta, Dentista, Paciente, Procedimento, StatusConsulta } from '@/lib/types'
```

### 10.2 — Incluir `procedimentos` em `DadosClinica`

Encontre a interface `DadosClinica` e adicione o campo:

```ts
export interface DadosClinica {
  dentists: Dentista[]
  patients: Paciente[]
  consultas: Consulta[]
  atendimentos: Atendimento[]
  procedimentos: Procedimento[]
}
```

> Esse campo `procedimentos` casa com a chave `"procedimentos"` que você adicionou no backend no Passo 8.2.

### 10.3 — Adicionar as chamadas CRUD

Dentro do objeto `clinicaApi`, adicione um bloco (pode ser depois do bloco de dentistas):

```ts
  // ---- procedimentos ----
  createProcedimento: (f: Record<string, unknown>) => api.post<Procedimento>('/procedimentos', f),
  updateProcedimento: (id: number, f: Record<string, unknown>) => api.put<Procedimento>('/procedimentos/' + id, f),
```

Pontos importantes:

- Os caminhos são **relativos a `/api`** (`'/procedimentos'`, não `'/api/procedimentos'`). O cliente central adiciona o prefixo.
- `api.post`/`api.put` já cuidam de `credentials:'include'` e do header `X-CSRF-Token`. Você não precisa fazer nada de CSRF manualmente.
- **Por que `Record<string, unknown>` (e não `Partial<Procedimento>`)?** Diferente do que `createDentist`/`createPatient` fazem (eles enviam o form camelCase cru, e a tradução para snake_case acontece só na volta, no Response), aqui o payload é montado em **snake_case** antes de enviar (Passo 11.4), porque o `ProcedimentoDTO` (Passo 4) espera `duracao_minutos`/`valor_referencia`. Esse objeto tem chaves que **não existem** no tipo `Procedimento` (que é camelCase), então `Partial<Procedimento>` **não compila** no TypeScript strict — o `tsc -b` que o próprio tutorial manda rodar falharia. Por isso a assinatura precisa aceitar um objeto solto (`Record<string, unknown>`). **Use esta assinatura desde já; não é opcional.**
- **A regra de ouro:** o que sai daqui no `POST`/`PUT` precisa ter os mesmos nomes do `ProcedimentoDTO`. Veja o Passo 11.4 sobre como montamos o payload em snake_case.

> Para não complicar a vida do aluno, vamos padronizar **snake_case no envio** e **camelCase no recebimento**, exatamente como o dentista faz com `fotoUrl`/`foto_url`. O formulário (Passo 12) usa camelCase no estado; o `ClinicContext` (Passo 11.4) monta o payload em snake_case antes de enviar.

---

## Passo 11 — Estado e ação no `ClinicContext`

**Arquivo:** `frontend/src/context/ClinicContext.tsx`
**Tipo:** EDIÇÃO

O `ClinicContext` é a fonte de dados de domínio. Vamos guardar a lista de procedimentos e expor uma ação `saveProcedimento`. Quatro edições pequenas.

### 11.1 — Importar o tipo

No import de tipos do topo, adicione `Procedimento`:

```ts
import type { Atendimento, Consulta, Dentista, Paciente, Procedimento, StatusConsulta } from '@/lib/types'
```

### 11.2 — Adicionar à interface interna `ClinicData`

```ts
interface ClinicData {
  dentists: Dentista[]
  patients: Paciente[]
  consultas: Consulta[]
  atendimentos: Atendimento[]
  procedimentos: Procedimento[]
}
```

### 11.3 — Declarar a ação na interface `ClinicContextValue`

Encontre `interface ClinicContextValue extends ClinicData {` e adicione a assinatura (pode ser depois de `toggleDentist`):

```ts
  saveProcedimento: (form: Partial<Procedimento> & { id?: number }) => Promise<void>
```

### 11.4 — Estado inicial, ação e expor no `value`

No `useState`, adicione `procedimentos: []`:

```ts
  const [data, setData] = useState<ClinicData>({ dentists: [], patients: [], consultas: [], atendimentos: [], procedimentos: [] })
```

Crie a ação (pode colocar logo abaixo de `toggleDentist`). Repare que ela monta o **payload em snake_case** para casar com o DTO do backend:

```ts
  // ---- procedimentos ----
  const saveProcedimento = useCallback(async (form: Partial<Procedimento> & { id?: number }) => {
    const payload = {
      nome: form.nome,
      duracao_minutos: Number(form.duracaoMinutos),
      valor_referencia: Number(form.valorReferencia),
    }
    if (form.id) {
      const updated = await api.updateProcedimento(form.id, payload)
      setData((d) => ({ ...d, procedimentos: d.procedimentos.map((x) => (x.id === form.id ? updated : x)) }))
    } else {
      const created = await api.createProcedimento(payload)
      setData((d) => ({ ...d, procedimentos: [...d.procedimentos, created] }))
    }
  }, [])
```

Por fim, adicione `saveProcedimento` no objeto `value` que o provider expõe (perto do final, junto de `toggleDentist`):

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
    saveProcedimento,
    saveAtendimento,
  }
```

Pontos importantes:

- O `payload` traduz `duracaoMinutos → duracao_minutos` e `valorReferencia → valor_referencia` **antes de enviar**. Isso resolve o contrato com o `ProcedimentoDTO` (que é snake_case).
- A resposta (`updated`/`created`) já vem em camelCase do backend e entra no estado como `Procedimento`. Sem tradução na volta.
- `Number(...)` garante que o `<input>` (que sempre dá string) vire número antes de enviar.
- A chamada `createProcedimento(payload)` recebe um objeto com chaves **snake_case** (`duracao_minutos`/`valor_referencia`), que **não existem** no tipo `Procedimento` (camelCase). Por isso, no Passo 10.3, as assinaturas de `createProcedimento`/`updateProcedimento` **já aceitam** `Record<string, unknown>` — e não `Partial<Procedimento>`. Isso é **necessário** (não opcional): com `Partial<Procedimento>`, o TypeScript strict rejeitaria o payload e o `npx tsc -b --noEmit` (que você roda em "Como testar") falharia. Confirme que o Passo 10.3 está assim:
  ```ts
  createProcedimento: (f: Record<string, unknown>) => api.post<Procedimento>('/procedimentos', f),
  updateProcedimento: (id: number, f: Record<string, unknown>) => api.put<Procedimento>('/procedimentos/' + id, f),
  ```

---

## Passo 12 — Modal de formulário do procedimento

**Arquivo:** `frontend/src/components/odontox/modals/ProcedimentoFormModal.tsx`
**Tipo:** ARQUIVO NOVO

Os formulários ficam em modais, abertos pelo `ModalContext`, usando o hook `useForm` e os componentes `Modal`/`ModalFooter`/`TextInput`. Copiamos a estrutura de `DentistFormModal.tsx`, simplificando para nossos três campos.

```tsx
import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { useForm } from '@/hooks/useForm';
import Modal from '@/components/odontox/Modal';
import ModalFooter from '@/components/odontox/ModalFooter';
import { TextInput } from '@/components/odontox/Field';
import type { Procedimento } from '@/lib/types';

export default function ProcedimentoFormModal({ entity }: { entity?: Procedimento }) {
  const { saveProcedimento } = useClinic();
  const { close } = useModal();

  const { form, field } = useForm(
    entity
      ? { id: entity.id as number | undefined, nome: entity.nome, duracaoMinutos: entity.duracaoMinutos, valorReferencia: entity.valorReferencia }
      : { id: undefined as number | undefined, nome: '', duracaoMinutos: 30, valorReferencia: 0 }
  );

  const save = () => { saveProcedimento(form); close(); };

  return (
    <Modal onClose={close} maxWidth={520} title={entity ? 'Editar procedimento' : 'Novo procedimento'}>
      <div className="ox-scroll" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
        <TextInput label="Nome" placeholder="Ex.: Profilaxia, Restauração, Canal…" {...field('nome')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextInput label="Duração (minutos)" type="number" {...field('duracaoMinutos')} />
          <TextInput label="Valor de referência (R$)" type="number" {...field('valorReferencia')} />
        </div>
      </div>
      <ModalFooter onCancel={close} onSave={save} saveLabel="Salvar procedimento" />
    </Modal>
  );
}
```

Pontos importantes:

- `useForm(initial)` devolve `{ form, field }`. O `field('nome')` espalha (`{...}`) `value` + `onChange` no input. Você não escreve `onChange` à mão.
- O estado do form usa **camelCase** (`duracaoMinutos`, `valorReferencia`) para casar com o tipo `Procedimento` e com a edição. A **tradução para snake_case** acontece no `ClinicContext.saveProcedimento` (Passo 11.4), não aqui.
- `type="number"` nos inputs numéricos. Lembre que o valor ainda chega como string; o `Number(...)` no contexto converte.
- `save()` chama `saveProcedimento(form)` e fecha o modal. Sem `alert`/`confirm`.

---

## Passo 13 — Registrar o modal no `ModalRoot`

**Arquivo:** `frontend/src/components/odontox/modals/ModalRoot.tsx`
**Tipo:** EDIÇÃO

O `ModalRoot` decide qual modal renderizar conforme o `type`. Duas edições.

Adicione o import no topo (junto dos outros):

```tsx
import ProcedimentoFormModal from './ProcedimentoFormModal';
```

E adicione um `case` no `switch` (junto dos outros forms):

```tsx
    case 'procedimentoForm':
      return <ProcedimentoFormModal entity={modal.entity as never} />;
```

Pontos importantes:

- A string `'procedimentoForm'` é o "tipo" do modal. Você vai usar exatamente essa string ao chamar `open('procedimentoForm', ...)` na página (Passo 14).
- O `as never` é o mesmo padrão usado pelos outros modais para satisfazer o TypeScript.

---

## Passo 14 — Página de Procedimentos

**Arquivo:** `frontend/src/pages/odontox/ProcedimentosPage.tsx`
**Tipo:** ARQUIVO NOVO

Página com `export default`, nome = nome do arquivo, **inline styles**, ícones SVG de `@/components/odontox/icons`, dados de `useClinic()` e modais via `useModal()`. Copiamos a estrutura visual de `DentistasPage.tsx`, adaptando para os campos do procedimento.

```tsx
import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { Plus } from '@/components/odontox/icons';
import Button from '@/components/odontox/Button';

export default function ProcedimentosPage() {
  const { procedimentos } = useClinic();
  const { open } = useModal();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <header style={{ padding: '24px 32px', background: '#fff', borderBottom: '1px solid #E6ECEC', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 3px', color: '#0F2225' }}>Procedimentos</h1>
          <p style={{ fontSize: 14, color: '#5B6B6E', margin: 0 }}>Catálogo de procedimentos da clínica</p>
        </div>
        <Button onClick={() => open('procedimentoForm')}><Plus /> Novo procedimento</Button>
      </header>

      <div className="ox-scroll" style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: 18 }}>
          {procedimentos.map((p) => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #E6ECEC', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1B2B2E' }}>{p.nome}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, borderTop: '1px solid #F0F4F4', paddingTop: 13 }}>
                <div style={{ fontSize: 13.5, color: '#33484B' }}>Duração: {p.duracaoMinutos} min</div>
                <div style={{ fontSize: 13.5, color: '#33484B' }}>Valor de referência: R$ {p.valorReferencia.toFixed(2)}</div>
              </div>
              <div style={{ display: 'flex', gap: 9 }}>
                <Button variant="ghost" hoverDim={false} style={{ flex: 1, padding: 9, fontSize: 13.5 }} onClick={() => open('procedimentoForm', { entity: p })}>Editar</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

Pontos importantes:

- `const { procedimentos } = useClinic();` — a página **lê** a lista do contexto, não faz fetch próprio.
- `open('procedimentoForm')` abre o modal vazio (criar); `open('procedimentoForm', { entity: p })` abre preenchido (editar). O `'procedimentoForm'` casa com o `case` do Passo 13.
- `p.valorReferencia.toFixed(2)` formata o número com 2 casas. (Existe `formatarMoeda` em `@/lib/format`; usamos `toFixed` aqui para manter o tutorial simples.)
- Inline styles puros, sem Bootstrap, seguindo o padrão da `DentistasPage`.

---

## Passo 15 — Registrar a rota `/procedimentos` ⚠️

**Arquivo:** `frontend/src/router.tsx`
**Tipo:** EDIÇÃO

Outro passo fácil de esquecer. A rota tem que ficar **dentro** de `OdontoxGuard` → `AppLayout` (área protegida). Duas edições.

Adicione o import no topo (junto das outras páginas):

```tsx
import ProcedimentosPage from '@/pages/odontox/ProcedimentosPage'
```

E adicione a rota dentro do bloco `children` do `AppLayout`, junto das outras:

```tsx
            children: [
              { path: '/agenda', element: <AgendaPage /> },
              { path: '/pacientes', element: <PacientesPage /> },
              { path: '/paciente/:id', element: <PacienteDetalhePage /> },
              { path: '/dentistas', element: <DentistasPage /> },
              { path: '/procedimentos', element: <ProcedimentosPage /> },
            ],
```

Pontos importantes:

- A rota **precisa** estar dentro de `AppLayout` (que renderiza a Sidebar) e dentro de `OdontoxGuard` (que exige login). Se você colocar fora, a página abre sem menu ou redireciona para login.

---

## Passo 16 — Item no menu (Sidebar)

**Arquivo:** `frontend/src/components/odontox/Sidebar.tsx`
**Tipo:** EDIÇÃO

Adicione uma entrada no array `NAV`. Reaproveitamos o ícone `Tooth` (já importado) para o procedimento — assim você não precisa criar um SVG novo.

Encontre o array `NAV`:

```tsx
const NAV = [
  { to: '/agenda', label: 'Agenda', Icon: Calendar },
  { to: '/pacientes', label: 'Pacientes', Icon: Users, match: ['/pacientes', '/paciente'] },
  { to: '/dentistas', label: 'Dentistas', Icon: Tooth },
]
```

Adicione o item de procedimentos:

```tsx
const NAV = [
  { to: '/agenda', label: 'Agenda', Icon: Calendar },
  { to: '/pacientes', label: 'Pacientes', Icon: Users, match: ['/pacientes', '/paciente'] },
  { to: '/dentistas', label: 'Dentistas', Icon: Tooth },
  { to: '/procedimentos', label: 'Procedimentos', Icon: Tooth },
]
```

Pontos importantes:

- `to: '/procedimentos'` precisa bater **exatamente** com o `path` da rota do Passo 15.
- `Icon: Tooth` reusa um ícone existente. Se quiser um ícone diferente, importe outro de `./icons` (ex.: `Calendar`, `Users`) ou crie um SVG novo no `icons.tsx`. Não use bootstrap-icons.

---

## Passo 17 — Trocar o texto livre por um select no formulário de consulta

**Arquivo:** `frontend/src/components/odontox/modals/ConsultaFormModal.tsx`
**Tipo:** EDIÇÃO

Hoje o campo "Procedimento previsto" é um `TextInput` (texto livre). Vamos trocá-lo por um `Select` alimentado pela lista de procedimentos. Três edições.

### 17.1 — Pegar `procedimentos` do contexto

Encontre a linha que desestrutura o `useClinic`:

```tsx
  const { patients, dentists, saveConsulta } = useClinic();
```

Adicione `procedimentos`:

```tsx
  const { patients, dentists, procedimentos, saveConsulta } = useClinic();
```

### 17.2 — Montar as opções do select

Logo abaixo de `dentistaOptions` (que usa `useMemo`), crie `procedimentoOptions`. O valor de cada opção é o **nome** do procedimento, porque o campo `procedimento` da consulta é uma string (texto) — não mudamos o backend de consulta.

```tsx
  const procedimentoOptions = useMemo(
    () => procedimentos.map((p) => ({ value: p.nome, label: p.nome })),
    [procedimentos]
  );
```

> O `useMemo` já está importado no topo do arquivo (`import { useMemo } from 'react';`), então não precisa adicionar import.

### 17.3 — Substituir o `TextInput` pelo `Select`

Encontre a linha do procedimento dentro do JSX:

```tsx
        <TextInput label="Procedimento previsto" placeholder="Ex.: Profilaxia, Restauração, Avaliação…" {...field('procedimento')} />
```

Troque por:

```tsx
        <Select label="Procedimento previsto" options={procedimentoOptions} {...field('procedimento')} />
```

Pontos importantes:

- O `Select` já está importado no topo (`import { Select, TextInput, TextArea } from '@/components/odontox/Field';`). Se o seu linter reclamar que `TextInput` ficou sem uso, verifique: ele ainda é usado nas linhas de "Data" e "Hora", então **continua importado**. Não remova.
- `value: p.nome` (string) — o backend de consulta guarda `procedimento` como texto. Assim, ao salvar, o nome do procedimento selecionado vira o texto da consulta. **Não** precisamos mexer no `consulta_dto`/`consulta_response`.
- Se a lista de procedimentos estiver vazia, o select aparece vazio. Por isso, cadastre ao menos um procedimento (Passo de teste) antes de abrir o formulário de consulta.
- O `field('procedimento')` continua igual — o `useForm` cuida de `value`/`onChange` tanto para input quanto para select.

---

# Como testar

## 1. Subir tudo

- **Backend** (terminal em `backend/`): `.venv/bin/python main.py`. No log, confirme `Tabela 'procedimento' criada/verificada` e `Router de procedimentos incluído em /api`.
- **Frontend** (terminal em `frontend/`): `npm run dev`. Abra `http://localhost:5180` e faça login.

## 2. Checar o typecheck do front (recomendado)

Antes de testar na tela, rode o typecheck para pegar erros de tipo cedo:

```bash
cd frontend
npx tsc -b --noEmit
```

Deve passar **sem erros**. Se aparecer erro sobre o payload em `clinicaApi` (chaves snake_case x camelCase), é porque as assinaturas de `createProcedimento`/`updateProcedimento` ficaram como `Partial<Procedimento>` em vez de `Record<string, unknown>` — corrija o Passo 10.3 conforme indicado lá (essa assinatura é obrigatória, não opcional).

## 3. Fluxo na tela

1. No menu lateral, clique em **Procedimentos**. A página deve abrir (vazia no começo).
2. Clique em **Novo procedimento**. Preencha nome (ex.: "Profilaxia"), duração (ex.: 30) e valor (ex.: 80). Clique em **Salvar procedimento**.
3. O card do procedimento deve aparecer na lista **na hora** (o contexto atualiza o estado sem recarregar a página).
4. Clique em **Editar** num card, mude o valor e salve. O card atualiza.
5. Vá em **Agenda** e abra **Nova consulta** (ou clique num horário). No campo **Procedimento previsto**, agora deve aparecer um **select** com os procedimentos que você cadastrou. Selecione um e salve a consulta.
6. Recarregue a página (F5). Os procedimentos continuam lá, porque vieram do banco via `/clinica/dados`.

## 4. Conferir o backend direto (opcional)

Com o backend rodando e logado pelo front, abra `http://localhost:8400/docs`. Você deve ver a seção **Procedimentos** com `GET/POST/PUT /procedimentos`. Como há cookie de sessão, dá para testar o `GET` por ali.

## 5. Teste automatizado (opcional)

O projeto usa `pytest` no backend. Se quiser um teste de fumaça simples, crie um arquivo em `backend/tests/integration/` seguindo os testes existentes. Um exemplo mínimo de teste de repositório:

```python
# backend/tests/integration/test_procedimento_repo.py
from model.procedimento_model import Procedimento
from repo import procedimento_repo


def test_inserir_e_obter_procedimento():
    procedimento_repo.criar_tabela()
    novo_id = procedimento_repo.inserir(
        Procedimento(id=0, nome="Profilaxia", duracao_minutos=30, valor_referencia=80.0)
    )
    assert novo_id is not None
    salvo = procedimento_repo.obter_por_id(novo_id)
    assert salvo is not None
    assert salvo.nome == "Profilaxia"
    assert salvo.duracao_minutos == 30
```

Rode com:

```bash
cd backend
.venv/bin/python -m pytest tests/integration/test_procedimento_repo.py
```

> Observação: os testes do projeto geralmente usam um banco de teste isolado. Confira como os outros testes em `tests/integration/` configuram o banco (fixtures) e siga o mesmo padrão para não sujar o banco de dev.

---

# Erros comuns e como resolver

1. **Endpoint dá 404 (`/api/procedimentos` não existe).**
   Você esqueceu de registrar o router no `main.py` (Passo 7.2 e 7.4) ou não reiniciou o backend. Confira no log a linha `Router de procedimentos incluído em /api`. Reinicie o backend.

2. **A tabela não existe / erro de SQL ao listar.**
   Você esqueceu de adicionar `(procedimento_repo, "procedimento")` na lista `TABELAS` (Passo 7.3), ou de importar `procedimento_repo` (Passo 7.1). No log do startup deve aparecer `Tabela 'procedimento' criada/verificada`. Reinicie o backend.

3. **Os dados chegam, mas a tela mostra `undefined` na duração/valor.**
   Contrato camelCase x snake_case desalinhado. O backend devolve `duracaoMinutos`/`valorReferencia` (camelCase, Passo 5) e o tipo TS tem que usar os mesmos nomes (Passo 9). Se você digitou `duracao_minutos` no tipo do front, troque para `duracaoMinutos`.

4. **Erro 422 ao salvar procedimento (Unprocessable Entity).**
   O JSON enviado não bate com o `ProcedimentoDTO`. O DTO espera `nome`, `duracao_minutos`, `valor_referencia` (snake_case). Confira se o `saveProcedimento` do contexto (Passo 11.4) está montando o `payload` em snake_case **antes** de enviar. Abra o DevTools → aba Network → veja o corpo da requisição.

5. **Erro 403 ao salvar (CSRF).**
   Mutações (`POST`/`PUT`) precisam do header `X-CSRF-Token`. Você **não** precisa fazer isso à mão: basta chamar `api.post`/`api.put` (via `clinicaApi`), que já cuidam disso. Se você chamou `fetch` direto em vez de passar pelo `clinicaApi`/`api`, é por isso. Use sempre o cliente central.

6. **O item "Procedimentos" não aparece no menu, ou a rota dá tela em branco.**
   Confira se o `to` da Sidebar (Passo 16) e o `path` da rota (Passo 15) são idênticos (`/procedimentos`), e se a rota está **dentro** de `OdontoxGuard`/`AppLayout`. Se a página abre sem menu, ela está fora do `AppLayout`.

7. **O build do front falha (`tsc -b`).**
   TypeScript é strict. Causas comuns: tipo `Procedimento` faltando em algum import; `procedimentos` faltando em `DadosClinica` ou `ClinicData`; payload com chaves que não existem no tipo. Veja a solução do Passo 11.4 (assinatura `Record<string, unknown>`).

8. **O select de procedimento na consulta aparece vazio.**
   Você ainda não cadastrou nenhum procedimento, ou esqueceu de incluir `procedimentos` no agregador `/clinica/dados` (Passo 8). Cadastre um procedimento e recarregue.

---

# Checklist final

Marque cada caixa ao concluir. Cubra **todas** as camadas.

**Backend**

- [ ] `backend/sql/procedimento_sql.py` criado com `CRIAR_TABELA`, `INSERIR`, `OBTER_TODOS`, `OBTER_POR_ID`, `ATUALIZAR`.
- [ ] `backend/model/procedimento_model.py` criado (`@dataclass Procedimento`).
- [ ] `backend/repo/procedimento_repo.py` criado com `_row_to_procedimento`, `criar_tabela`, `inserir`, `obter_todos`, `obter_por_id`, `atualizar`.
- [ ] `backend/dtos/procedimento_dto.py` criado (`ProcedimentoDTO`, snake_case).
- [ ] `backend/dtos/responses/procedimento_response.py` criado (`ProcedimentoResponse` + `de_procedimento`, camelCase).
- [ ] `backend/routes/procedimento_routes.py` criado (`GET`/`POST`/`PUT`, `@requer_autenticacao()`).
- [ ] `backend/main.py`: importou `procedimento_repo` e adicionou `(procedimento_repo, "procedimento")` em `TABELAS`.
- [ ] `backend/main.py`: importou `procedimento_router` e adicionou em `ROUTERS`.
- [ ] `backend/routes/clinica_routes.py`: importou response + repo e adicionou a chave `"procedimentos"` no agregador.
- [ ] Backend reiniciado; logs confirmam tabela criada e router incluído.

**Frontend**

- [ ] `frontend/src/lib/types.ts`: interface `Procedimento` (camelCase).
- [ ] `frontend/src/lib/odontox/clinicaApi.ts`: `procedimentos` em `DadosClinica` + `createProcedimento`/`updateProcedimento`.
- [ ] `frontend/src/context/ClinicContext.tsx`: `procedimentos` no estado, ação `saveProcedimento` (payload snake_case), exposto no `value`.
- [ ] `frontend/src/components/odontox/modals/ProcedimentoFormModal.tsx` criado.
- [ ] `frontend/src/components/odontox/modals/ModalRoot.tsx`: import + `case 'procedimentoForm'`.
- [ ] `frontend/src/pages/odontox/ProcedimentosPage.tsx` criado.
- [ ] `frontend/src/router.tsx`: import + rota `/procedimentos` dentro de `AppLayout`/`OdontoxGuard`.
- [ ] `frontend/src/components/odontox/Sidebar.tsx`: item `Procedimentos` no `NAV`.
- [ ] `frontend/src/components/odontox/modals/ConsultaFormModal.tsx`: `procedimentos` do contexto, `procedimentoOptions`, `TextInput` trocado por `Select`.
- [ ] `npx tsc -b --noEmit` passa sem erros.

**Teste de aceitação**

- [ ] Consigo abrir a página `/procedimentos` pelo menu.
- [ ] Consigo criar e editar procedimentos (aparecem na lista na hora).
- [ ] Após F5, os procedimentos continuam (vieram do banco).
- [ ] No formulário de consulta, o campo "Procedimento previsto" virou um select com a lista cadastrada.

Pronto! Se todas as caixas estão marcadas, a feature está completa e funcionando ponta a ponta.
