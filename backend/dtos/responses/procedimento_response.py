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