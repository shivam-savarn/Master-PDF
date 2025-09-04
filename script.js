class PDFMaster {
    constructor() {
        this.currentTool = null;
        this.selectedFiles = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupModal();
    }

    bindEvents() {
        // Tool card clicks
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.openTool(tool);
            });
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // Click outside modal to close
        document.getElementById('toolModal').addEventListener('click', (e) => {
            if (e.target.id === 'toolModal') {
                this.closeModal();
            }
        });
    }

    setupModal() {
        const modal = document.getElementById('toolModal');
        const modalBody = document.getElementById('modalBody');
        
        // Clone the template
        const template = document.getElementById('fileUploadTemplate');
        const clone = template.content.cloneNode(true);
        modalBody.appendChild(clone);

        this.setupFileUpload();
    }

    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        const processBtn = document.getElementById('processBtn');

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Browse link click
        document.querySelector('.browse-link').addEventListener('click', () => {
            fileInput.click();
        });

        // Process button
        processBtn.addEventListener('click', () => {
            this.processFiles();
        });
    }

    openTool(toolName) {
        this.currentTool = toolName;
        const modal = document.getElementById('toolModal');
        const toolTitle = document.getElementById('toolTitle');
        const fileInput = document.getElementById('fileInput');
        const toolOptions = document.getElementById('toolOptions');

        // Set tool title and configure
        const toolConfig = this.getToolConfig(toolName);
        toolTitle.textContent = toolConfig.title;
        fileInput.accept = toolConfig.accept;

        // Clear previous files and options
        this.selectedFiles = [];
        this.updateFileList();
        this.updateProcessButton();
        toolOptions.innerHTML = toolConfig.options;

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('toolModal');
        modal.style.display = 'none';
        this.selectedFiles = [];
        this.currentTool = null;
    }

    getToolConfig(toolName) {
        const configs = {
            'merge': {
                title: 'Merge PDF Files',
                accept: '.pdf',
                options: `
                    <div class="option-group">
                        <label>Merge Order:</label>
                        <select id="mergeOrder">
                            <option value="name">By Name</option>
                            <option value="date">By Date</option>
                            <option value="custom">Custom Order</option>
                        </select>
                    </div>
                `
            },
            'remove-pages': {
                title: 'Remove Pages from PDF',
                accept: '.pdf',
                options: `
                    <div class="option-group">
                        <label>Pages to Remove (e.g., 1,3,5-7):</label>
                        <input type="text" id="pagesToRemove" placeholder="1,3,5-7">
                    </div>
                `
            },
            'compress': {
                title: 'Compress PDF',
                accept: '.pdf',
                options: `
                    <div class="option-group">
                        <label>Compression Level:</label>
                        <select id="compressionLevel">
                            <option value="low">Low (Better Quality)</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High (Smaller Size)</option>
                        </select>
                    </div>
                `
            },
            'jpg-to-pdf': {
                title: 'Convert JPG to PDF',
                accept: '.jpg,.jpeg,.png,.gif,.bmp',
                options: `
                    <div class="option-group">
                        <label>Page Size:</label>
                        <select id="pageSize">
                            <option value="A4" selected>A4</option>
                            <option value="Letter">Letter</option>
                            <option value="Legal">Legal</option>
                            <option value="auto">Auto Fit</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Orientation:</label>
                        <select id="orientation">
                            <option value="portrait" selected>Portrait</option>
                            <option value="landscape">Landscape</option>
                        </select>
                    </div>
                `
            },
            'word-to-pdf': {
                title: 'Convert Word to PDF',
                accept: '.doc,.docx',
                options: ''
            },
            'ppt-to-pdf': {
                title: 'Convert PowerPoint to PDF',
                accept: '.ppt,.pptx',
                options: ''
            },
            'excel-to-pdf': {
                title: 'Convert Excel to PDF',
                accept: '.xls,.xlsx',
                options: ''
            },
            'pdf-to-jpg': {
                title: 'Convert PDF to JPG',
                accept: '.pdf',
                options: `
                    <div class="option-group">
                        <label>Image Quality:</label>
                        <select id="imageQuality">
                            <option value="low">Low (72 DPI)</option>
                            <option value="medium" selected>Medium (150 DPI)</option>
                            <option value="high">High (300 DPI)</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Pages to Convert:</label>
                        <select id="pagesToConvert">
                            <option value="all" selected>All Pages</option>
                            <option value="first">First Page Only</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                `
            },
            'pdf-to-word': {
                title: 'Convert PDF to Word',
                accept: '.pdf',
                options: ''
            },
            'pdf-to-ppt': {
                title: 'Convert PDF to PowerPoint',
                accept: '.pdf',
                options: ''
            },
            'pdf-to-excel': {
                title: 'Convert PDF to Excel',
                accept: '.pdf',
                options: ''
            },
            'add-page-numbers': {
                title: 'Add Page Numbers',
                accept: '.pdf',
                options: `
                    <div class="option-group">
                        <label>Position:</label>
                        <select id="numberPosition">
                            <option value="bottom-center" selected>Bottom Center</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                            <option value="top-center">Top Center</option>
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Starting Number:</label>
                        <input type="number" id="startingNumber" value="1" min="1">
                    </div>
                `
            },
            'add-watermark': {
                title: 'Add Watermark',
                accept: '.pdf',
                options: `
                    <div class="option-group">
                        <label>Watermark Type:</label>
                        <select id="watermarkType">
                            <option value="text" selected>Text</option>
                            <option value="image">Image</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Watermark Text:</label>
                        <input type="text" id="watermarkText" placeholder="Enter watermark text">
                    </div>
                    <div class="option-group">
                        <label>Opacity:</label>
                        <input type="range" id="watermarkOpacity" min="10" max="100" value="50">
                        <span id="opacityValue">50%</span>
                    </div>
                `
            },
            'crop-pdf': {
                title: 'Crop PDF Pages',
                accept: '.pdf',
                options: `
                    <div class="option-group">
                        <label>Crop Margins (in points):</label>
                        <input type="number" id="cropTop" placeholder="Top" value="0">
                        <input type="number" id="cropBottom" placeholder="Bottom" value="0">
                        <input type="number" id="cropLeft" placeholder="Left" value="0">
                        <input type="number" id="cropRight" placeholder="Right" value="0">
                    </div>
                `
            },
            'edit-pdf': {
                title: 'Edit PDF Content (Visual Editor)',
                accept: '.pdf',
                options: `
                    <div class="pdf-editor-container">
                        <div class="editor-toolbar">
                            <button type="button" id="loadPdfBtn" class="toolbar-btn">
                                <i class="fas fa-eye"></i> Load PDF for Editing
                            </button>
                            <div class="zoom-controls" style="display: none;">
                                <button type="button" id="zoomOutBtn" class="toolbar-btn">
                                    <i class="fas fa-search-minus"></i>
                                </button>
                                <span id="zoomLevel">100%</span>
                                <button type="button" id="zoomInBtn" class="toolbar-btn">
                                    <i class="fas fa-search-plus"></i>
                                </button>
                            </div>
                            <div class="page-controls" style="display: none;">
                                <button type="button" id="prevPageBtn" class="toolbar-btn">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <span id="pageInfo">Page 1 of 1</span>
                                <button type="button" id="nextPageBtn" class="toolbar-btn">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                        <div id="pdfViewer" class="pdf-viewer" style="display: none;">
                            <canvas id="pdfCanvas"></canvas>
                            <div id="textOverlay" class="text-overlay"></div>
                        </div>
                        <div id="editPanel" class="edit-panel" style="display: none;">
                            <h4>Active Edits</h4>
                            <div id="editsContainer"></div>
                            <button type="button" id="applyEditsBtn" class="apply-edits-btn">
                                <i class="fas fa-save"></i> Apply All Edits
                            </button>
                        </div>
                    </div>
                `
            },
            'unlock-pdf': {
                title: 'Unlock PDF',
                accept: '.pdf',
                options: `
                    <div class="option-group">
                        <label>PDF Password:</label>
                        <input type="password" id="pdfPassword" placeholder="Enter PDF password">
                    </div>
                `
            },
            'protect-pdf': {
                title: 'Protect PDF',
                accept: '.pdf',
                options: `
                    <div class="option-group">
                        <label>New Password:</label>
                        <input type="password" id="newPassword" placeholder="Enter new password">
                    </div>
                    <div class="option-group">
                        <label>Confirm Password:</label>
                        <input type="password" id="confirmPassword" placeholder="Confirm password">
                    </div>
                    <div class="option-group">
                        <label>Permissions:</label>
                        <label><input type="checkbox" id="allowPrint" checked> Allow Printing</label>
                        <label><input type="checkbox" id="allowCopy" checked> Allow Copy</label>
                        <label><input type="checkbox" id="allowModify"> Allow Modifications</label>
                    </div>
                `
            },
            'sign-pdf': {
                title: 'Sign PDF',
                accept: '.pdf',
                options: `
                    <div class="option-group">
                        <label>Signature Type:</label>
                        <select id="signatureType">
                            <option value="digital">Digital Signature</option>
                            <option value="image">Image Signature</option>
                            <option value="text">Text Signature</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Signature Position:</label>
                        <select id="signaturePosition">
                            <option value="bottom-right" selected>Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
                            <option value="center">Center</option>
                        </select>
                    </div>
                `
            }
        };

        return configs[toolName] || { title: 'PDF Tool', accept: '*', options: '' };
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!this.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
                this.selectedFiles.push(file);
            }
        });
        this.updateFileList();
        this.updateProcessButton();
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-${this.getFileIcon(file.name)}"></i>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${this.formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button class="remove-file" onclick="pdfMaster.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updateFileList();
        this.updateProcessButton();
    }

    updateProcessButton() {
        const processBtn = document.getElementById('processBtn');
        processBtn.disabled = this.selectedFiles.length === 0;
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'pdf': 'pdf',
            'doc': 'word', 'docx': 'word',
            'xls': 'excel', 'xlsx': 'excel',
            'ppt': 'powerpoint', 'pptx': 'powerpoint',
            'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image'
        };
        return icons[ext] || 'alt';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async processFiles() {
        // Special handling for PDF editor
        if (this.currentTool === 'edit-pdf') {
            this.loadPdfForEditing();
            return;
        }

        const progressSection = document.getElementById('progressSection');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const processBtn = document.getElementById('processBtn');

        // Show progress
        progressSection.style.display = 'block';
        processBtn.disabled = true;
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        try {
            const formData = new FormData();
            
            // Add files to form data
            this.selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            // Add tool-specific options
            this.addToolOptions(formData);

            // Get endpoint URL
            const endpoint = this.getEndpoint();
            
            if (!endpoint) {
                throw new Error('No endpoint configured for this tool');
            }
            
            // Make request with progress simulation
            this.simulateProgress();
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Handle file download
                const blob = await response.blob();
                
                // Check if response is actually a PDF/file
                if (blob.size > 0) {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = this.getDownloadFilename();
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    this.completeProcessing(true);
                } else {
                    throw new Error('Empty response received');
                }
            } else {
                let errorMessage = 'Processing failed';
                try {
                    const error = await response.json();
                    errorMessage = error.error || errorMessage;
                } catch {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    completeProcessing(success = false) {
        const progressText = document.getElementById('progressText');
        const processBtn = document.getElementById('processBtn');
        const progressFill = document.getElementById('progressFill');

        if (success) {
            progressFill.style.width = '100%';
            progressText.innerHTML = '<i class="fas fa-check-circle" style="color: #48bb78;"></i> Processing Complete! File downloaded.';
            processBtn.innerHTML = '<i class="fas fa-redo"></i> Process More Files';
        } else {
            progressText.innerHTML = '<i class="fas fa-times-circle" style="color: #e53e3e;"></i> Processing Failed!';
            processBtn.innerHTML = '<i class="fas fa-redo"></i> Try Again';
        }
        
        processBtn.disabled = false;
        processBtn.onclick = () => {
            this.resetForm();
        };
    }

    showError(message) {
        const progressText = document.getElementById('progressText');
        const processBtn = document.getElementById('processBtn');
        
        progressText.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #e53e3e;"></i> Error: ${message}`;
        processBtn.innerHTML = '<i class="fas fa-redo"></i> Try Again';
        processBtn.disabled = false;
        processBtn.onclick = () => {
            this.resetForm();
        };
    }

    resetForm() {
        const progressSection = document.getElementById('progressSection');
        const processBtn = document.getElementById('processBtn');
        const progressFill = document.getElementById('progressFill');
        
        progressSection.style.display = 'none';
        progressFill.style.width = '0%';
        processBtn.innerHTML = '<i class="fas fa-cog"></i> Process Files';
        processBtn.onclick = () => this.processFiles();
        this.updateProcessButton();
    }

    addToolOptions(formData) {
        switch(this.currentTool) {
            case 'jpg-to-pdf':
                const pageSize = document.getElementById('pageSize')?.value || 'A4';
                const orientation = document.getElementById('orientation')?.value || 'portrait';
                formData.append('pageSize', pageSize);
                formData.append('orientation', orientation);
                break;
            case 'compress':
                const compressionLevel = document.getElementById('compressionLevel')?.value || 'medium';
                formData.append('compressionLevel', compressionLevel);
                break;
            case 'merge':
                const mergeOrder = document.getElementById('mergeOrder')?.value || 'name';
                formData.append('mergeOrder', mergeOrder);
                break;
            case 'add-page-numbers':
                const position = document.getElementById('numberPosition')?.value || 'bottom-right';
                const startPage = document.getElementById('startingNumber')?.value || '1';
                formData.append('position', position);
                formData.append('startPage', startPage);
                break;
            case 'add-watermark':
                const watermarkText = document.getElementById('watermarkText')?.value || 'WATERMARK';
                const opacity = document.getElementById('watermarkOpacity')?.value || '50';
                formData.append('watermarkText', watermarkText);
                formData.append('opacity', parseFloat(opacity) / 100);
                break;
            case 'crop-pdf':
                const top = document.getElementById('cropTop')?.value || '0';
                const bottom = document.getElementById('cropBottom')?.value || '0';
                const left = document.getElementById('cropLeft')?.value || '0';
                const right = document.getElementById('cropRight')?.value || '0';
                formData.append('top', top);
                formData.append('bottom', bottom);
                formData.append('left', left);
                formData.append('right', right);
                break;
            case 'edit-pdf':
                const editMode = document.getElementById('editMode')?.value || 'text';
                formData.append('editMode', editMode);
                
                // Add all edits
                const edits = document.querySelectorAll('.edit-item');
                edits.forEach((edit, index) => {
                    const page = edit.querySelector('.edit-page')?.value || 0;
                    const oldText = edit.querySelector('.edit-old-text')?.value || '';
                    const newText = edit.querySelector('.edit-new-text')?.value || '';
                    const x = edit.querySelector('.edit-x')?.value || 0;
                    const y = edit.querySelector('.edit-y')?.value || 0;
                    
                    formData.append(`edit_${index}_page`, page);
                    formData.append(`edit_${index}_old_text`, oldText);
                    formData.append(`edit_${index}_new_text`, newText);
                    formData.append(`edit_${index}_x`, x);
                    formData.append(`edit_${index}_y`, y);
                });
                break;
            case 'remove-pages':
                const pagesToRemove = document.getElementById('pagesToRemove')?.value || '';
                formData.append('pagesToRemove', pagesToRemove);
                break;
            case 'pdf-to-jpg':
                const imageQuality = document.getElementById('imageQuality')?.value || 'medium';
                const pagesToConvert = document.getElementById('pagesToConvert')?.value || 'all';
                formData.append('imageQuality', imageQuality);
                formData.append('pagesToConvert', pagesToConvert);
                break;
        }
    }

    getEndpoint() {
        const endpoints = {
            'merge': '/merge-pdf',
            'jpg-to-pdf': '/jpg-to-pdf',
            'compress': '/compress-pdf',
            'edit-pdf': '/edit-pdf',
            'remove-pages': '/remove-pages',
            'word-to-pdf': '/word-to-pdf',
            'ppt-to-pdf': '/ppt-to-pdf',
            'excel-to-pdf': '/excel-to-pdf',
            'pdf-to-jpg': '/pdf-to-jpg',
            'pdf-to-word': '/pdf-to-word',
            'pdf-to-ppt': '/pdf-to-ppt',
            'pdf-to-excel': '/pdf-to-excel',
            'add-page-numbers': '/add-page-numbers',
            'add-watermark': '/add-watermark',
            'crop-pdf': '/crop-pdf'
        };
        
        console.log('Current tool:', this.currentTool);
        console.log('Endpoint:', endpoints[this.currentTool]);
        
        if (!endpoints[this.currentTool]) {
            console.error('No endpoint found for tool:', this.currentTool);
            alert(`Error: No endpoint configured for ${this.currentTool}`);
            return null;
        }
        
        return endpoints[this.currentTool];
    }

    getDownloadFilename() {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filenames = {
            'merge': `merged_pdf_${timestamp}.pdf`,
            'jpg-to-pdf': `images_to_pdf_${timestamp}.pdf`,
            'compress': `compressed_pdf_${timestamp}.pdf`,
            'edit-pdf': `edited_pdf_${timestamp}.pdf`,
            'remove-pages': `pages_removed_${timestamp}.pdf`,
            'word-to-pdf': `word_to_pdf_${timestamp}.pdf`,
            'ppt-to-pdf': `ppt_to_pdf_${timestamp}.pdf`,
            'excel-to-pdf': `excel_to_pdf_${timestamp}.pdf`,
            'pdf-to-jpg': `pdf_to_jpg_${timestamp}.zip`,
            'pdf-to-word': `pdf_to_word_${timestamp}.docx`,
            'pdf-to-ppt': `pdf_to_ppt_${timestamp}.pptx`,
            'pdf-to-excel': `pdf_to_excel_${timestamp}.xlsx`,
            'add-page-numbers': `numbered_pdf_${timestamp}.pdf`,
            'add-watermark': `watermarked_pdf_${timestamp}.pdf`,
            'crop-pdf': `cropped_pdf_${timestamp}.pdf`
        };
        return filenames[this.currentTool] || `processed_${timestamp}.pdf`;
    }

    simulateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 90) {
                progress = 90;
                clearInterval(interval);
            }
            progressFill.style.width = progress + '%';
            progressText.textContent = `Processing... ${Math.round(progress)}%`;
        }, 100);
    }
    
    async extractPdfText() {
        if (this.selectedFiles.length === 0) {
            alert('Please select a PDF file first');
            return;
        }
        
        const formData = new FormData();
        formData.append('files', this.selectedFiles[0]);
        
        try {
            const response = await fetch('/get-pdf-text', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                this.displayExtractedText(data.pages);
            } else {
                const error = await response.json();
                alert('Error extracting text: ' + error.error);
            }
        } catch (error) {
            alert('Error extracting text: ' + error.message);
        }
    }
    
    displayExtractedText(pages) {
        const textEditArea = document.getElementById('textEditArea');
        const pagesContainer = document.getElementById('pagesContainer');
        
        textEditArea.style.display = 'block';
        pagesContainer.innerHTML = '';
        
        pages.forEach((pageData, pageIndex) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'page-text-container';
            pageDiv.innerHTML = `
                <h4>Page ${pageIndex + 1}</h4>
                <div class="text-items">
                    ${pageData.texts.map((text, textIndex) => `
                        <div class="text-item" data-page="${pageIndex}" data-x="${text.x}" data-y="${text.y}" 
                             data-font="${text.font}" data-size="${text.size}" data-color="${text.color}">
                            <span class="text-content">${text.text}</span>
                            <button class="edit-text-btn" onclick="pdfMaster.editTextItem(this)">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            pagesContainer.appendChild(pageDiv);
        });
    }
    
    editTextItem(button) {
        const textItem = button.closest('.text-item');
        const currentText = textItem.querySelector('.text-content').textContent;
        const newText = prompt('Edit text:', currentText);
        
        if (newText !== null && newText !== currentText) {
            this.addEdit(
                parseInt(textItem.dataset.page),
                currentText,
                newText,
                parseFloat(textItem.dataset.x),
                parseFloat(textItem.dataset.y)
            );
        }
    }
    
    addManualEdit() {
        const page = prompt('Page number (0-based):');
        const oldText = prompt('Text to replace:');
        const newText = prompt('New text:');
        
        if (page !== null && oldText && newText) {
            this.addEdit(parseInt(page), oldText, newText, 0, 0);
        }
    }
    
    addEdit(page, oldText, newText, x, y) {
        const editsContainer = document.getElementById('editsContainer');
        const editDiv = document.createElement('div');
        editDiv.className = 'edit-item';
        editDiv.innerHTML = `
            <div class="edit-details">
                <h5>Edit ${editsContainer.children.length + 1}</h5>
                <input type="hidden" class="edit-page" value="${page}">
                <input type="hidden" class="edit-old-text" value="${oldText}">
                <input type="hidden" class="edit-new-text" value="${newText}">
                <input type="hidden" class="edit-x" value="${x}">
                <input type="hidden" class="edit-y" value="${y}">
                <p><strong>Page:</strong> ${page + 1}</p>
                <p><strong>Replace:</strong> "${oldText}"</p>
                <p><strong>With:</strong> "${newText}"</p>
                <button class="remove-edit-btn" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        editsContainer.appendChild(editDiv);
    }

    loadPdfForEditing() {
        if (this.selectedFiles.length === 0) {
            alert('Please select a PDF file first');
            return;
        }

        const processBtn = document.getElementById('processBtn');
        processBtn.innerHTML = '<i class="fas fa-eye"></i> Open PDF Editor';
        processBtn.disabled = false;
        
        // Show PDF editor interface
        this.initializePdfEditor();
    }

    initializePdfEditor() {
        this.currentZoom = 1.0;
        this.currentPage = 0;
        this.pdfDoc = null;
        this.edits = [];

        const pdfViewer = document.getElementById('pdfViewer');
        const editPanel = document.getElementById('editPanel');
        const zoomControls = document.querySelector('.zoom-controls');
        const pageControls = document.querySelector('.page-controls');

        if (pdfViewer) {
            pdfViewer.style.display = 'block';
            editPanel.style.display = 'block';
            zoomControls.style.display = 'flex';
            pageControls.style.display = 'flex';
            
            this.loadPdfInViewer();
        }
    }

    async loadPdfInViewer() {
        try {
            const file = this.selectedFiles[0];
            const arrayBuffer = await file.arrayBuffer();
            
            // Load PDF using PDF.js (we'll need to include this library)
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);
            this.pdfDoc = await loadingTask.promise;
            
            this.renderPage(1);
            this.updatePageInfo();
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Error loading PDF. Make sure PDF.js is loaded.');
        }
    }

    async renderPage(pageNum) {
        if (!this.pdfDoc) return;
        
        const page = await this.pdfDoc.getPage(pageNum);
        const canvas = document.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');
        
        const viewport = page.getViewport({ scale: this.currentZoom });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Load text layer for editing
        this.loadTextLayer(page, viewport);
    }

    async loadTextLayer(page, viewport) {
        const textContent = await page.getTextContent();
        const textOverlay = document.getElementById('textOverlay');
        textOverlay.innerHTML = '';
        textOverlay.style.width = viewport.width + 'px';
        textOverlay.style.height = viewport.height + 'px';
        
        textContent.items.forEach((item, index) => {
            const textDiv = document.createElement('div');
            textDiv.className = 'text-element';
            textDiv.textContent = item.str;
            textDiv.style.position = 'absolute';
            textDiv.style.left = item.transform[4] * this.currentZoom + 'px';
            textDiv.style.top = (viewport.height - item.transform[5] * this.currentZoom) + 'px';
            textDiv.style.fontSize = (item.transform[0] * this.currentZoom) + 'px';
            textDiv.style.cursor = 'pointer';
            textDiv.style.border = '1px solid transparent';
            textDiv.style.padding = '2px';
            
            textDiv.addEventListener('click', () => {
                this.editTextElement(textDiv, item, index);
            });
            
            textDiv.addEventListener('mouseenter', () => {
                textDiv.style.border = '1px solid #007bff';
                textDiv.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
            });
            
            textDiv.addEventListener('mouseleave', () => {
                textDiv.style.border = '1px solid transparent';
                textDiv.style.backgroundColor = 'transparent';
            });
            
            textOverlay.appendChild(textDiv);
        });
    }

    editTextElement(textDiv, textItem, index) {
        const currentText = textItem.str;
        const newText = prompt('Edit text:', currentText);
        
        if (newText !== null && newText !== currentText) {
            // Update visual
            textDiv.textContent = newText;
            textDiv.style.backgroundColor = 'rgba(255, 193, 7, 0.3)';
            
            // Store edit
            this.addEdit(
                this.currentPage,
                currentText,
                newText,
                textItem.transform[4],
                textItem.transform[5]
            );
        }
    }

    updatePageInfo() {
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo && this.pdfDoc) {
            pageInfo.textContent = `Page ${this.currentPage + 1} of ${this.pdfDoc.numPages}`;
        }
    }

    zoomIn() {
        this.currentZoom = Math.min(this.currentZoom * 1.2, 3.0);
        this.updateZoom();
    }

    zoomOut() {
        this.currentZoom = Math.max(this.currentZoom / 1.2, 0.5);
        this.updateZoom();
    }

    updateZoom() {
        const zoomLevel = document.getElementById('zoomLevel');
        if (zoomLevel) {
            zoomLevel.textContent = Math.round(this.currentZoom * 100) + '%';
        }
        this.renderPage(this.currentPage + 1);
    }

    nextPage() {
        if (this.pdfDoc && this.currentPage < this.pdfDoc.numPages - 1) {
            this.currentPage++;
            this.renderPage(this.currentPage + 1);
            this.updatePageInfo();
        }
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.renderPage(this.currentPage + 1);
            this.updatePageInfo();
        }
    }

    async applyAllEdits() {
        if (this.edits.length === 0) {
            alert('No edits to apply');
            return;
        }

        const formData = new FormData();
        formData.append('files', this.selectedFiles[0]);
        formData.append('editMode', 'text');
        
        // Add all edits
        this.edits.forEach((edit, index) => {
            formData.append(`edit_${index}_page`, edit.page);
            formData.append(`edit_${index}_old_text`, edit.oldText);
            formData.append(`edit_${index}_new_text`, edit.newText);
            formData.append(`edit_${index}_x`, edit.x);
            formData.append(`edit_${index}_y`, edit.y);
        });

        try {
            const response = await fetch('/edit-pdf', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = this.getDownloadFilename();
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                alert('PDF edited successfully!');
            } else {
                const error = await response.json();
                alert('Error: ' + error.error);
            }
        } catch (error) {
            alert('Error applying edits: ' + error.message);
        }
    }
}

// Initialize the application
const pdfMaster = new PDFMaster();

// Add dynamic opacity display for watermark
document.addEventListener('change', (e) => {
    if (e.target.id === 'watermarkOpacity') {
        const opacityValue = document.getElementById('opacityValue');
        if (opacityValue) {
            opacityValue.textContent = e.target.value + '%';
        }
    }
    
    // Handle edit mode changes
    if (e.target.id === 'editMode') {
        const textEditSection = document.getElementById('textEditSection');
        if (textEditSection) {
            textEditSection.style.display = e.target.value === 'text' ? 'block' : 'none';
        }
    }
});

// Handle PDF editor buttons
document.addEventListener('click', (e) => {
    if (e.target.id === 'loadPdfBtn' || e.target.closest('#loadPdfBtn')) {
        pdfMaster.loadPdfForEditing();
    }
    
    if (e.target.id === 'zoomInBtn' || e.target.closest('#zoomInBtn')) {
        pdfMaster.zoomIn();
    }
    
    if (e.target.id === 'zoomOutBtn' || e.target.closest('#zoomOutBtn')) {
        pdfMaster.zoomOut();
    }
    
    if (e.target.id === 'nextPageBtn' || e.target.closest('#nextPageBtn')) {
        pdfMaster.nextPage();
    }
    
    if (e.target.id === 'prevPageBtn' || e.target.closest('#prevPageBtn')) {
        pdfMaster.prevPage();
    }
    
    if (e.target.id === 'applyEditsBtn' || e.target.closest('#applyEditsBtn')) {
        pdfMaster.applyAllEdits();
    }
});