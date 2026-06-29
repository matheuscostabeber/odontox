"""
Rota de carga inicial da clínica (API JSON).

Expõe um único endpoint agregador que devolve, de uma só vez, todos os
dentistas, pacientes, consultas e atendimentos. Serve como bootstrap do
SPA, evitando múltiplas requisições no carregamento inicial.
"""

# =============================================================================
# Imports
# =============================================================================

# Standard library
from typing import Optional

# Third-party
from fastapi import APIRouter, Request

# Schemas (saída)
from dtos.responses.dentista_response import DentistaResponse
from dtos.responses.paciente_response import PacienteResponse
from dtos.responses.consulta_response import ConsultaResponse
from dtos.responses.atendimento_response import AtendimentoResponse
from dtos.responses.procedimento_response import ProcedimentoResponse

# Models
from model.usuario_logado_model import UsuarioLogado

# Repositories
from repo import (
    dentista_repo,
    paciente_repo,
    consulta_repo,
    atendimento_repo,
    procedimento_repo,
)

# Utilities
from util.auth_decorator import requer_autenticacao

# =============================================================================
# Configuração do Router
# =============================================================================

router = APIRouter(prefix="/clinica")


# =============================================================================
# Carga inicial
# =============================================================================

@router.get("/dados")
@requer_autenticacao()
async def dados(
    request: Request,
    usuario_logado: Optional[UsuarioLogado] = None,
):
    """Retorna a carga inicial única do SPA (dentistas, pacientes, consultas, atendimentos)."""
    assert usuario_logado is not None

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
