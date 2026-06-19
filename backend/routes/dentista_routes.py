"""
Rotas para gerenciamento de dentistas (API JSON).

Permite que usuários logados:
- Listem dentistas
- Cadastrem novos dentistas (cor atribuída automaticamente)
- Editem dentistas (preservando cor e foto existentes)
- Ativem/inativem dentistas
"""

# =============================================================================
# Imports
# =============================================================================

# Standard library
from typing import Optional

# Third-party
from fastapi import APIRouter, HTTPException, Request, status

# DTOs (entrada)
from dtos.dentista_dto import DentistaDTO

# Schemas (saída)
from dtos.responses.dentista_response import DentistaResponse

# Models
from model.dentista_model import Dentista
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import dentista_repo

# Utilities
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/dentistas")

# Paleta de cores atribuída ciclicamente aos dentistas.
PALETA = [
    "#0E7A86",
    "#2563EB",
    "#7C3AED",
    "#C2410C",
    "#0891B2",
    "#15803D",
    "#BE123C",
    "#B45309",
]


# =============================================================================
# Listagem
# =============================================================================

@router.get("", response_model=list[DentistaResponse])
@requer_autenticacao()
async def listar(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista todos os dentistas (ordenados por nome)."""
    assert usuario_logado is not None
    dentistas = dentista_repo.obter_todos()
    return [DentistaResponse.de_dentista(d) for d in dentistas]


# =============================================================================
# Criação
# =============================================================================

@router.post(
    "",
    response_model=DentistaResponse,
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao()
async def criar(
    request: Request,
    dto: DentistaDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cadastra um novo dentista, atribuindo a cor automaticamente."""
    assert usuario_logado is not None

    qtd_atual = len(dentista_repo.obter_todos())
    cor = PALETA[qtd_atual % len(PALETA)]

    dentista = Dentista(
        id=0,
        nome=dto.nome,
        cro=dto.cro,
        especialidade=dto.especialidade,
        telefone=dto.telefone,
        email=dto.email,
        ativo=dto.ativo,
        cor=cor,
        foto_url=None,
    )
    dentista_id = dentista_repo.inserir(dentista)
    if not dentista_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar o dentista. Tente novamente.",
        )

    logger.info(f"Dentista #{dentista_id} '{dto.nome}' criado por usuário {usuario_logado.id}")

    criado = dentista_repo.obter_por_id(dentista_id)
    return DentistaResponse.de_dentista(criado)


# =============================================================================
# Edição
# =============================================================================

@router.put("/{id}", response_model=DentistaResponse)
@requer_autenticacao()
async def atualizar(
    request: Request,
    id: int,
    dto: DentistaDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Atualiza um dentista, preservando a cor e a foto existentes."""
    assert usuario_logado is not None

    existente = dentista_repo.obter_por_id(id)
    if not existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dentista não encontrado.",
        )

    dentista = Dentista(
        id=id,
        nome=dto.nome,
        cro=dto.cro,
        especialidade=dto.especialidade,
        telefone=dto.telefone,
        email=dto.email,
        ativo=dto.ativo,
        cor=existente.cor,
        foto_url=existente.foto_url,
    )
    dentista_repo.atualizar(dentista)

    logger.info(f"Dentista #{id} atualizado por usuário {usuario_logado.id}")

    atualizado = dentista_repo.obter_por_id(id)
    return DentistaResponse.de_dentista(atualizado)


# =============================================================================
# Ativar / Inativar
# =============================================================================

@router.patch("/{id}/toggle", response_model=DentistaResponse)
@requer_autenticacao()
async def toggle(
    request: Request,
    id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Inverte o status ativo/inativo de um dentista."""
    assert usuario_logado is not None

    existente = dentista_repo.obter_por_id(id)
    if not existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dentista não encontrado.",
        )

    dentista_repo.definir_ativo(id, not existente.ativo)

    logger.info(
        f"Dentista #{id} {'ativado' if not existente.ativo else 'inativado'} "
        f"por usuário {usuario_logado.id}"
    )

    atualizado = dentista_repo.obter_por_id(id)
    return DentistaResponse.de_dentista(atualizado)
