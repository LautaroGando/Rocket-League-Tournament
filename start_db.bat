@echo off
echo Iniciando base de datos...
docker compose up -d
if %errorlevel% neq 0 (
    echo Error al iniciar con 'docker compose'. Intentando con 'docker-compose'...
    docker-compose up -d
)
if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo iniciar la base de datos.
    echo Asegurate de tener Docker Desktop instalado y corriendo.
    pause
    exit /b 1
)
echo.
echo Base de datos iniciada correctamente!
pause
