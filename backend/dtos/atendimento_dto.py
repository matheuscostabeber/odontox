from pydantic import BaseModel, Field


class CriarAtendimentoDTO(BaseModel):
    """DTO para criação de atendimento (registro clínico de uma consulta)."""

    consultaId: int = Field(..., description="ID da consulta atendida")
    procedimento_realizado: str = Field(
        default="", description="Procedimento clínico realizado"
    )
    observacoes_clinicas: str = Field(
        default="", description="Observações clínicas do atendimento"
    )


class AtualizarAtendimentoDTO(BaseModel):
    """DTO para atualização de atendimento."""

    procedimento_realizado: str = Field(
        default="", description="Procedimento clínico realizado"
    )
    observacoes_clinicas: str = Field(
        default="", description="Observações clínicas do atendimento"
    )
