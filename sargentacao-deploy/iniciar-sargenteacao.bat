@echo off
title Iniciando Sistema de Sargenteação

echo ==========================================
echo   SISTEMA DE SARGENTEACAO - INICIALIZACAO
echo ==========================================
echo.

set DOCKER_PATH=C:\Program Files\Docker\Docker\Docker Desktop.exe
set PROJECT_PATH=C:\dev\sargentacao-deploy

echo Verificando Docker Desktop...

tasklist | findstr /I "Docker Desktop.exe" >nul

IF %ERRORLEVEL% NEQ 0 (
    echo Docker Desktop nao esta rodando.
    echo Iniciando Docker Desktop...
    start "" "%DOCKER_PATH%"
    echo Aguardando Docker inicializar...
) ELSE (
    echo Docker Desktop ja esta em execucao.
)

:WAIT_DOCKER
timeout /t 5 >nul
docker info >nul 2>&1

IF %ERRORLEVEL% NEQ 0 (
    echo Aguardando Docker Engine...
    goto WAIT_DOCKER
)

echo Docker Engine pronto!
echo.

cd /d %PROJECT_PATH%
docker compose up -d

echo.
echo Sistema iniciado com sucesso!
pause
