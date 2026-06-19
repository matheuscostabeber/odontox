"""Schemas de resposta do módulo de consultas."""

from pydantic import BaseModel, Field

from model.consulta_model import Consulta


class ConsultaResponse(BaseModel):
    """Representação de uma consulta.

    Os nomes dos campos seguem exatamente o contrato JSON esperado pelo
    frontend (camelCase em ``pacienteId``/``dentistaId`` e ``date`` para a data).
    """

    id: int
    date: str = Field(..., description="Data da consulta (YYYY-MM-DD)")
    hora: str = Field(..., description="Hora da consulta (HH:MM)")
    duracao: int
    pacienteId: int
    dentistaId: int
    procedimento: str
    status: str = Field(..., description="Status atual da consulta")
    obs: str

    @classmethod
    def de_consulta(cls, consulta: Consulta) -> "ConsultaResponse":
        """Constrói o response a partir da entidade de domínio."""
        return cls(
            id=consulta.id,
            date=consulta.data,
            hora=consulta.hora,
            duracao=consulta.duracao,
            pacienteId=consulta.paciente_id,
            dentistaId=consulta.dentista_id,
            procedimento=consulta.procedimento,
            status=consulta.status.value,
            obs=consulta.obs,
        )
