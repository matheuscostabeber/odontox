"""
Rotas para registro de atendimentos clínicos (API JSON).

Um atendimento é o registro clínico de uma consulta. Ao criar um
atendimento, a consulta correspondente é automaticamente marcada como
``atendida``. Tanto a criação quanto a atualização retornam a lista
completa de atendimentos e a consulta afetada, para que o SPA atualize
seu estado em uma única resposta.
"""

# =============================================================================
# Imports
# =============================================================================

# Standard library
from typing import Optional

# Third-party
from fastapi import APIRouter, HTTPException, Request, status

# DTOs (entrada)
from dtos.atendimento_dto import CriarAtendimentoDTO, AtualizarAtendimentoDTO

# Schemas (saída)
from dtos.responses.atendimento_response import AtendimentoResponse
from dtos.responses.consulta_response import ConsultaResponse

# Models
from model.atendimento_model import Atendimento
from model.consulta_model import StatusConsulta
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import atendimento_repo, consulta_repo

# Utilities
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/atendimentos")


# =============================================================================
# Helpers
# =============================================================================

def _payload(consulta) -> dict:
    """Monta o envelope padrão com TODOS os atendimentos e a consulta afetada."""
    atendimentos = atendimento_repo.obter_todos()
    return {
        "atendimentos": [
            AtendimentoResponse.de_atendimento(a) for a in atendimentos
        ],
        "consulta": ConsultaResponse.de_consulta(consulta),
    }


# =============================================================================
# Criação
# =============================================================================

@router.post("", status_code=status.HTTP_201_CREATED)
@requer_autenticacao()
async def criar(
    request: Request,
    dto: CriarAtendimentoDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Registra um atendimento e marca a consulta como atendida."""
    assert usuario_logado is not None

    consulta = consulta_repo.obter_por_id(dto.consultaId)
    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consulta não encontrada.",
        )

    atendimento = Atendimento(
        id=0,
        consulta_id=dto.consultaId,
        procedimento_realizado=dto.procedimento_realizado,
        observacoes_clinicas=dto.observacoes_clinicas,
    )
    atendimento_id = atendimento_repo.inserir(atendimento)
    if not atendimento_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao registrar o atendimento. Tente novamente.",
        )

    consulta_repo.definir_status(dto.consultaId, StatusConsulta.ATENDIDA.value)

    logger.info(
        f"Atendimento #{atendimento_id} (consulta {dto.consultaId}) "
        f"registrado por usuário {usuario_logado.id}"
    )

    consulta_atualizada = consulta_repo.obter_por_id(dto.consultaId)
    return _payload(consulta_atualizada)


# =============================================================================
# Atualização
# =============================================================================

@router.put("/{id}")
@requer_autenticacao()
async def atualizar(
    request: Request,
    id: int,
    dto: AtualizarAtendimentoDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Atualiza um atendimento existente."""
    assert usuario_logado is not None

    existente = atendimento_repo.obter_por_id(id)
    if not existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atendimento não encontrado.",
        )

    atendimento = Atendimento(
        id=id,
        consulta_id=existente.consulta_id,
        procedimento_realizado=dto.procedimento_realizado,
        observacoes_clinicas=dto.observacoes_clinicas,
        registrado_em=existente.registrado_em,
    )
    atendimento_repo.atualizar(atendimento)

    logger.info(f"Atendimento #{id} atualizado por usuário {usuario_logado.id}")

    consulta = consulta_repo.obter_por_id(existente.consulta_id)
    return _payload(consulta)
