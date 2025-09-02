@echo off
echo Starting PDF Master Application...
echo.
echo Installing dependencies (if needed)...
pip install Flask PyPDF2 Pillow reportlab Werkzeug
echo.
echo Starting Flask server...
echo.
echo ========================================
echo   PDF Master is starting...
echo   Open your browser to: http://localhost:5000
echo   Press Ctrl+C to stop the server
echo ========================================
echo.
python app.py