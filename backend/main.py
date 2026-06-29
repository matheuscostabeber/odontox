import os
import uvicorn
import sqlite3
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.sessions import SessionMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from pathlib import Path

# Configurações
from util.config import APP_NAME, SECRET_KEY, HOST, PORT, RELOAD, VERSION, IS_DEVELOPMENT

# Logger
from util.logger_config import logger

# Exception Handlers (JSON)
from util.exception_handlers import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)

# Repositórios (criação das tabelas)
from repo import (
    usuario_repo,
    configuracao_repo,
    indices_repo,
    dentista_repo,
    paciente_repo,
    consulta_repo,
    atendimento_repo,
    procedimento_repo,
)

# Rotas (API JSON)
from routes.auth_routes import router as auth_router
from routes.usuario_routes import router as usuario_router
from routes.clinica_routes import router as clinica_router
from routes.dentista_routes import router as dentista_router
from routes.paciente_routes import router as paciente_router
from routes.consulta_routes import router as consulta_router
from routes.atendimento_routes import router as atendimento_router
from routes.procedimento_routes import router as procedimento_router

# Seeds
from util.seed_data import inicializar_dados

# CSRF Protection
from util.csrf_protection import MiddlewareProtecaoCSRF

# Security headers
from util.security_headers import MiddlewareSegurancaHeaders

# Prefixo único da API
API_PREFIX = "/api"

# Criar aplicação FastAPI
app = FastAPI(title=APP_NAME, version=VERSION)

# ---------------------------------------------------------------------------
# Middlewares
# Ordem importa: o último add_middleware é o mais externo. SessionMiddleware
# precisa ser externo ao CSRF para que request.session já exista na validação.
# ---------------------------------------------------------------------------
app.add_middleware(MiddlewareProtecaoCSRF)
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY, same_site="lax")
# Headers de segurança: mais externo, aplica a todas as respostas (inclusive erros)
app.add_middleware(MiddlewareSegurancaHeaders)
logger.info("Middlewares (Segurança + Session + CSRF) habilitados")

# ---------------------------------------------------------------------------
# Exception Handlers (todos retornam JSON no contrato padronizado)
# ---------------------------------------------------------------------------
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
logger.info("Exception handlers JSON registrados")

# ---------------------------------------------------------------------------
# Arquivos estáticos (uploads e mídia). Mantido para servir fotos de perfil.
# ---------------------------------------------------------------------------
static_path = Path("static")
if static_path.exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")
    logger.info("Arquivos estáticos montados em /static")

# ---------------------------------------------------------------------------
# Criação de tabelas e seed
# ---------------------------------------------------------------------------
TABELAS = [
    (usuario_repo, "usuario"),
    (configuracao_repo, "configuracao"),
    (dentista_repo, "dentista"),
    (paciente_repo, "paciente"),
    (consulta_repo, "consulta"),
    (atendimento_repo, "atendimento"),
    (procedimento_repo, "procedimento"),
]

logger.info("Criando tabelas do banco de dados...")
try:
    for repo, nome in TABELAS:
        repo.criar_tabela()
        logger.info(f"Tabela '{nome}' criada/verificada")
    indices_repo.criar_indices()
except sqlite3.Error as e:
    logger.error(f"Erro ao criar tabelas: {e}")
    raise

try:
    inicializar_dados()
except sqlite3.Error as e:
    logger.error(f"Erro ao inicializar dados seed: {e}", exc_info=True)

# Migrar configurações do .env para o banco (config híbrida)
try:
    from util.migrar_config import migrar_configs_para_banco

    migrar_configs_para_banco()
except sqlite3.Error as e:
    logger.error(f"Erro ao migrar configurações: {e}", exc_info=True)

# ---------------------------------------------------------------------------
# Routers (todos sob /api)
# ---------------------------------------------------------------------------
ROUTERS = [
    (auth_router, ["Autenticação"], "autenticação"),
    (usuario_router, ["Usuário"], "usuário"),
    (clinica_router, ["Clinica"], "clinica"),
    (dentista_router, ["Dentistas"], "dentistas"),
    (paciente_router, ["Pacientes"], "pacientes"),
    (consulta_router, ["Consultas"], "consultas"),
    (atendimento_router, ["Atendimentos"], "atendimentos"),
    (procedimento_router, ["Procedimentos"], "procedimentos"),
]

for router, tags, nome in ROUTERS:
    app.include_router(router, prefix=API_PREFIX, tags=tags)
    logger.info(f"Router de {nome} incluído em {API_PREFIX}")


@app.get("/health", tags=["Infra"])
async def health_check():
    """Endpoint de health check."""
    return {"status": "healthy"}


# ---------------------------------------------------------------------------
# Catch-all SPA (apenas em produção, quando o build do React existir).
# Registrado por ÚLTIMO para não capturar /api nem /static.
# ---------------------------------------------------------------------------
SPA_DIST_PATH = Path(os.getenv("SPA_DIST_PATH", "../frontend/dist"))
if not IS_DEVELOPMENT and SPA_DIST_PATH.exists():
    index_html = SPA_DIST_PATH / "index.html"
    app.mount(
        "/assets",
        StaticFiles(directory=str(SPA_DIST_PATH / "assets")),
        name="spa-assets",
    )

    # Fallback do SPA via handler de 404 (em vez de uma rota catch-all).
    # Uma rota "/{path:path}" sombrearia as URLs de API sem barra final
    # (ex: GET /api/pacientes), devolvendo o index.html no lugar de
    # acionar o redirect 307 para a versão com barra (/api/pacientes/).
    # Com o fallback de 404, apenas requisições de NAVEGAÇÃO (GET de páginas
    # que não casam nenhuma rota) recebem o index.html; /api segue retornando
    # JSON (inclusive o redirect de barra final das coleções).
    spa_dist_root = SPA_DIST_PATH.resolve()

    async def spa_fallback_handler(request, exc):
        if (
            exc.status_code == 404
            and request.method in ("GET", "HEAD")
            and not request.url.path.startswith(("/api", "/static", "/assets"))
        ):
            # Serve arquivos reais da RAIZ do build (favicon.svg, robots.txt,
            # manifest, etc.) quando existirem — o mount /assets só cobre os
            # bundles hasheados, não os arquivos de public/ que o Vite copia
            # para a raiz do dist. Sem isto, /favicon.svg cairia no index.html.
            rel = request.url.path.lstrip("/")
            if rel:
                candidato = (SPA_DIST_PATH / rel).resolve()
                # Proteção contra path traversal: o arquivo precisa estar DENTRO
                # do diretório do build.
                if candidato.is_file() and (
                    candidato == spa_dist_root or spa_dist_root in candidato.parents
                ):
                    return FileResponse(candidato)
            # Caso contrário, devolve o index.html para o roteamento do SPA.
            return FileResponse(index_html)
        return await http_exception_handler(request, exc)

    app.add_exception_handler(StarletteHTTPException, spa_fallback_handler)

    logger.info(f"SPA servido a partir de {SPA_DIST_PATH} (fallback 404)")


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info(f"Iniciando {APP_NAME} v{VERSION} (API JSON)")
    logger.info("=" * 60)
    logger.info(f"Servidor: http://{HOST}:{PORT}")
    logger.info(f"Documentação: http://{HOST}:{PORT}/docs")
    logger.info("=" * 60)

    try:
        uvicorn.run(
            "main:app",
            host=HOST,
            port=PORT,
            reload=RELOAD,
            log_level="info",
            # Honra X-Forwarded-Proto/-For quando atrás de proxy reverso (TLS),
            # garantindo scheme https em redirects e url_for.
            proxy_headers=True,
            forwarded_allow_ips="*",
        )
    except KeyboardInterrupt:
        logger.info("Servidor encerrado pelo usuário")
    except Exception as e:
        logger.error(f"Erro ao iniciar servidor: {e}")
        raise
