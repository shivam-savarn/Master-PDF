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
            'jpg-to-pdf': {
                title: 'Convert JPG to PDF',
                accept: '.jpg,.jpeg,.png,.gif,.bmp',
                options: `
                    <div class="option-group">
                        <label>Page Size:</label>
                        <select id="pageSize">
                            <option value="A4" selected>A4</option>
                            <option value="Letter">Letter</option>
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
            'pdf-to-ppt': {
                title: 'Convert PDF to PowerPoint',
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
                            <option value="bottom-right" selected>Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
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
                        <label>Watermark Text:</label>
                        <input type="text" id="watermarkText" placeholder="Enter watermark text" value="WATERMARK">
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
                `
            },
            'sign-pdf': {
                title: 'Sign PDF',
                accept: '.pdf',
                options: `
                    <div class="option-group">
                        <label>Signature Text:</label>
                        <input type="text" id="signatureText" placeholder="Your name or signature">
                    </div>
                    <div class="option-group">
                        <label>Position:</label>
                        <select id="signaturePosition">
                            <option value="bottom-right" selected>Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
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
                    <i class="fas fa-file-pdf"></i>
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

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async processFiles() {
        if (this.currentTool === 'protect-pdf') {
            const password = document.getElementById('newPassword')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            if (!password) {
                alert('Please enter a password');
                return;
            }
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
        }

        const progressSection = document.getElementById('progressSection');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const processBtn = document.getElementById('processBtn');

        progressSection.style.display = 'block';
        processBtn.disabled = true;
        processBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        try {
            const formData = new FormData();
            
            this.selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            this.addToolOptions(formData);

            const endpoint = this.getEndpoint();
            
            if (!endpoint) {
                throw new Error('No endpoint configured for this tool');
            }
            
            this.simulateProgress();
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const blob = await response.blob();
                
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

    addToolOptions(formData) {
        switch(this.currentTool) {
            case 'jpg-to-pdf':
                const pageSize = document.getElementById('pageSize')?.value || 'A4';
                const orientation = document.getElementById('orientation')?.value || 'portrait';
                formData.append('pageSize', pageSize);
                formData.append('orientation', orientation);
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
            case 'unlock-pdf':
                const password = document.getElementById('pdfPassword')?.value || '';
                formData.append('password', password);
                break;
            case 'protect-pdf':
                const newPassword = document.getElementById('newPassword')?.value || '';
                formData.append('password', newPassword);
                break;
            case 'sign-pdf':
                const signatureText = document.getElementById('signatureText')?.value || 'SIGNED';
                const signaturePosition = document.getElementById('signaturePosition')?.value || 'bottom-right';
                formData.append('signatureText', signatureText);
                formData.append('position', signaturePosition);
                break;
        }
    }

    getEndpoint() {
        const endpoints = {
            'merge': '/merge-pdf',
            'jpg-to-pdf': '/jpg-to-pdf',
            'pdf-to-ppt': '/pdf-to-ppt',
            'add-page-numbers': '/add-page-numbers',
            'add-watermark': '/add-watermark',
            'crop-pdf': '/crop-pdf',
            'unlock-pdf': '/unlock-pdf',
            'protect-pdf': '/protect-pdf',
            'sign-pdf': '/sign-pdf'
        };
        
        return endpoints[this.currentTool];
    }

    getDownloadFilename() {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filenames = {
            'merge': `merged_pdf_${timestamp}.pdf`,
            'jpg-to-pdf': `images_to_pdf_${timestamp}.pdf`,
            'pdf-to-ppt': `pdf_to_ppt_${timestamp}.pptx`,
            'add-page-numbers': `numbered_pdf_${timestamp}.pdf`,
            'add-watermark': `watermarked_pdf_${timestamp}.pdf`,
            'crop-pdf': `cropped_pdf_${timestamp}.pdf`,
            'unlock-pdf': `unlocked_pdf_${timestamp}.pdf`,
            'protect-pdf': `protected_pdf_${timestamp}.pdf`,
            'sign-pdf': `signed_pdf_${timestamp}.pdf`
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
}

const pdfMaster = new PDFMaster();

document.addEventListener('change', (e) => {
    if (e.target.id === 'watermarkOpacity') {
        const opacityValue = document.getElementById('opacityValue');
        if (opacityValue) {
            opacityValue.textContent = e.target.value + '%';
        }
    }
});