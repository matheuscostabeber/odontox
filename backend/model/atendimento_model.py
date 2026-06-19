from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Union


@dataclass
class Atendimento:
    id: int
    consulta_id: int
    procedimento_realizado: str
    observacoes_clinicas: str
    registrado_em: Optional[Union[datetime, str]] = None
