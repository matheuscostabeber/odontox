from pydantic import BaseModel, Field, field_validator

from dtos.validators import validar_tipo
from model.consulta_model import StatusConsulta


class ConsultaDTO(BaseModel):
    """DTO para criação/atualização de consulta.

    Os nomes dos campos seguem exatamente o que o frontend envia (camelCase).
    """

    pacienteId: int = Field(..., description="Identificador do paciente")
    dentistaId: int = Field(..., description="Identificador do dentista")
    date: str = Field(..., description="Data da consulta (YYYY-MM-DD)")
    hora: str = Field(..., description="Hora da consulta (HH:MM)")
    duracao: int = Field(default=60, description="Duração em minutos")
    procedimento: str = Field(default="", description="Procedimento da consulta")
    status: str = Field(default="agendada", description="Status da consulta")
    obs: str = Field(default="", description="Observações")

    _validar_status = field_validator("status")(
        validar_tipo("Status", StatusConsulta)
    )


class AlterarStatusConsultaDTO(BaseModel):
    """DTO para alteração de status da consulta."""

    status: str = Field(..., description="Novo status da consulta")

    _validar_status = field_validator("status")(
        validar_tipo("Status", StatusConsulta)
    )
