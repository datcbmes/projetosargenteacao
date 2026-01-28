@echo off
title Encerrando Sistema de Sargenteação

echo ==========================================
echo   SISTEMA DE SARGENTEACAO - ENCERRAMENTO
echo ==========================================
echo.

set PROJECT_PATH=C:\dev\sargentacao-deploy

REM Verifica se Docker esta rodando
docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Docker nao esta em execucao.
    echo Nada a encerrar.
    echo.
    pause
    exit /b 0
)

cd /d %PROJECT_PATH%

echo Parando WEB...
docker compose stop web

echo Parando API...
docker compose stop api

echo Parando BANCO DE DADOS...
docker compose stop db

echo.
echo ==========================================
echo   SISTEMA ENCERRADO COM SUCESSO
echo   (Dados do banco preservados)
echo ==========================================
echo.

docker compose ps
echo.
pause
