@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 학습 게임 모음 - Turso DB 연결 및 실행

echo ============================================================
echo   학습 게임 모음 - Turso DB 연결 실행기
echo ============================================================
echo.

python --version >nul 2>&1
if errorlevel 1 goto NO_PYTHON

if exist ".env.turso" goto CHECK_DB

echo [안내] .env.turso 설정 파일이 아직 없습니다.
echo   1) 지금 Turso DB URL과 Auth Token 입력하기
echo   2) 우선 로컬 SQLite 임시 모드로 바로 실행하기
echo.
set /p CHOICE="선택 (1 또는 2, 기본값 2): "
if "%CHOICE%"=="1" goto INPUT_ENV
goto CHECK_DB

:INPUT_ENV
echo.
echo Turso DB URL 예시: libsql://mydb-myorg.turso.io
set /p TURSO_URL="TURSO_DATABASE_URL 입력: "
set /p TURSO_TOKEN="TURSO_AUTH_TOKEN 입력: "
if "%TURSO_URL%"=="" goto SKIP_WRITE
if "%TURSO_TOKEN%"=="" goto SKIP_WRITE

(
  echo TURSO_DATABASE_URL=%TURSO_URL%
  echo TURSO_AUTH_TOKEN=%TURSO_TOKEN%
  echo PORT=8787
) > ".env.turso"
echo.
echo [완료] .env.turso 파일이 생성되었습니다.
goto CHECK_DB

:SKIP_WRITE
echo [안내] URL 또는 Token이 비어 있어 로컬 SQLite 임시 모드로 계속합니다.

:CHECK_DB
echo.
echo [1/3] 데이터베이스 연결 확인 및 테이블 초기화 중...
python turso_server.py --init
if errorlevel 1 goto DB_ERROR

echo.
echo [2/3] 브라우저를 열고 로컬 서버를 시작합니다 (http://127.0.0.1:8787)
start "" "http://127.0.0.1:8787"

echo [3/3] 서버 실행 중... (종료하려면 이 창을 닫거나 Ctrl+C 를 누르세요)
echo.
python turso_server.py
goto END

:DB_ERROR
echo.
echo [오류] Turso DB 연결에 실패했습니다.
echo .env.turso 파일의 TURSO_DATABASE_URL 과 TURSO_AUTH_TOKEN 을 확인하세요.
echo 설정을 다시 하려면 setup_turso.bat 을 실행하세요.
echo.
pause
goto END

:NO_PYTHON
echo [오류] Python 이 설치되어 있지 않거나 PATH 에 등록되어 있지 않습니다.
echo Python 3 를 설치한 뒤 다시 실행해 주세요.
echo.
pause

:END
