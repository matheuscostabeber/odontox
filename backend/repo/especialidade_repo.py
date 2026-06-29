"""Repositório de Especialidades."""

import sqlite3
from typing import Optional

from model.especialidade_model import Especialidade
from sql.especialidade_sql import (
    CRIAR_TABELA,
    INSERIR,
    OBTER_TODOS,
    OBTER_POR_ID,
    ATUALIZAR,
)
from util.db_util import obter_conexao
from util.logger_config import logger


def _row_to_especialidade(row: sqlite3.Row) -> Especialidade:
    return Especialidade(
        id=row["id"],
        nome=row["nome"],
    )


def criar_tabela() -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


def inserir(especialidade: Especialidade) -> Optional[int]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(INSERIR, (
            especialidade.nome,
        ))
        return cursor.lastrowid


def obter_todos() -> list[Especialidade]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        rows = cursor.fetchall()
        return [_row_to_especialidade(row) for row in rows]


def obter_por_id(id: int) -> Optional[Especialidade]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        if row:
            return _row_to_especialidade(row)
        return None


def atualizar(especialidade: Especialidade) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR, (
            especialidade.nome,
            especialidade.id,
        ))
        return cursor.rowcount > 0