# PDF Master - Setup & Run Guide

## 🚀 How to Run the Application

### Step 1: Install Python Dependencies
Open Command Prompt in the `My-Pdf` folder and run:
```bash
pip install Flask PyPDF2 Pillow reportlab Werkzeug
```

### Step 2: Start the Flask Server
In the same Command Prompt, run:
```bash
python app.py
```

You should see:
```
* Running on http://127.0.0.1:5000
* Debug mode: on
```

### Step 3: Open Your Browser
Go to: **http://localhost:5000**

## ⚠️ Important Notes

- **DO NOT** open `index.html` directly in browser
- **ALWAYS** run `python app.py` first
- **THEN** go to `http://localhost:5000`
- Keep the Command Prompt window open while using the app

## 🔧 Troubleshooting

**Problem**: "Try Again" error when processing files
**Solution**: Make sure Flask server is running (`python app.py`)

**Problem**: "Module not found" error
**Solution**: Install missing packages: `pip install [package-name]`

## ✅ Working Features
- Merge PDF files
- Convert JPG/PNG to PDF  
- Compress PDF files