#!/usr/bin/env python3
"""Test script to check Excel to PDF dependencies"""

def test_dependencies():
    print("Testing Excel to PDF dependencies...")
    
    try:
        import openpyxl
        print("✅ openpyxl is installed")
    except ImportError:
        print("❌ openpyxl is NOT installed")
        print("Run: pip install openpyxl")
        return False
    
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Table
        print("✅ reportlab is installed")
    except ImportError:
        print("❌ reportlab is NOT installed")
        print("Run: pip install reportlab")
        return False
    
    print("✅ All dependencies are installed!")
    return True

if __name__ == "__main__":
    test_dependencies()