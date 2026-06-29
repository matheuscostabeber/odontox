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