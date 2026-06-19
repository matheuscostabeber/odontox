"""Repositório de Atendimentos (registro clínico de uma consulta)."""

import sqlite3
from typing import Optional

from model.atendimento_model import Atendimento
from sql.atendimento_sql import (
    CRIAR_TABELA,
    INSERIR,
    OBTER_TODOS,
    OBTER_POR_ID,
    OBTER_POR_CONSULTA,
    ATUALIZAR,
)
from util.db_util import obter_conexao
from util.datetime_util import agora
from util.logger_config import logger


def _row_to_atendimento(row: sqlite3.Row) -> Atendimento:
    return Atendimento(
        id=row["id"],
        consulta_id=row["consulta_id"],
        procedimento_realizado=row["procedimento_realizado"],
        observacoes_clinicas=row["observacoes_clinicas"],
        registrado_em=row["registrado_em"],
    )


def criar_tabela() -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


def inserir(atendimento: Atendimento) -> Optional[int]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(INSERIR, (
            atendimento.consulta_id,
            atendimento.procedimento_realizado,
            atendimento.observacoes_clinicas,
            agora(),
        ))
        return cursor.lastrowid


def obter_todos() -> list[Atendimento]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        rows = cursor.fetchall()
        return [_row_to_atendimento(row) for row in rows]


def obter_por_id(id: int) -> Optional[Atendimento]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        if row:
            return _row_to_atendimento(row)
        return None


def obter_por_consulta(consulta_id: int) -> list[Atendimento]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_CONSULTA, (consulta_id,))
        rows = cursor.fetchall()
        return [_row_to_atendimento(row) for row in rows]


def atualizar(atendimento: Atendimento) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR, (
            atendimento.procedimento_realizado,
            atendimento.observacoes_clinicas,
            atendimento.id,
        ))
        return cursor.rowcount > 0
