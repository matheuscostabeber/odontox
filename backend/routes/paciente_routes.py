"""
Rotas para gerenciamento de pacientes (API JSON).

Permite que usuários logados:
- Listem pacientes (com busca opcional por nome/cpf/telefone)
- Cadastrem novos pacientes
- Visualizem um paciente específico
- Atualizem dados de um paciente
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Request, status

from dtos.paciente_dto import PacienteDTO
from dtos.responses.paciente_response import PacienteResponse
from model.paciente_model import Paciente
from model.usuario_logado_model import UsuarioLogado
from repo import paciente_repo
from util.auth_decorator import requer_autenticacao
from util.logger_config import logger

router = APIRouter(prefix="/pacientes")


@router.get("", response_model=list[PacienteResponse])
@requer_autenticacao()
async def listar(
    request: Request,
    busca: Optional[str] = None,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Lista pacientes, com busca opcional por nome, cpf ou telefone."""
    assert usuario_logado is not None

    pacientes = paciente_repo.obter_todos()

    if busca:
        termo = busca.strip().lower()
        pacientes = [
            p for p in pacientes
            if termo in p.nome.lower()
            or termo in p.cpf.lower()
            or termo in p.telefone.lower()
        ]

    return [PacienteResponse.de_paciente(p) for p in pacientes]


@router.post(
    "",
    response_model=PacienteResponse,
    status_code=status.HTTP_201_CREATED,
)
@requer_autenticacao()
async def criar(
    request: Request,
    dto: PacienteDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Cadastra um novo paciente."""
    assert usuario_logado is not None

    paciente = Paciente(
        id=0,
        nome=dto.nome,
        cpf=dto.cpf,
        nascimento=dto.nascimento,
        telefone=dto.telefone,
        email=dto.email,
        obs=dto.obs,
    )
    paciente_id = paciente_repo.inserir(paciente)
    if not paciente_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao cadastrar o paciente. Tente novamente.",
        )

    logger.info(
        f"Paciente #{paciente_id} '{dto.nome}' cadastrado por usuário {usuario_logado.id}"
    )

    criado = paciente_repo.obter_por_id(paciente_id)
    return PacienteResponse.de_paciente(criado)


@router.get("/{id}", response_model=PacienteResponse)
@requer_autenticacao()
async def obter(
    request: Request,
    id: int,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Detalhe de um paciente."""
    assert usuario_logado is not None

    paciente = paciente_repo.obter_por_id(id)
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado.",
        )
    return PacienteResponse.de_paciente(paciente)


@router.put("/{id}", response_model=PacienteResponse)
@requer_autenticacao()
async def atualizar(
    request: Request,
    id: int,
    dto: PacienteDTO,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Atualiza os dados de um paciente."""
    assert usuario_logado is not None

    paciente = paciente_repo.obter_por_id(id)
    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado.",
        )

    paciente.nome = dto.nome
    paciente.cpf = dto.cpf
    paciente.nascimento = dto.nascimento
    paciente.telefone = dto.telefone
    paciente.email = dto.email
    paciente.obs = dto.obs

    if not paciente_repo.atualizar(paciente):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar o paciente. Tente novamente.",
        )

    logger.info(f"Paciente #{id} atualizado por usuário {usuario_logado.id}")

    atualizado = paciente_repo.obter_por_id(id)
    return PacienteResponse.de_paciente(atualizado)
