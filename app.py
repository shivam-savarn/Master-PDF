from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
import PyPDF2
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
import tempfile
import zipfile
from datetime import datetime
import io
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    print("PyMuPDF not available, using basic compression")

app = Flask(__name__, static_folder='.', static_url_path='')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'outputs'

# Create directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {
    'pdf': ['pdf'],
    'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp']
}

def allowed_file(filename, file_type):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS[file_type]

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return app.send_static_file(filename)

@app.route('/merge-pdf', methods=['POST'])
def merge_pdf():
    try:
        files = request.files.getlist('files')
        if len(files) < 2:
            return jsonify({'error': 'At least 2 PDF files required'}), 400
        
        # Validate files
        for file in files:
            if not allowed_file(file.filename, 'pdf'):
                return jsonify({'error': f'Invalid file: {file.filename}'}), 400
        
        # Create PDF merger
        merger = PyPDF2.PdfMerger()
        
        # Add files to merger
        for file in files:
            merger.append(file)
        
        # Generate output filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_filename = f'merged_pdf_{timestamp}.pdf'
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        # Write merged PDF
        with open(output_path, 'wb') as output_file:
            merger.write(output_file)
        
        merger.close()
        
        return send_file(output_path, as_attachment=True, download_name=output_filename)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/jpg-to-pdf', methods=['POST'])
def jpg_to_pdf():
    try:
        print("Starting JPG to PDF conversion...")
        files = request.files.getlist('files')
        page_size = request.form.get('pageSize', 'A4')
        orientation = request.form.get('orientation', 'portrait')
        
        print(f"Received {len(files)} files, page_size: {page_size}, orientation: {orientation}")
        
        if not files or len(files) == 0:
            print("No files provided")
            return jsonify({'error': 'No files provided'}), 400
        
        # Validate files
        for file in files:
            print(f"Processing file: {file.filename}")
            if not file.filename or not allowed_file(file.filename, 'image'):
                print(f"Invalid file: {file.filename}")
                return jsonify({'error': f'Invalid file: {file.filename}'}), 400
        
        # Set page dimensions
        if page_size == 'A4':
            page_dims = A4
        elif page_size == 'Letter':
            page_dims = letter
        else:
            page_dims = A4
        
        if orientation == 'landscape':
            page_dims = (page_dims[1], page_dims[0])
        
        print(f"Page dimensions: {page_dims}")
        
        # Generate output filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_filename = f'images_to_pdf_{timestamp}.pdf'
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        print(f"Output path: {output_path}")
        
        # Create PDF
        c = canvas.Canvas(output_path, pagesize=page_dims)
        page_width, page_height = page_dims
        
        for i, file in enumerate(files):
            try:
                print(f"Processing image {i+1}/{len(files)}: {file.filename}")
                
                # Save uploaded file temporarily
                temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1])
                file.save(temp_input.name)
                temp_input.close()
                
                # Open and process image
                img = Image.open(temp_input.name)
                print(f"Image mode: {img.mode}, size: {img.size}")
                
                # Convert to RGB if necessary
                if img.mode != 'RGB':
                    if img.mode in ('RGBA', 'LA'):
                        # Create white background
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'RGBA':
                            background.paste(img, mask=img.split()[-1])
                        else:
                            background.paste(img)
                        img = background
                    else:
                        img = img.convert('RGB')
                
                # Get image dimensions
                img_width, img_height = img.size
                
                # Calculate scaling to fit page while maintaining aspect ratio
                scale_x = (page_width - 40) / img_width
                scale_y = (page_height - 40) / img_height
                scale = min(scale_x, scale_y)
                
                new_width = img_width * scale
                new_height = img_height * scale
                
                # Center image on page
                x = (page_width - new_width) / 2
                y = (page_height - new_height) / 2
                
                print(f"Scaled dimensions: {new_width}x{new_height} at ({x}, {y})")
                
                # Save processed image temporarily
                temp_output = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
                img.save(temp_output.name, 'JPEG', quality=95)
                temp_output.close()
                
                # Draw image on PDF
                c.drawImage(temp_output.name, x, y, new_width, new_height)
                c.showPage()
                
                # Clean up temp files
                os.unlink(temp_input.name)
                os.unlink(temp_output.name)
                
                print(f"Successfully processed image {i+1}")
                    
            except Exception as img_error:
                print(f"Error processing image {file.filename}: {str(img_error)}")
                return jsonify({'error': f'Error processing image {file.filename}: {str(img_error)}'}), 500
        
        c.save()
        print(f"PDF saved successfully: {output_path}")
        
        return send_file(output_path, as_attachment=True, download_name=output_filename)
    
    except Exception as e:
        print(f"JPG to PDF conversion failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'JPG to PDF conversion failed: {str(e)}'}), 500

@app.route('/compress-pdf', methods=['POST'])
def compress_pdf():
    try:
        print("Starting PDF compression...")
        files = request.files.getlist('files')
        if not files:
            file = request.files.get('file')
            if file:
                files = [file]
        
        if not files:
            print("No files provided for compression")
            return jsonify({'error': 'No PDF file provided'}), 400
            
        file = files[0]  # Take first file for compression
        compression_level = request.form.get('compressionLevel', 'medium')
        
        print(f"Compressing file: {file.filename}, level: {compression_level}")
        
        if not allowed_file(file.filename, 'pdf'):
            print(f"Invalid PDF file: {file.filename}")
            return jsonify({'error': 'Invalid PDF file'}), 400
        
        # Save uploaded file temporarily
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        file.save(temp_input.name)
        temp_input.close()
        
        original_size = os.path.getsize(temp_input.name)
        print(f"Original file size: {original_size} bytes")
        
        # Generate output filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_filename = f'compressed_pdf_{timestamp}.pdf'
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        # Try PyMuPDF compression first (better results)
        if PYMUPDF_AVAILABLE:
            try:
                print("Using PyMuPDF for compression...")
                doc = fitz.open(temp_input.name)
                
                # Set compression options based on level
                if compression_level == 'low':
                    # Light compression
                    doc.save(output_path, garbage=1, clean=1)
                elif compression_level == 'medium':
                    # Medium compression
                    doc.save(output_path, garbage=2, clean=1, deflate=1)
                else:  # high compression
                    # Maximum compression
                    doc.save(output_path, garbage=4, clean=1, deflate=1, linear=1)
                
                doc.close()
                
            except Exception as pymupdf_error:
                print(f"PyMuPDF compression failed: {pymupdf_error}")
                # Fall back to PyPDF2
                compress_with_pypdf2(temp_input.name, output_path, compression_level)
        else:
            # Use PyPDF2 compression
            compress_with_pypdf2(temp_input.name, output_path, compression_level)
        
        # Clean up temp file
        os.unlink(temp_input.name)
        
        # Check compression results
        compressed_size = os.path.getsize(output_path)
        compression_ratio = (1 - compressed_size / original_size) * 100 if original_size > 0 else 0
        
        print(f"PDF compression completed successfully")
        print(f"Original size: {original_size} bytes")
        print(f"Compressed size: {compressed_size} bytes")
        print(f"Compression ratio: {compression_ratio:.1f}% reduction")
        
        return send_file(output_path, as_attachment=True, download_name=output_filename)
    
    except Exception as e:
        print(f"PDF compression failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'PDF compression failed: {str(e)}'}), 500

def compress_with_pypdf2(input_path, output_path, compression_level):
    """Fallback compression using PyPDF2"""
    print("Using PyPDF2 for compression...")
    reader = PyPDF2.PdfReader(input_path)
    writer = PyPDF2.PdfWriter()
    
    for page in reader.pages:
        if compression_level in ['medium', 'high']:
            try:
                page.compress_content_streams()
            except:
                pass
        writer.add_page(page)
    
    with open(output_path, 'wb') as output_file:
        writer.write(output_file)

@app.route('/edit-pdf', methods=['POST'])
def edit_pdf():
    try:
        print("Starting PDF editing...")
        
        if not PYMUPDF_AVAILABLE:
            return jsonify({'error': 'PDF editing requires PyMuPDF. Please install: pip install PyMuPDF'}), 400
        
        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'No PDF file provided'}), 400
            
        file = files[0]
        edit_mode = request.form.get('editMode', 'text')
        
        # Get edit instructions from form
        edits = []
        edit_count = 0
        while f'edit_{edit_count}_page' in request.form:
            edit = {
                'page': int(request.form.get(f'edit_{edit_count}_page', 0)),
                'old_text': request.form.get(f'edit_{edit_count}_old_text', ''),
                'new_text': request.form.get(f'edit_{edit_count}_new_text', ''),
                'x': float(request.form.get(f'edit_{edit_count}_x', 0)),
                'y': float(request.form.get(f'edit_{edit_count}_y', 0))
            }
            edits.append(edit)
            edit_count += 1
        
        print(f"Editing file: {file.filename}, mode: {edit_mode}, {len(edits)} edits")
        
        if not allowed_file(file.filename, 'pdf'):
            return jsonify({'error': 'Invalid PDF file'}), 400
        
        # Save uploaded file temporarily
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        file.save(temp_input.name)
        temp_input.close()
        
        # Open PDF with PyMuPDF
        doc = fitz.open(temp_input.name)
        
        # Process edits
        for edit in edits:
            page_num = edit['page']
            if page_num < len(doc):
                page = doc[page_num]
                
                if edit_mode == 'text' and edit['old_text'] and edit['new_text']:
                    # Find and replace text while preserving formatting
                    seamless_text_edit(page, edit['old_text'], edit['new_text'])
        
        # Generate output filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_filename = f'edited_pdf_{timestamp}.pdf'
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        # Save edited PDF
        doc.save(output_path)
        doc.close()
        
        # Clean up temp file
        os.unlink(temp_input.name)
        
        print("PDF editing completed successfully")
        
        return send_file(output_path, as_attachment=True, download_name=output_filename)
    
    except Exception as e:
        print(f"PDF editing failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'PDF editing failed: {str(e)}'}), 500

def seamless_text_edit(page, old_text, new_text):
    """Replace text while preserving original font, size, and color"""
    try:
        # Get all text instances on the page
        text_instances = page.get_text("dict")
        
        for block in text_instances["blocks"]:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        span_text = span["text"]
                        
                        # Check if this span contains the text to replace
                        if old_text in span_text:
                            # Extract original formatting
                            font = span["font"]
                            size = span["size"]
                            flags = span["flags"]
                            color = span["color"]
                            
                            # Get position
                            bbox = span["bbox"]
                            x, y = bbox[0], bbox[1]
                            
                            # Create a white rectangle to cover old text
                            page.draw_rect(fitz.Rect(bbox), color=(1, 1, 1), fill=True)
                            
                            # Replace text in the span
                            updated_text = span_text.replace(old_text, new_text)
                            
                            # Insert new text with exact same formatting
                            page.insert_text(
                                (x, y + size * 0.8),  # Adjust Y position for baseline
                                updated_text,
                                fontname=font,
                                fontsize=size,
                                color=color
                            )
                            
                            print(f"Replaced '{old_text}' with '{new_text}' using font: {font}, size: {size}")
                            
    except Exception as e:
        print(f"Error in seamless text edit: {str(e)}")
        # Fallback: simple text insertion
        page.insert_text((100, 100), f"Edit: {new_text}", fontsize=12)

@app.route('/get-pdf-text', methods=['POST'])
def get_pdf_text():
    """Extract text from PDF for editing interface"""
    try:
        if not PYMUPDF_AVAILABLE:
            return jsonify({'error': 'PDF text extraction requires PyMuPDF'}), 400
        
        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'No PDF file provided'}), 400
            
        file = files[0]
        
        # Save uploaded file temporarily
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        file.save(temp_input.name)
        temp_input.close()
        
        # Open PDF and extract text with positions
        doc = fitz.open(temp_input.name)
        pages_data = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text_dict = page.get_text("dict")
            
            page_texts = []
            for block in text_dict["blocks"]:
                if "lines" in block:
                    for line in block["lines"]:
                        for span in line["spans"]:
                            page_texts.append({
                                'text': span["text"],
                                'x': span["bbox"][0],
                                'y': span["bbox"][1],
                                'font': span["font"],
                                'size': span["size"],
                                'color': span["color"]
                            })
            
            pages_data.append({
                'page': page_num,
                'texts': page_texts
            })
        
        doc.close()
        os.unlink(temp_input.name)
        
        return jsonify({'pages': pages_data})
    
    except Exception as e:
        print(f"PDF text extraction failed: {str(e)}")
        return jsonify({'error': f'Text extraction failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)