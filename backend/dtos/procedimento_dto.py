from pydantic import BaseModel, Field


class ProcedimentoDTO(BaseModel):
    """DTO para criação/edição de procedimento."""

    nome: str = Field(..., description="Nome do procedimento")
    duracao_minutos: int = Field(default=30, description="Duração padrão em minutos")
    valor_referencia: float = Field(default=0, description="Valor de referência (R$)")