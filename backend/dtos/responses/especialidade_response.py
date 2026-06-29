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