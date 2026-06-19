"""Repositório de Pacientes."""

import sqlite3
from typing import Optional

from model.paciente_model import Paciente
from sql.paciente_sql import (
    CRIAR_TABELA,
    INSERIR,
    OBTER_TODOS,
    OBTER_POR_ID,
    ATUALIZAR,
)
from util.db_util import obter_conexao
from util.logger_config import logger


def _row_to_paciente(row: sqlite3.Row) -> Paciente:
    return Paciente(
        id=row["id"],
        nome=row["nome"],
        cpf=row["cpf"] or "",
        nascimento=row["nascimento"] or "",
        telefone=row["telefone"] or "",
        email=row["email"] or "",
        obs=row["obs"] or "",
    )


def criar_tabela() -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


def inserir(paciente: Paciente) -> Optional[int]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(INSERIR, (
            paciente.nome,
            paciente.cpf,
            paciente.nascimento,
            paciente.telefone,
            paciente.email,
            paciente.obs,
        ))
        return cursor.lastrowid


def obter_todos() -> list[Paciente]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        rows = cursor.fetchall()
        return [_row_to_paciente(row) for row in rows]


def obter_por_id(id: int) -> Optional[Paciente]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        if row:
            return _row_to_paciente(row)
        return None


def atualizar(paciente: Paciente) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR, (
            paciente.nome,
            paciente.cpf,
            paciente.nascimento,
            paciente.telefone,
            paciente.email,
            paciente.obs,
            paciente.id,
        ))
        return cursor.rowcount > 0
