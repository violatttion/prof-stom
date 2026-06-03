@echo off
echo ========================================
echo     ПРОФ СТОМ - Запуск информационной системы
echo ========================================
echo.

echo [1/3] Запуск Backend...
start cmd /k "cd backend && npm run dev"

timeout /t 4 >nul

echo [2/3] Запуск Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo [3/3] Готово!
echo.
echo Откройте браузер и перейдите по адресу:
echo http://localhost:5173
echo.
echo Тестовые аккаунты:
echo   Администратор: admin@profstom.ru / Admin123
echo   Врач:          doctor1@profstom.ru / Doctor123
echo   Пациент:       patient1@profstom.ru / Patient123
echo.
pause