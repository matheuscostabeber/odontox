"""
Rotas para gerenciamento de consultas (API JSON).

Permite que usuários logados:
- Criem novas consultas
- Atualizem consultas existentes
- Alterem o status de uma consulta
"""

# =============================================================================
# Imports
# =============================================================================

# Standard library
from typing import Optional

# Third-party
from fastapi import APIRouter, HTTPException, Request, status

# DTOs (entrada)
from dtos.consulta_dto import ConsultaDTO, AlterarStatusConsultaDTO

# Schemas (saída)
from dtos.responses.consulta_response import ConsultaResponse

# Models
from model.consulta_model import Consulta, StatusConsulta
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import consulta_repo

# Utilities
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/consultas")


# =============================================================================
# Helpers
# =============================================================================

def _obter_consulta(id: int) -> Consulta:
    """Carrega a consulta ou levanta 404."""
    consulta = consulta_repo.obter_por_id(id)
    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consulta não encontrada.",
        )
    return consulta


# =============================================================================
# Criação
# =============================================================================

@router.post(
    "",
    response_model=ConsultaResponse,
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao()
async def criar(
    request: Request,
    dto: ConsultaDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cria uma nova consulta."""
    assert usuario_logado is not None

    consulta = Consulta(
        id=0,
        paciente_id=dto.pacienteId,
        dentista_id=dto.dentistaId,
        usuario_interno_id=usuario_logado.id,
        data=dto.date,
        hora=dto.hora,
        duracao=dto.duracao,
        procedimento=dto.procedimento or "Consulta",
        status=StatusConsulta(dto.status),
        obs=dto.obs,
    )
    consulta_id = consulta_repo.inserir(consulta)
    if not consulta_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao criar a consulta. Tente novamente.",
        )

    logger.info(
        f"Consulta #{consulta_id} criada por usuário {usuario_logado.id}"
    )

    criada = consulta_repo.obter_por_id(consulta_id)
    return ConsultaResponse.de_consulta(criada)


# =============================================================================
# Atualização
# =============================================================================

@router.put("/{id}", response_model=ConsultaResponse)
@requer_autenticacao()
async def atualizar(
    request: Request,
    id: int,
    dto: ConsultaDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Atualiza uma consulta existente."""
    assert usuario_logado is not None
    existente = _obter_consulta(id)

    consulta = Consulta(
        id=id,
        paciente_id=dto.pacienteId,
        dentista_id=dto.dentistaId,
        usuario_interno_id=existente.usuario_interno_id,
        data=dto.date,
        hora=dto.hora,
        duracao=dto.duracao,
        procedimento=dto.procedimento or "Consulta",
        status=StatusConsulta(dto.status),
        obs=dto.obs,
    )
    consulta_repo.atualizar(consulta)

    logger.info(f"Consulta #{id} atualizada por usuário {usuario_logado.id}")

    atualizada = consulta_repo.obter_por_id(id)
    return ConsultaResponse.de_consulta(atualizada)


# =============================================================================
# Alteração de status
# =============================================================================

@router.patch("/{id}/status", response_model=ConsultaResponse)
@requer_autenticacao()
async def alterar_status(
    request: Request,
    id: int,
    dto: AlterarStatusConsultaDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Altera o status de uma consulta."""
    assert usuario_logado is not None
    _obter_consulta(id)

    consulta_repo.definir_status(id, dto.status)

    logger.info(
        f"Status da consulta #{id} alterado para '{dto.status}' "
        f"por usuário {usuario_logado.id}"
    )

    atualizada = consulta_repo.obter_por_id(id)
    return ConsultaResponse.de_consulta(atualizada)
