"""Schemas de resposta do módulo de dentistas."""
from typing import Optional

from pydantic import BaseModel, Field

from model.dentista_model import Dentista


class DentistaResponse(BaseModel):
    """Representação de um dentista."""

    id: int
    nome: str
    cro: str
    especialidade: str
    telefone: str
    email: str
    ativo: bool
    cor: str
    fotoUrl: Optional[str] = Field(default=None, description="URL da foto do dentista")

    @classmethod
    def de_dentista(cls, dentista: Dentista) -> "DentistaResponse":
        """Constrói o response a partir da entidade de domínio."""
        return cls(
            id=dentista.id,
            nome=dentista.nome,
            cro=dentista.cro,
            especialidade=dentista.especialidade,
            telefone=dentista.telefone,
            email=dentista.email,
            ativo=dentista.ativo,
            cor=dentista.cor,
            fotoUrl=dentista.foto_url,
        )
