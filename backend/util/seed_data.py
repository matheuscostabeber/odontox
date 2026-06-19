import json
import shutil
import sqlite3
from pathlib import Path

from repo import (
    usuario_repo,
    dentista_repo,
    paciente_repo,
    consulta_repo,
    atendimento_repo,
)
from model.usuario_model import Usuario
from model.dentista_model import Dentista
from model.paciente_model import Paciente
from model.consulta_model import Consulta, StatusConsulta
from model.atendimento_model import Atendimento
from util.config import IS_DEVELOPMENT
from util.security import criar_hash_senha
from util.logger_config import logger
from util.perfis import Perfil

# Caminho do arquivo de seed de usuários (raiz_do_projeto/data/admin_seed.json).
# Este arquivo é gerado/atualizado pelo scripts/configurar_projeto.py.
CAMINHO_SEED_USUARIOS = Path(__file__).resolve().parent.parent / "data" / "admin_seed.json"


def _ler_usuarios_do_json() -> list[dict]:
    """
    Lê os usuários definidos em data/admin_seed.json.

    Returns:
        Lista de dicionários de usuários. Retorna lista vazia se o arquivo
        não existir, estiver vazio ou for inválido.
    """
    if not CAMINHO_SEED_USUARIOS.exists():
        return []
    try:
        dados = json.loads(CAMINHO_SEED_USUARIOS.read_text(encoding="utf-8"))
        return dados.get("usuarios", [])
    except (json.JSONDecodeError, OSError) as e:
        logger.error(
            f"Erro ao ler {CAMINHO_SEED_USUARIOS.name}: {e}. "
            "Usando perfis do enum como fallback."
        )
        return []


def _gerar_usuarios_dos_perfis() -> list[dict]:
    """
    Gera um usuário padrão para cada perfil do enum Perfil (fallback).

    Formato gerado por perfil:
    - nome: {Perfil} Padrão
    - email: padrao@{perfil}.com
    - senha: 1234aA@#
    - perfil: {Perfil}
    """
    usuarios = []
    for perfil_enum in Perfil:
        perfil_valor = perfil_enum.value
        usuarios.append({
            "nome": f"{perfil_valor} Padrão",
            "email": f"padrao@{perfil_valor.lower()}.com",
            "senha": "1234aA@#",
            "perfil": perfil_valor,
        })
    return usuarios


def carregar_usuarios_seed():
    """
    Carrega usuários padrão no banco de dados.

    Prioriza os usuários definidos em data/admin_seed.json (gerado pelo
    scripts/configurar_projeto.py). Caso o arquivo não exista ou esteja vazio/inválido,
    gera automaticamente 1 usuário para cada perfil do enum Perfil como fallback.

    Só insere usuários se não houver nenhum usuário cadastrado no banco.
    A senha de cada usuário é sempre armazenada com hash bcrypt.
    """
    # Verificar se já existem usuários cadastrados
    quantidade_usuarios = usuario_repo.obter_quantidade()
    if quantidade_usuarios > 0:
        logger.info(f"Já existem {quantidade_usuarios} usuários cadastrados. Seed não será executado.")
        return

    usuarios_seed = _ler_usuarios_do_json()
    if usuarios_seed:
        logger.info(
            f"Nenhum usuário encontrado. Carregando {len(usuarios_seed)} usuário(s) "
            f"de {CAMINHO_SEED_USUARIOS.name}..."
        )
    else:
        usuarios_seed = _gerar_usuarios_dos_perfis()
        logger.info(
            "Nenhum usuário encontrado e seed JSON ausente/vazio. "
            "Gerando usuários padrão a partir dos perfis..."
        )

    usuarios_criados = 0
    usuarios_com_erro = 0

    for dados in usuarios_seed:
        email = dados.get("email", "")
        try:
            usuario = Usuario(
                id=0,
                nome=dados.get("nome", ""),
                email=email,
                senha=criar_hash_senha(dados.get("senha", "")),
                perfil=dados.get("perfil", ""),
            )

            usuario_id = usuario_repo.inserir(usuario)
            if usuario_id:
                logger.info(f"✓ Usuário {email} criado com sucesso (ID: {usuario_id})")
                usuarios_criados += 1
            else:
                logger.error(f"✗ Falha ao inserir usuário {email} no banco")
                usuarios_com_erro += 1

        except sqlite3.Error as e:
            logger.error(f"✗ Erro ao processar usuário {email}: {e}")
            usuarios_com_erro += 1

    # Resumo
    logger.info(f"Resumo do seed de usuários: {usuarios_criados} criados, {usuarios_com_erro} com erro")


# Diretórios de assets do seed OdontoX. Ficam FORA dos volumes Docker montados
# (/app/data e /app/static/uploads), então nunca são mascarados por um volume
# pré-existente — garantindo que o seed encontre os dados e as fotos no deploy.
_BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
_SEED_ASSETS_DIR = _BASE_DIR / "seed_assets"
_ODONTOX_SEED_JSON = _SEED_ASSETS_DIR / "odontox_seed.json"
_UPLOADS_DENTISTAS_DIR = _BASE_DIR / "static" / "uploads" / "dentistas"


def _garantir_fotos_dentistas():
    """
    Copia as fotos de avatar dos dentistas (assets versionados em
    seed_assets/dentistas/) para static/uploads/dentistas/.

    Necessário no deploy: static/uploads é um volume Docker que pode iniciar
    vazio (ou sem as fotos, num volume pré-existente). Idempotente: só copia o
    que estiver faltando.
    """
    origem = _SEED_ASSETS_DIR / "dentistas"
    if not origem.is_dir():
        logger.warning(f"Diretório de fotos de seed não encontrado: {origem}")
        return
    _UPLOADS_DENTISTAS_DIR.mkdir(parents=True, exist_ok=True)
    copiadas = 0
    for arquivo in sorted(origem.glob("*.jpg")):
        destino = _UPLOADS_DENTISTAS_DIR / arquivo.name
        if not destino.exists():
            shutil.copy2(arquivo, destino)
            copiadas += 1
    if copiadas:
        logger.info(f"{copiadas} foto(s) de dentista copiada(s) para static/uploads/dentistas/.")


def carregar_odontox_demo():
    """
    Carrega os dados da clínica OdontoX (dentistas, pacientes, consultas e
    atendimentos) a partir de seed_assets/odontox_seed.json — um snapshot do
    banco local versionado no repositório — e copia as fotos dos dentistas
    para o diretório de uploads.

    Roda em DEV e em PRODUÇÃO: a clínica precisa do mesmo conjunto de dados e
    fotos após o deploy. IDEMPOTENTE: só executa em banco sem dentistas. As FKs
    são remapeadas (id original do JSON -> id gerado), então não dependem de o
    AUTOINCREMENT coincidir.
    """
    # Guarda de idempotência: se já há dentistas, presume-se que o seed já
    # rodou e nada é refeito (apenas garante que as fotos existam no volume).
    if dentista_repo.obter_todos():
        logger.info(
            "Dados OdontoX já existem (dentistas cadastrados). Seed não será refeito."
        )
        _garantir_fotos_dentistas()
        return

    if not _ODONTOX_SEED_JSON.exists():
        logger.warning(f"Arquivo de seed OdontoX não encontrado: {_ODONTOX_SEED_JSON}")
        return

    logger.info("Carregando dados OdontoX a partir do snapshot versionado...")
    _garantir_fotos_dentistas()
    dados = json.loads(_ODONTOX_SEED_JSON.read_text(encoding="utf-8"))

    # 1) Dentistas — mapeia id original -> id gerado
    mapa_dentista: dict[int, int] = {}
    for d in dados.get("dentistas", []):
        novo_id = dentista_repo.inserir(
            Dentista(
                id=0,
                nome=d["nome"],
                cro=d["cro"],
                especialidade=d["especialidade"],
                telefone=d["telefone"],
                email=d["email"],
                ativo=bool(d["ativo"]),
                cor=d["cor"],
                foto_url=d.get("foto_url"),
            )
        )
        mapa_dentista[d["id"]] = novo_id

    # 2) Pacientes — mapeia id original -> id gerado
    mapa_paciente: dict[int, int] = {}
    for p in dados.get("pacientes", []):
        novo_id = paciente_repo.inserir(
            Paciente(
                id=0,
                nome=p["nome"],
                cpf=p["cpf"],
                nascimento=p["nascimento"],
                telefone=p["telefone"],
                email=p["email"],
                obs=p["obs"],
            )
        )
        mapa_paciente[p["id"]] = novo_id

    # 3) Consultas — remapeia paciente_id/dentista_id
    mapa_consulta: dict[int, int] = {}
    for c in dados.get("consultas", []):
        novo_id = consulta_repo.inserir(
            Consulta(
                id=0,
                paciente_id=mapa_paciente.get(c["paciente_id"], c["paciente_id"]),
                dentista_id=mapa_dentista.get(c["dentista_id"], c["dentista_id"]),
                usuario_interno_id=None,
                data=c["data"],
                hora=c["hora"],
                duracao=c["duracao"],
                procedimento=c["procedimento"],
                status=StatusConsulta(c["status"]),
                obs=c["obs"],
            )
        )
        mapa_consulta[c["id"]] = novo_id

    # 4) Atendimentos — remapeia consulta_id
    for a in dados.get("atendimentos", []):
        atendimento_repo.inserir(
            Atendimento(
                id=0,
                consulta_id=mapa_consulta.get(a["consulta_id"], a["consulta_id"]),
                procedimento_realizado=a["procedimento_realizado"],
                observacoes_clinicas=a["observacoes_clinicas"],
            )
        )

    logger.info(
        f"Dados OdontoX carregados: {len(dados.get('dentistas', []))} dentistas, "
        f"{len(dados.get('pacientes', []))} pacientes, "
        f"{len(dados.get('consultas', []))} consultas, "
        f"{len(dados.get('atendimentos', []))} atendimentos."
    )


def inicializar_dados():
    """Inicializa todos os dados seed"""
    logger.info("=" * 50)
    logger.info("Iniciando carga de dados seed...")
    logger.info("=" * 50)

    try:
        # Admin/usuários-base: SEMPRE carregados (dev e produção). É a única
        # forma de ter um administrador inicial num banco recém-criado.
        carregar_usuarios_seed()

        # Dados OdontoX (dentistas, pacientes, consultas, atendimentos + fotos):
        # carregados em DEV **e** em PRODUÇÃO. A clínica precisa do mesmo
        # conjunto de dados e das fotos de avatar logo após o deploy. A função é
        # idempotente (guarda de tabela vazia), então não duplica em re-deploys
        # nem a cada boot; e garante as fotos no volume de uploads mesmo quando
        # os dados já existem.
        ambiente = "desenvolvimento" if IS_DEVELOPMENT else "produção"
        logger.info(f"Ambiente de {ambiente}: carregando dados OdontoX (idempotente).")
        carregar_odontox_demo()

        logger.info("=" * 50)
        logger.info("Dados seed carregados!")
        logger.info("=" * 50)
    except sqlite3.Error as e:
        logger.error(f"Erro crítico ao inicializar dados seed: {e}", exc_info=True)
