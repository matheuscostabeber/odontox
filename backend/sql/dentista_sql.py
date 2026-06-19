CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS dentista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cro TEXT,
    especialidade TEXT,
    telefone TEXT,
    email TEXT,
    ativo INTEGER NOT NULL DEFAULT 1,
    cor TEXT,
    foto_url TEXT
)
"""

INSERIR = """
INSERT INTO dentista (nome, cro, especialidade, telefone, email, ativo, cor, foto_url)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
"""

OBTER_TODOS = """
SELECT id, nome, cro, especialidade, telefone, email, ativo, cor, foto_url
FROM dentista
ORDER BY nome
"""

OBTER_POR_ID = """
SELECT id, nome, cro, especialidade, telefone, email, ativo, cor, foto_url
FROM dentista
WHERE id = ?
"""

ATUALIZAR = """
UPDATE dentista
SET nome = ?, cro = ?, especialidade = ?, telefone = ?, email = ?, ativo = ?, cor = ?, foto_url = ?
WHERE id = ?
"""

DEFINIR_ATIVO = """
UPDATE dentista
SET ativo = ?
WHERE id = ?
"""
