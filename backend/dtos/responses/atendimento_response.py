"""Schemas de resposta do módulo de atendimentos."""
from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel, Field

from model.atendimento_model import Atendimento


class AtendimentoResponse(BaseModel):
    """Representação de um atendimento (registro clínico de uma consulta)."""

    id: int
    consultaId: int = Field(..., description="ID da consulta atendida")
    procedimento_realizado: str
    observacoes_clinicas: str
    registrado_em: Optional[Union[datetime, str]] = None

    @classmethod
    def de_atendimento(cls, atendimento: Atendimento) -> "AtendimentoResponse":
        """Constrói o response a partir da entidade de domínio."""
        return cls(
            id=atendimento.id,
            consultaId=atendimento.consulta_id,
            procedimento_realizado=atendimento.procedimento_realizado,
            observacoes_clinicas=atendimento.observacoes_clinicas,
            registrado_em=atendimento.registrado_em,
        )
