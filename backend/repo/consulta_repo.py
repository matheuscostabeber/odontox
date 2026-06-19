"""Repositório de Consultas."""

import sqlite3
from typing import Optional, TypeVar, Type
from enum import Enum

from model.consulta_model import Consulta, StatusConsulta
from sql.consulta_sql import (
    CRIAR_TABELA,
    INSERIR,
    OBTER_TODOS,
    OBTER_POR_ID,
    ATUALIZAR,
    DEFINIR_STATUS,
)
from util.db_util import obter_conexao
from util.logger_config import logger

T = TypeVar("T", bound=Enum)


def _converter_enum_seguro(valor: str, tipo_enum: Type[T], padrao: T) -> T:
    """
    Converte string para Enum de forma segura.

    Args:
        valor: Valor string do banco de dados
        tipo_enum: Tipo do Enum (ex: StatusConsulta)
        padrao: Valor padrão caso conversão falhe

    Returns:
        Valor do Enum ou padrão em caso de erro
    """
    try:
        return tipo_enum(valor)
    except ValueError:
        logger.error(
            f"Valor inválido para {tipo_enum.__name__}: '{valor}'. "
            f"Usando padrão: {padrao.value}"
        )
        return padrao


def _row_to_consulta(row: sqlite3.Row) -> Consulta:
    return Consulta(
        id=row["id"],
        paciente_id=row["paciente_id"],
        dentista_id=row["dentista_id"],
        usuario_interno_id=row["usuario_interno_id"],
        data=row["data"],
        hora=row["hora"],
        duracao=row["duracao"],
        procedimento=row["procedimento"],
        status=_converter_enum_seguro(
            row["status"], StatusConsulta, StatusConsulta.AGENDADA
        ),
        obs=row["obs"],
    )


def criar_tabela() -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(CRIAR_TABELA)
        return True


def inserir(consulta: Consulta) -> Optional[int]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(INSERIR, (
            consulta.paciente_id,
            consulta.dentista_id,
            consulta.usuario_interno_id,
            consulta.data,
            consulta.hora,
            consulta.duracao,
            consulta.procedimento,
            consulta.status.value,
            consulta.obs,
        ))
        return cursor.lastrowid


def obter_todos() -> list[Consulta]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_TODOS)
        rows = cursor.fetchall()
        return [_row_to_consulta(row) for row in rows]


def obter_por_id(id: int) -> Optional[Consulta]:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(OBTER_POR_ID, (id,))
        row = cursor.fetchone()
        if row:
            return _row_to_consulta(row)
        return None


def atualizar(consulta: Consulta) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(ATUALIZAR, (
            consulta.paciente_id,
            consulta.dentista_id,
            consulta.usuario_interno_id,
            consulta.data,
            consulta.hora,
            consulta.duracao,
            consulta.procedimento,
            consulta.status.value,
            consulta.obs,
            consulta.id,
        ))
        return cursor.rowcount > 0


def definir_status(id: int, status: str) -> bool:
    with obter_conexao() as conn:
        cursor = conn.cursor()
        cursor.execute(DEFINIR_STATUS, (status, id))
        return cursor.rowcount > 0
