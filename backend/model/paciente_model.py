from dataclasses import dataclass


@dataclass
class Paciente:
    id: int
    nome: str
    cpf: str
    nascimento: str  # Data no formato YYYY-MM-DD armazenada como TEXT
    telefone: str
    email: str
    obs: str
