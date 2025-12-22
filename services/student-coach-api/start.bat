@echo off
cd /d C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api
set PYTHONPATH=%CD%
C:\Users\youbitech\Desktop\Edu_Path\.venv\Scripts\uvicorn.exe src.main:app --host 127.0.0.1 --port 3007 --reload
