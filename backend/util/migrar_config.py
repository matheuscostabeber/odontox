"""
Utilitário para migração de configurações do .env para o banco de dados.

Este módulo é executado automaticamente na inicialização da aplicação
para garantir que todas as configurações editáveis estejam disponíveis
na interface administrativa.
"""
import sqlite3

from util.logger_config import logger
from repo import configuracao_repo


# Mapeamento de configurações a serem migradas do .env para o banco
# Formato: {chave_banco: (valor_env, descrição, categoria)}
CONFIGS_PARA_MIGRAR = {
    # === Aplicação ===
    "app_name": (
        "APP_NAME",
        "Nome da aplicação exibido na interface e emails",
        "Aplicação"
    ),
    "resend_from_email": (
        "RESEND_FROM_EMAIL",
        "Endereço de email do remetente",
        "Aplicação"
    ),
    "resend_from_name": (
        "RESEND_FROM_NAME",
        "Nome do remetente de emails",
        "Aplicação"
    ),

    # === Fotos ===
    "foto_perfil_tamanho_max": (
        "FOTO_PERFIL_TAMANHO_MAX",
        "Tamanho máximo da foto de perfil em pixels",
        "Fotos"
    ),
    "foto_max_upload_bytes": (
        "FOTO_MAX_UPLOAD_BYTES",
        "Tamanho máximo de upload em bytes (5MB = 5242880)",
        "Fotos"
    ),

    # === UI ===
    "toast_auto_hide_delay_ms": (
        "TOAST_AUTO_HIDE_DELAY_MS",
        "Tempo em milissegundos para ocultar notificações toast",
        "Interface"
    ),

    # === Rate Limiting - Autenticação ===
    "rate_limit_login_max": (
        "RATE_LIMIT_LOGIN_MAX",
        "Máximo de tentativas de login",
        "Segurança - Autenticação"
    ),
    "rate_limit_login_minutos": (
        "RATE_LIMIT_LOGIN_MINUTOS",
        "Período em minutos para limite de login",
        "Segurança - Autenticação"
    ),
    "rate_limit_cadastro_max": (
        "RATE_LIMIT_CADASTRO_MAX",
        "Máximo de tentativas de cadastro",
        "Segurança - Autenticação"
    ),
    "rate_limit_cadastro_minutos": (
        "RATE_LIMIT_CADASTRO_MINUTOS",
        "Período em minutos para limite de cadastro",
        "Segurança - Autenticação"
    ),
    "rate_limit_esqueci_senha_max": (
        "RATE_LIMIT_ESQUECI_SENHA_MAX",
        "Máximo de solicitações de recuperação de senha",
        "Segurança - Autenticação"
    ),
    "rate_limit_esqueci_senha_minutos": (
        "RATE_LIMIT_ESQUECI_SENHA_MINUTOS",
        "Período em minutos para recuperação de senha",
        "Segurança - Autenticação"
    ),

    # === Rate Limiting - Operações de Usuário ===
    "rate_limit_upload_foto_max": (
        "RATE_LIMIT_UPLOAD_FOTO_MAX",
        "Máximo de uploads de foto",
        "Operações de Usuário"
    ),
    "rate_limit_upload_foto_minutos": (
        "RATE_LIMIT_UPLOAD_FOTO_MINUTOS",
        "Período em minutos para upload de foto",
        "Operações de Usuário"
    ),
    "rate_limit_alterar_senha_max": (
        "RATE_LIMIT_ALTERAR_SENHA_MAX",
        "Máximo de alterações de senha",
        "Operações de Usuário"
    ),
    "rate_limit_alterar_senha_minutos": (
        "RATE_LIMIT_ALTERAR_SENHA_MINUTOS",
        "Período em minutos para alteração de senha",
        "Operações de Usuário"
    ),
}


def migrar_configs_para_banco():
    """
    Migra configurações do .env para o banco de dados.

    Executa a migração apenas para configurações que ainda não existem
    no banco de dados, preservando valores já customizados pelo admin.

    Esta função deve ser chamada na inicialização da aplicação.
    """
    import os
    from dotenv import load_dotenv

    # Recarrega .env para garantir valores atualizados
    load_dotenv()

    total = 0
    migradas = 0
    ignoradas = 0

    logger.info("Iniciando migração de configurações do .env para o banco...")

    for chave_banco, (var_env, descricao, categoria) in CONFIGS_PARA_MIGRAR.items():
        total += 1

        # Verifica se já existe no banco
        config_existente = configuracao_repo.obter_por_chave(chave_banco)

        if config_existente:
            # Já existe, não sobrescrever
            ignoradas += 1
            logger.debug(
                f"Configuração '{chave_banco}' já existe no banco, mantendo valor atual."
            )
            continue

        # Busca valor do .env
        valor_env = os.getenv(var_env, "")

        if not valor_env:
            logger.warning(
                f"Variável '{var_env}' não encontrada ou vazia, pulando '{chave_banco}'"
            )
            ignoradas += 1
            continue

        # Cria descrição completa com categoria
        descricao_completa = f"[{categoria}] {descricao}"

        # Insere no banco
        try:
            configuracao_repo.inserir_ou_atualizar(
                chave=chave_banco,
                valor=valor_env,
                descricao=descricao_completa
            )
            migradas += 1
            logger.info(
                f"✓ Configuração migrada: '{chave_banco}' = '{valor_env}' ({categoria})"
            )

        except sqlite3.Error as e:
            logger.error(f"✗ Erro ao migrar configuração '{chave_banco}': {e}")

    # Log resumo
    logger.info(
        f"Migração concluída: {total} configs analisadas, "
        f"{migradas} migradas, {ignoradas} ignoradas/existentes"
    )

    # Limpa cache para forçar reload
    from util.config_cache import config
    config.limpar()
    logger.debug("Cache de configurações limpo após migração")
