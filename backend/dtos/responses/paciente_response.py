"""Schemas de resposta do módulo de pacientes."""

from pydantic import BaseModel, Field

from model.paciente_model import Paciente


class PacienteResponse(BaseModel):
    """Representação de um paciente."""

    id: int
    nome: str
    cpf: str = ""
    nascimento: str = ""
    telefone: str = ""
    email: str = ""
    obs: str = ""

    @classmethod
    def de_paciente(cls, paciente: Paciente) -> "PacienteResponse":
        """Constrói o response a partir da entidade de domínio."""
        return cls(
            id=paciente.id,
            nome=paciente.nome,
            cpf=paciente.cpf,
            nascimento=paciente.nascimento,
            telefone=paciente.telefone,
            email=paciente.email,
            obs=paciente.obs,
        )
