from dataclasses import dataclass
from typing import Optional

from util.enum_base import EnumEntidade


class StatusConsulta(EnumEntidade):
    """
    Enum para status de consultas.

    Herda de EnumEntidade que fornece métodos úteis:
        - valores(): Lista todos os valores
        - existe(valor): Verifica se valor existe
        - from_valor(valor): Converte string para enum
        - validar(valor): Valida e retorna ou levanta ValueError
    """

    AGENDADA = "agendada"
    ATENDIDA = "atendida"
    CANCELADA = "cancelada"
    AUSENTE = "ausente"


@dataclass
class Consulta:
    id: int
    paciente_id: int
    dentista_id: int
    usuario_interno_id: Optional[int]
    data: str
    hora: str
    duracao: int
    procedimento: str
    status: StatusConsulta
    obs: str
