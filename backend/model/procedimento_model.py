from dataclasses import dataclass


@dataclass
class Procedimento:
    id: int
    nome: str
    duracao_minutos: int
    valor_referencia: float