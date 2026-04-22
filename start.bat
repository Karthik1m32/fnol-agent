@echo off
echo Starting FNOL Agent...

:: Start Backend
start "Backend" cmd /k "cd /d C:\Users\karthik\fnol_agent\backend && call ..\venv\Scripts\activate && python main.py"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak

:: Start Frontend
start "Frontend" cmd /k "cd /d C:\Users\karthik\fnol_agent\frontend && npm run dev"

:: Wait 3 seconds for frontend to start
timeout /t 3 /nobreak

:: Open browser tabs
start chrome http://localhost:8000/docs
start chrome http://localhost:5173

echo Done! Backend on port 8000, Frontend on port 5173