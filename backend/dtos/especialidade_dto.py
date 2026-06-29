from pydantic import BaseModel, Field, field_validator

from dtos.validators import validar_string_obrigatoria


class EspecialidadeDTO(BaseModel):
    """DTO para criação/edição de especialidade."""

    nome: str = Field(..., description="Nome da especialidade")

    _validar_nome = field_validator("nome")(
        validar_string_obrigatoria(nome_campo="Nome", tamanho_minimo=2, tamanho_maximo=100)
    )