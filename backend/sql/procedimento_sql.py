CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS procedimento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    duracao_minutos INTEGER NOT NULL DEFAULT 30,
    valor_referencia REAL NOT NULL DEFAULT 0
)
"""

INSERIR = """
INSERT INTO procedimento (nome, duracao_minutos, valor_referencia)
VALUES (?, ?, ?)
"""

OBTER_TODOS = """
SELECT id, nome, duracao_minutos, valor_referencia
FROM procedimento
ORDER BY nome
"""

OBTER_POR_ID = """
SELECT id, nome, duracao_minutos, valor_referencia
FROM procedimento
WHERE id = ?
"""

ATUALIZAR = """
UPDATE procedimento
SET nome = ?, duracao_minutos = ?, valor_referencia = ?
WHERE id = ?
"""