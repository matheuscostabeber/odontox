"""Repositório de Dentistas."""

import sqlite3
from typing import Optional

from model.dentista_model import Dentista
from sql.dentista_sql import (
    CRIAR_TABELA,
    INSERIR,
    OBTER_TODOS,
    OBTER_POR_ID,
    ATUALIZAR,
    DEFINIR_ATIVO,
)
from util.db_util import obter_conexao
from util.logger_config import logger


def _row_to_dentista(row: sqlite3.Row) -> Dentista:
    return Dentista(
        id=row["id"],
        nome=row["nome"],
        cro=row["cro"] or "",
        especialidade=row["especialidade"] or "",
        telefone=row["telefone"] or "",
        email=row["email"] or "",
        ativo=bool(row["ativo"]),
        cor=row["cor"] or "",
        foto_url=row["foto_url"],
    )


def criar_tabela() -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


def inserir(dentista: Dentista) -> Optional[int]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(INSERIR, (
            dentista.nome,
            dentista.cro,
            dentista.especialidade,
            dentista.telefone,
            dentista.email,
            1 if dentista.ativo else 0,
            dentista.cor,
            dentista.foto_url,
        ))
        return cursor.lastrowid


def obter_todos() -> list[Dentista]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        rows = cursor.fetchall()
        return [_row_to_dentista(row) for row in rows]


def obter_por_id(id: int) -> Optional[Dentista]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        if row:
            return _row_to_dentista(row)
        return None


def atualizar(dentista: Dentista) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR, (
            dentista.nome,
            dentista.cro,
            dentista.especialidade,
            dentista.telefone,
            dentista.email,
            1 if dentista.ativo else 0,
            dentista.cor,
            dentista.foto_url,
            dentista.id,
        ))
        return cursor.rowcount > 0


def definir_ativo(id: int, ativo: bool) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(DEFINIR_ATIVO, (1 if ativo else 0, id))
        return cursor.rowcount > 0
