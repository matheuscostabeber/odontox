"""Repositório de Procedimentos."""

import sqlite3
from typing import Optional

from model.procedimento_model import Procedimento
from sql.procedimento_sql import (
    CRIAR_TABELA,
    INSERIR,
    OBTER_TODOS,
    OBTER_POR_ID,
    ATUALIZAR,
)
from util.db_util import obter_conexao
from util.logger_config import logger


def _row_to_procedimento(row: sqlite3.Row) -> Procedimento:
    return Procedimento(
        id=row["id"],
        nome=row["nome"],
        duracao_minutos=row["duracao_minutos"],
        valor_referencia=row["valor_referencia"],
    )


def criar_tabela() -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


def inserir(procedimento: Procedimento) -> Optional[int]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(INSERIR, (
            procedimento.nome,
            procedimento.duracao_minutos,
            procedimento.valor_referencia,
        ))
        return cursor.lastrowid


def obter_todos() -> list[Procedimento]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        rows = cursor.fetchall()
        return [_row_to_procedimento(row) for row in rows]


def obter_por_id(id: int) -> Optional[Procedimento]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        if row:
            return _row_to_procedimento(row)
        return None


def atualizar(procedimento: Procedimento) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR, (
            procedimento.nome,
            procedimento.duracao_minutos,
            procedimento.valor_referencia,
            procedimento.id,
        ))
        return cursor.rowcount > 0