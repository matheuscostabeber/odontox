from pydantic import BaseModel, Field


class DentistaDTO(BaseModel):
    """DTO para criação/edição de dentista."""

    nome: str = Field(..., description="Nome do dentista")
    cro: str = Field(default="", description="Número do CRO")
    especialidade: str = Field(default="", description="Especialidade")
    telefone: str = Field(default="", description="Telefone de contato")
    email: str = Field(default="", description="E-mail de contato")
    ativo: bool = Field(default=True, description="Indica se o dentista está ativo")
