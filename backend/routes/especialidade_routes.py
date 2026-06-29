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