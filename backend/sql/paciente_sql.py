CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS paciente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT,
    nascimento TEXT,
    telefone TEXT,
    email TEXT,
    obs TEXT
)
"""

INSERIR = """
INSERT INTO paciente (nome, cpf, nascimento, telefone, email, obs)
VALUES (?, ?, ?, ?, ?, ?)
"""

OBTER_TODOS = """
SELECT id, nome, cpf, nascimento, telefone, email, obs
FROM paciente
ORDER BY nome
"""

OBTER_POR_ID = """
SELECT id, nome, cpf, nascimento, telefone, email, obs
FROM paciente
WHERE id = ?
"""

ATUALIZAR = """
UPDATE paciente
SET nome = ?, cpf = ?, nascimento = ?, telefone = ?, email = ?, obs = ?
WHERE id = ?
"""
