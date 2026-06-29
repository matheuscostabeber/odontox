CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS especialidade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
)
"""

INSERIR = """
INSERT INTO especialidade (nome)
VALUES (?)
"""

OBTER_TODOS = """
SELECT id, nome
FROM especialidade
ORDER BY nome
"""

OBTER_POR_ID = """
SELECT id, nome
FROM especialidade
WHERE id = ?
"""

ATUALIZAR = """
UPDATE especialidade
SET nome = ?
WHERE id = ?
"""