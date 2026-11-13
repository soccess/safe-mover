@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Turso DB 설정 및 연결 도우미

:MENU
cls
echo ============================================================
echo   Turso DB 설정 및 연결 도우미
echo ============================================================
echo.
if exist ".env.turso" (
  echo   현재 설정 파일: .env.turso 존재함
) else (
  echo   현재 설정 파일: .env.turso 없음 ^(로컬 SQLite 임시 모드^)
)
echo.
echo   [1] Turso DB URL / Auth Token 입력하여 .env.turso 저장
echo   [2] Turso DB 연결 테스트 및 테이블 초기화
echo   [3] Turso 웹 대시보드 열기 ^(DB 생성 / 토큰 발급^)
echo   [4] WSL 을 통한 Turso CLI 설치 안내 및 실행
echo   [5] 프로젝트 실행 ^(connect_turso.bat^)
echo   [0] 종료
echo.
set /p SEL="원하는 번호를 입력하세요: "

if "%SEL%"=="1" goto SAVE_ENV
if "%SEL%"=="2" goto TEST_DB
if "%SEL%"=="3" goto OPEN_DASHBOARD
if "%SEL%"=="4" goto INSTALL_CLI
if "%SEL%"=="5" goto RUN_APP
if "%SEL%"=="0" goto EOF
goto MENU

:SAVE_ENV
echo.
echo ------------------------------------------------------------
echo Turso DB 연결 정보를 입력하세요.
echo (Turso 대시보드에서 Database URL 과 Token 을 복사해 붙여넣으세요)
echo URL 예시: libsql://safe-mover-myorg.turso.io
echo ------------------------------------------------------------
set /p INPUT_URL="TURSO_DATABASE_URL: "
set /p INPUT_TOKEN="TURSO_AUTH_TOKEN: "
set /p INPUT_PORT="로컬 서버 포트 (기본 8787): "
if "%INPUT_PORT%"=="" set INPUT_PORT=8787

if "%INPUT_URL%"=="" goto INVALID_INPUT
if "%INPUT_TOKEN%"=="" goto INVALID_INPUT

(
  echo TURSO_DATABASE_URL=%INPUT_URL%
  echo TURSO_AUTH_TOKEN=%INPUT_TOKEN%
  echo PORT=%INPUT_PORT%
) > ".env.turso"

echo.
echo [완료] .env.turso 저장이 완료되었습니다.
echo 연결 테스트를 진행합니다...
python turso_server.py --init
echo.
pause
goto MENU

:INVALID_INPUT
echo.
echo [경고] URL 과 Token 을 모두 입력해야 합니다.
pause
goto MENU

:TEST_DB
echo.
python --version >nul 2>&1
if errorlevel 1 goto NO_PYTHON
python turso_server.py --init
echo.
pause
goto MENU

:OPEN_DASHBOARD
echo.
echo Turso 웹 대시보드를 엽니다...
start "" "https://app.turso.tech"
pause
goto MENU

:INSTALL_CLI
echo.
echo ------------------------------------------------------------
echo Windows 에서는 WSL(Ubuntu 등) 을 통해 Turso CLI 를 사용할 수 있습니다.
echo 아래 명령을 WSL 에서 실행하면 Turso CLI 설치 및 DB 생성이 가능합니다:
echo.
echo   1) 설치 : curl -sSfL https://get.tur.so/install.sh ^| bash
echo   2) 로그인: turso auth login
echo   3) DB생성: turso db create safe-mover-db
echo   4) URL  : turso db show safe-mover-db --url
echo   5) 토큰 : turso db tokens create safe-mover-db
echo ------------------------------------------------------------
echo.
set /p RUN_WSL="지금 WSL 에서 Turso CLI 설치를 시도할까요? (y/n): "
if /i "%RUN_WSL%"=="y" (
  wsl bash -c "curl -sSfL https://get.tur.so/install.sh | bash"
)
echo.
pause
goto MENU

:RUN_APP
call "%~dp0connect_turso.bat"
goto EOF

:NO_PYTHON
echo [오류] Python 이 설치되어 있지 않습니다.
pause
goto MENU

:EOF
