from pydantic import BaseModel, Field, field_validator

from dtos.validators import validar_string_obrigatoria


class PacienteDTO(BaseModel):
    """DTO para criação e edição de paciente."""

    nome: str = Field(..., description="Nome completo do paciente")
    cpf: str = Field(default="", description="CPF do paciente")
    nascimento: str = Field(
        default="", description="Data de nascimento (YYYY-MM-DD)"
    )
    telefone: str = Field(default="", description="Telefone de contato")
    email: str = Field(default="", description="E-mail de contato")
    obs: str = Field(default="", description="Observações")

    _validar_nome = field_validator("nome")(
        validar_string_obrigatoria(
            nome_campo="Nome", tamanho_minimo=2, tamanho_maximo=200
        )
    )
