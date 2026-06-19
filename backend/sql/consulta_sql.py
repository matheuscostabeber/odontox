CRIAR_TABELA = """
CREATE TABLE IF NOT EXISTS consulta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    dentista_id INTEGER NOT NULL,
    usuario_interno_id INTEGER,
    data TEXT NOT NULL,
    hora TEXT NOT NULL,
    duracao INTEGER NOT NULL DEFAULT 60,
    procedimento TEXT,
    status TEXT NOT NULL DEFAULT 'agendada',
    obs TEXT,
    FOREIGN KEY (paciente_id) REFERENCES paciente(id) ON DELETE CASCADE,
    FOREIGN KEY (dentista_id) REFERENCES dentista(id) ON DELETE CASCADE
)
"""

INSERIR = """
INSERT INTO consulta (
    paciente_id, dentista_id, usuario_interno_id, data, hora,
    duracao, procedimento, status, obs
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

OBTER_TODOS = """
SELECT *
FROM consulta
ORDER BY data, hora
"""

OBTER_POR_ID = """
SELECT *
FROM consulta
WHERE id = ?
"""

ATUALIZAR = """
UPDATE consulta
SET paciente_id = ?,
    dentista_id = ?,
    usuario_interno_id = ?,
    data = ?,
    hora = ?,
    duracao = ?,
    procedimento = ?,
    status = ?,
    obs = ?
WHERE id = ?
"""

DEFINIR_STATUS = """
UPDATE consulta
SET status = ?
WHERE id = ?
"""
