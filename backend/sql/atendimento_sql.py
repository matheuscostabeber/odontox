CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS atendimento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consulta_id INTEGER NOT NULL,
    procedimento_realizado TEXT,
    observacoes_clinicas TEXT,
    registrado_em TIMESTAMP,
    FOREIGN KEY (consulta_id) REFERENCES consulta(id) ON DELETE CASCADE
)
"""

INSERIR = """
INSERT INTO atendimento (consulta_id, procedimento_realizado, observacoes_clinicas, registrado_em)
VALUES (?, ?, ?, ?)
"""

OBTER_TODOS = """
SELECT a.*
FROM atendimento a
ORDER BY a.registrado_em DESC
"""

OBTER_POR_ID = """
SELECT a.*
FROM atendimento a
WHERE a.id = ?
"""

OBTER_POR_CONSULTA = """
SELECT a.*
FROM atendimento a
WHERE a.consulta_id = ?
ORDER BY a.registrado_em DESC
"""

ATUALIZAR = """
UPDATE atendimento
SET procedimento_realizado = ?, observacoes_clinicas = ?
WHERE id = ?
"""
