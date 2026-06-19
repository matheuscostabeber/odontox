from dataclasses import dataclass
from typing import Optional


@dataclass
class Dentista:
    id: int
    nome: str
    cro: str
    especialidade: str
    telefone: str
    email: str
    ativo: bool
    cor: str
    foto_url: Optional[str] = None
