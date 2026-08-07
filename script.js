/**
 * OmniTool 3D — Client-Side Suite Engine
 * (Invert + Black & White + Compress + Cropper + PNG to JPG + JPG to PDF + PDF Merger + MHTML to PDF + PDF Protection + PDF Metadata + Social + Text)
 */

document.addEventListener('DOMContentLoaded', () => {

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ==========================================
    // 1. Invert Image Colors Engine
    // ==========================================
    const invertDropZone = document.getElementById('invert-drop-zone');
    const invertFileInput = document.getElementById('invert-file-input');
    const invertWorkspace = document.getElementById('invert-workspace');
    const invertAmountInput = document.getElementById('invert-amount');
    const invertAmountVal = document.getElementById('invert-amount-val');
    const invertOrigImg = document.getElementById('invert-orig-img');
    const invertCanvas = document.getElementById('invert-canvas');
    const invertCtx = invertCanvas ? invertCanvas.getContext('2d') : null;
    const downloadInvertBtn = document.getElementById('download-invert-btn');
    const resetInvertBtn = document.getElementById('reset-invert-btn');

    let currentInvertFile = null;
    let loadedInvertImage = null;

    if (invertDropZone && invertFileInput) {
        invertDropZone.addEventListener('click', () => invertFileInput.click());

        invertDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            invertDropZone.classList.add('drag-over');
        });

        invertDropZone.addEventListener('dragleave', () => invertDropZone.classList.remove('drag-over'));

        invertDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            invertDropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleInvertFile(e.dataTransfer.files[0]);
        });

        invertFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleInvertFile(e.target.files[0]);
        });

        resetInvertBtn.addEventListener('click', () => {
            invertFileInput.value = '';
            invertWorkspace.classList.add('d-none');
            invertDropZone.classList.remove('d-none');
        });

        invertAmountInput.addEventListener('input', (e) => {
            const val = e.target.value;
            invertAmountVal.innerText = `${val}% ${val == 100 ? '(Full Negative)' : ''}`;
            if (loadedInvertImage) applyInvertColors();
        });
    }

    function handleInvertFile(file) {
        currentInvertFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            loadedInvertImage = new Image();
            loadedInvertImage.onload = () => {
                invertOrigImg.src = e.target.result;
                applyInvertColors();
                invertDropZone.classList.add('d-none');
                invertWorkspace.classList.remove('d-none');
            };
            loadedInvertImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function applyInvertColors() {
        if (!loadedInvertImage || !invertCanvas) return;

        invertCanvas.width = loadedInvertImage.width;
        invertCanvas.height = loadedInvertImage.height;
        invertCtx.drawImage(loadedInvertImage, 0, 0);

        const imgData = invertCtx.getImageData(0, 0, invertCanvas.width, invertCanvas.height);
        const data = imgData.data;
        const factor = parseFloat(invertAmountInput.value) / 100;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const invR = 255 - r;
            const invG = 255 - g;
            const invB = 255 - b;

            data[i]     = r + (invR - r) * factor;
            data[i + 1] = g + (invG - g) * factor;
            data[i + 2] = b + (invB - b) * factor;
        }

        invertCtx.putImageData(imgData, 0, 0);

        const resultUrl = invertCanvas.toDataURL('image/png');
        downloadInvertBtn.href = resultUrl;
        downloadInvertBtn.download = (currentInvertFile ? currentInvertFile.name.replace(/\.[^/.]+$/, "") : 'image') + "-negative.png";
    }

    // ==========================================
    // 2. Black and White Converter Engine
    // ==========================================
    const bwDropZone = document.getElementById('bw-drop-zone');
    const bwFileInput = document.getElementById('bw-file-input');
    const bwWorkspace = document.getElementById('bw-workspace');
    const bwOrigImg = document.getElementById('bw-orig-img');
    const bwCanvas = document.getElementById('bw-canvas');
    const bwCtx = bwCanvas ? bwCanvas.getContext('2d') : null;
    const downloadBwBtn = document.getElementById('download-bw-btn');
    const resetBwBtn = document.getElementById('reset-bw-btn');

    let currentBwFile = null;
    let loadedBwImage = null;

    if (bwDropZone && bwFileInput) {
        bwDropZone.addEventListener('click', () => bwFileInput.click());

        bwDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            bwDropZone.classList.add('drag-over');
        });

        bwDropZone.addEventListener('dragleave', () => bwDropZone.classList.remove('drag-over'));

        bwDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            bwDropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleBwFile(e.dataTransfer.files[0]);
        });

        bwFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleBwFile(e.target.files[0]);
        });

        if (resetBwBtn) {
            resetBwBtn.addEventListener('click', () => {
                bwFileInput.value = '';
                bwWorkspace.classList.add('d-none');
                bwDropZone.classList.remove('d-none');
            });
        }
    }

    function handleBwFile(file) {
        if (!file.type.match(/image\/(png|jpeg|jpg|webp)/i)) {
            alert('Please select a valid image file (PNG, JPEG, WEBP).');
            return;
        }

        currentBwFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            loadedBwImage = new Image();
            loadedBwImage.onload = () => {
                bwOrigImg.src = e.target.result;
                convertImageToBlackAndWhite();
                bwDropZone.classList.add('d-none');
                bwWorkspace.classList.remove('d-none');
            };
            loadedBwImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function convertImageToBlackAndWhite() {
        if (!loadedBwImage || !bwCanvas || !bwCtx) return;

        bwCanvas.width = loadedBwImage.width;
        bwCanvas.height = loadedBwImage.height;
        bwCtx.drawImage(loadedBwImage, 0, 0);

        const imgData = bwCtx.getImageData(0, 0, bwCanvas.width, bwCanvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i]     = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
        }

        bwCtx.putImageData(imgData, 0, 0);

        const bwDataUrl = bwCanvas.toDataURL('image/png');
        downloadBwBtn.href = bwDataUrl;

        const fileName = (currentBwFile ? currentBwFile.name.replace(/\.[^/.]+$/, "") : 'image') + "-bw.png";
        downloadBwBtn.download = fileName;
    }

    // ==========================================
    // 3. Compress Image Engine
    // ==========================================
    const compressDropZone = document.getElementById('compress-drop-zone');
    const compressFileInput = document.getElementById('compress-file-input');
    const compressWorkspace = document.getElementById('compress-workspace');
    const compressQualityInput = document.getElementById('compress-quality');
    const compressQualityVal = document.getElementById('compress-quality-val');
    const compressOrigImg = document.getElementById('compress-orig-img');
    const compressCanvas = document.getElementById('compress-canvas');
    const compressCtx = compressCanvas ? compressCanvas.getContext('2d') : null;
    const compressOrigSize = document.getElementById('compress-orig-size');
    const compressNewSize = document.getElementById('compress-new-size');
    const compressSavings = document.getElementById('compress-savings');
    const downloadCompressBtn = document.getElementById('download-compress-btn');
    const resetCompressBtn = document.getElementById('reset-compress-btn');

    let currentCompressFile = null;
    let loadedCompressImage = null;

    if (compressDropZone && compressFileInput) {
        compressDropZone.addEventListener('click', () => compressFileInput.click());

        compressDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            compressDropZone.classList.add('drag-over');
        });

        compressDropZone.addEventListener('dragleave', () => compressDropZone.classList.remove('drag-over'));

        compressDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            compressDropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleCompressFile(e.dataTransfer.files[0]);
        });

        compressFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleCompressFile(e.target.files[0]);
        });

        if (resetCompressBtn) {
            resetCompressBtn.addEventListener('click', () => {
                compressFileInput.value = '';
                compressWorkspace.classList.add('d-none');
                compressDropZone.classList.remove('d-none');
            });
        }

        compressQualityInput.addEventListener('input', (e) => {
            const val = e.target.value;
            let label = `${val}%`;
            if (val >= 80) label += ' (High Quality)';
            else if (val >= 50) label += ' (Balanced)';
            else label += ' (High Compression)';
            compressQualityVal.innerText = label;

            if (loadedCompressImage) compressImage();
        });
    }

    function handleCompressFile(file) {
        if (!file.type.match(/image\/(png|jpeg|jpg|webp)/i)) {
            alert('Please select a valid image file (PNG, JPEG, WEBP).');
            return;
        }

        currentCompressFile = file;
        compressOrigSize.innerText = `Size: ${formatBytes(file.size)}`;

        const reader = new FileReader();
        reader.onload = (e) => {
            loadedCompressImage = new Image();
            loadedCompressImage.onload = () => {
                compressOrigImg.src = e.target.result;
                compressImage();
                compressDropZone.classList.add('d-none');
                compressWorkspace.classList.remove('d-none');
            };
            loadedCompressImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function compressImage() {
        if (!loadedCompressImage || !compressCanvas || !compressCtx) return;

        compressCanvas.width = loadedCompressImage.width;
        compressCanvas.height = loadedCompressImage.height;

        compressCtx.fillStyle = '#FFFFFF';
        compressCtx.fillRect(0, 0, compressCanvas.width, compressCanvas.height);
        compressCtx.drawImage(loadedCompressImage, 0, 0);

        const quality = parseFloat(compressQualityInput.value) / 100;
        const compressedDataUrl = compressCanvas.toDataURL('image/jpeg', quality);

        downloadCompressBtn.href = compressedDataUrl;
        const baseName = currentCompressFile ? currentCompressFile.name.replace(/\.[^/.]+$/, "") : 'compressed';
        downloadCompressBtn.download = `${baseName}-compressed.jpg`;

        const head = 'data:image/jpeg;base64,';
        const compressedSizeBytes = Math.round((compressedDataUrl.length - head.length) * 3 / 4);
        
        compressNewSize.innerText = `Size: ${formatBytes(compressedSizeBytes)}`;

        const originalSizeBytes = currentCompressFile.size;
        const savedBytes = originalSizeBytes - compressedSizeBytes;
        const savedPercentage = Math.round((savedBytes / originalSizeBytes) * 100);

        if (savedPercentage > 0) {
            compressSavings.className = 'badge bg-success-subtle text-success border border-success-subtle rounded-pill fs-8 mt-1';
            compressSavings.innerText = `Saved ${savedPercentage}% (${formatBytes(savedBytes)})`;
        } else {
            compressSavings.className = 'badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill fs-8 mt-1';
            compressSavings.innerText = `Size increased by ${Math.abs(savedPercentage)}%`;
        }
    }

    // ==========================================
    // 4. Image Cropper Engine
    // ==========================================
    const cropDropZone = document.getElementById('crop-drop-zone');
    const cropFileInput = document.getElementById('crop-file-input');
    const cropWorkspace = document.getElementById('crop-workspace');
    const cropCanvas = document.getElementById('crop-canvas');
    const cropCtx = cropCanvas ? cropCanvas.getContext('2d') : null;
    const cropOverlayBox = document.getElementById('crop-overlay-box');
    const cropResultCanvas = document.getElementById('crop-result-canvas');
    const cropResultCtx = cropResultCanvas ? cropResultCanvas.getContext('2d') : null;

    const inputW = document.getElementById('crop-w-input');
    const inputH = document.getElementById('crop-h-input');
    const inputX = document.getElementById('crop-x-input');
    const inputY = document.getElementById('crop-y-input');
    const cropBadge = document.getElementById('crop-badge');
    const downloadCropBtn = document.getElementById('download-crop-btn');
    const resetCropBtn = document.getElementById('reset-crop-btn');
    const aspectGroup = document.getElementById('crop-aspect-ratios');

    let currentCropFile = null;
    let loadedCropImage = null;
    let scaleRatio = 1;
    let currentAspectRatio = 'free';

    let cropRect = { x: 0, y: 0, w: 0, h: 0 };
    let isDragging = false;
    let activeHandle = null;
    let dragStartPos = { x: 0, y: 0 };
    let initialCropRect = { x: 0, y: 0, w: 0, h: 0 };

    if (cropDropZone && cropFileInput) {
        cropDropZone.addEventListener('click', () => cropFileInput.click());

        cropDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            cropDropZone.classList.add('drag-over');
        });

        cropDropZone.addEventListener('dragleave', () => cropDropZone.classList.remove('drag-over'));

        cropDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            cropDropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleCropFile(e.dataTransfer.files[0]);
        });

        cropFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleCropFile(e.target.files[0]);
        });

        if (resetCropBtn) {
            resetCropBtn.addEventListener('click', () => {
                cropFileInput.value = '';
                cropWorkspace.classList.add('d-none');
                cropDropZone.classList.remove('d-none');
            });
        }

        aspectGroup.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                aspectGroup.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentAspectRatio = e.target.dataset.ratio;
                applyAspectRatio();
            });
        });

        [inputW, inputH, inputX, inputY].forEach(input => {
            input.addEventListener('input', () => {
                if (!loadedCropImage) return;
                const realW = Math.min(loadedCropImage.width, Math.max(10, parseInt(inputW.value) || 10));
                const realH = Math.min(loadedCropImage.height, Math.max(10, parseInt(inputH.value) || 10));
                const realX = Math.min(loadedCropImage.width - realW, Math.max(0, parseInt(inputX.value) || 0));
                const realY = Math.min(loadedCropImage.height - realH, Math.max(0, parseInt(inputY.value) || 0));

                cropRect = {
                    x: realX * scaleRatio,
                    y: realY * scaleRatio,
                    w: realW * scaleRatio,
                    h: realH * scaleRatio
                };
                updateCropBoxUI();
                renderCroppedPreview();
            });
        });
    }

    function handleCropFile(file) {
        if (!file.type.match(/image\/(png|jpeg|jpg|webp|gif)/i)) {
            alert('Please select a valid image file (PNG, JPEG, WEBP, GIF).');
            return;
        }

        currentCropFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            loadedCropImage = new Image();
            loadedCropImage.onload = () => {
                initCropperCanvas();
                cropDropZone.classList.add('d-none');
                cropWorkspace.classList.remove('d-none');
            };
            loadedCropImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function initCropperCanvas() {
        const containerWidth = Math.min(loadedCropImage.width, 740);
        scaleRatio = containerWidth / loadedCropImage.width;

        cropCanvas.width = containerWidth;
        cropCanvas.height = loadedCropImage.height * scaleRatio;

        cropCtx.drawImage(loadedCropImage, 0, 0, cropCanvas.width, cropCanvas.height);

        const defaultW = cropCanvas.width * 0.8;
        const defaultH = cropCanvas.height * 0.8;

        cropRect = {
            x: (cropCanvas.width - defaultW) / 2,
            y: (cropCanvas.height - defaultH) / 2,
            w: defaultW,
            h: defaultH
        };

        if (currentAspectRatio !== 'free') {
            applyAspectRatio();
        } else {
            updateCropBoxUI();
            renderCroppedPreview();
        }

        attachCropDragEvents();
    }

    function applyAspectRatio() {
        if (!loadedCropImage) return;

        if (currentAspectRatio === 'free') {
            updateCropBoxUI();
            renderCroppedPreview();
            return;
        }

        const [rW, rH] = currentAspectRatio.split(':').map(Number);
        const targetRatio = rW / rH;

        let newW = cropRect.w;
        let newH = newW / targetRatio;

        if (newH > cropCanvas.height) {
            newH = cropCanvas.height * 0.8;
            newW = newH * targetRatio;
        }

        cropRect.w = newW;
        cropRect.h = newH;

        if (cropRect.x + cropRect.w > cropCanvas.width) cropRect.x = cropCanvas.width - cropRect.w;
        if (cropRect.y + cropRect.h > cropCanvas.height) cropRect.y = cropCanvas.height - cropRect.h;

        updateCropBoxUI();
        renderCroppedPreview();
    }

    function updateCropBoxUI() {
        cropOverlayBox.style.left = `${cropRect.x}px`;
        cropOverlayBox.style.top = `${cropRect.y}px`;
        cropOverlayBox.style.width = `${cropRect.w}px`;
        cropOverlayBox.style.height = `${cropRect.h}px`;

        const realX = Math.round(cropRect.x / scaleRatio);
        const realY = Math.round(cropRect.y / scaleRatio);
        const realW = Math.round(cropRect.w / scaleRatio);
        const realH = Math.round(cropRect.h / scaleRatio);

        inputW.value = realW;
        inputH.value = realH;
        inputX.value = realX;
        inputY.value = realY;

        cropBadge.innerText = `${realW} × ${realH} px`;
    }

    function renderCroppedPreview() {
        if (!loadedCropImage || !cropResultCanvas) return;

        const realX = Math.round(cropRect.x / scaleRatio);
        const realY = Math.round(cropRect.y / scaleRatio);
        const realW = Math.round(cropRect.w / scaleRatio);
        const realH = Math.round(cropRect.h / scaleRatio);

        if (realW <= 0 || realH <= 0) return;

        cropResultCanvas.width = realW;
        cropResultCanvas.height = realH;

        cropResultCtx.clearRect(0, 0, realW, realH);
        cropResultCtx.drawImage(
            loadedCropImage,
            realX, realY, realW, realH,
            0, 0, realW, realH
        );

        const format = currentCropFile && currentCropFile.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        const croppedUrl = cropResultCanvas.toDataURL(format, 0.95);

        downloadCropBtn.href = croppedUrl;

        const ext = format === 'image/jpeg' ? 'jpg' : 'png';
        const baseName = currentCropFile ? currentCropFile.name.replace(/\.[^/.]+$/, "") : 'cropped';
        downloadCropBtn.download = `${baseName}-cropped.${ext}`;
    }

    function attachCropDragEvents() {
        const container = document.getElementById('cropper-container');

        const onPointerDown = (e) => {
            const rect = container.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            if (!clientX || !clientY) return;

            const pointerX = clientX - rect.left;
            const pointerY = clientY - rect.top;

            if (e.target.classList.contains('crop-handle')) {
                activeHandle = e.target.dataset.handle;
            } else if (e.target.closest('#crop-overlay-box')) {
                activeHandle = 'move';
            } else {
                return;
            }

            isDragging = true;
            dragStartPos = { x: pointerX, y: pointerY };
            initialCropRect = { ...cropRect };

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;

            const rect = container.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            const dx = (clientX - rect.left) - dragStartPos.x;
            const dy = (clientY - rect.top) - dragStartPos.y;

            if (activeHandle === 'move') {
                let newX = initialCropRect.x + dx;
                let newY = initialCropRect.y + dy;

                newX = Math.max(0, Math.min(cropCanvas.width - initialCropRect.w, newX));
                newY = Math.max(0, Math.min(cropCanvas.height - initialCropRect.h, newY));

                cropRect.x = newX;
                cropRect.y = newY;
            } else if (activeHandle) {
                let newX = initialCropRect.x;
                let newY = initialCropRect.y;
                let newW = initialCropRect.w;
                let newH = initialCropRect.h;

                if (activeHandle.includes('e')) newW = Math.min(cropCanvas.width - initialCropRect.x, Math.max(20, initialCropRect.w + dx));
                if (activeHandle.includes('s')) newH = Math.min(cropCanvas.height - initialCropRect.y, Math.max(20, initialCropRect.h + dy));
                if (activeHandle.includes('w')) {
                    const possibleW = initialCropRect.w - dx;
                    if (possibleW >= 20 && initialCropRect.x + dx >= 0) {
                        newW = possibleW;
                        newX = initialCropRect.x + dx;
                    }
                }
                if (activeHandle.includes('n')) {
                    const possibleH = initialCropRect.h - dy;
                    if (possibleH >= 20 && initialCropRect.y + dy >= 0) {
                        newH = possibleH;
                        newY = initialCropRect.y + dy;
                    }
                }

                if (currentAspectRatio !== 'free') {
                    const [rW, rH] = currentAspectRatio.split(':').map(Number);
                    const targetRatio = rW / rH;

                    if (activeHandle === 'se' || activeHandle === 'nw') {
                        newH = newW / targetRatio;
                    } else {
                        newW = newH * targetRatio;
                    }
                }

                cropRect = { x: newX, y: newY, w: newW, h: newH };
            }

            updateCropBoxUI();
            renderCroppedPreview();
        };

        const onPointerUp = () => {
            isDragging = false;
            activeHandle = null;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        };

        container.onpointerdown = onPointerDown;
    }

    // ==========================================
    // 5. PNG to JPG Converter Engine
    // ==========================================
    const pngDropZone = document.getElementById('png-drop-zone');
    const pngFileInput = document.getElementById('png-file-input');
    const pngWorkspace = document.getElementById('png-workspace');
    const pngOrigImg = document.getElementById('png-orig-img');
    const pngJpgCanvas = document.getElementById('png-jpg-canvas');
    const pngCtx = pngJpgCanvas ? pngJpgCanvas.getContext('2d') : null;
    const downloadJpgBtn = document.getElementById('download-jpg-btn');
    const resetPngBtn = document.getElementById('reset-png-btn');

    let currentPngFile = null;
    let loadedPngImage = null;

    if (pngDropZone && pngFileInput) {
        pngDropZone.addEventListener('click', () => pngFileInput.click());

        pngDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            pngDropZone.classList.add('drag-over');
        });

        pngDropZone.addEventListener('dragleave', () => pngDropZone.classList.remove('drag-over'));

        pngDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            pngDropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handlePngFile(e.dataTransfer.files[0]);
        });

        pngFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handlePngFile(e.target.files[0]);
        });

        if (resetPngBtn) {
            resetPngBtn.addEventListener('click', () => {
                pngFileInput.value = '';
                pngWorkspace.classList.add('d-none');
                pngDropZone.classList.remove('d-none');
            });
        }
    }

    function handlePngFile(file) {
        if (!file.type.includes('png') && !file.name.toLowerCase().endsWith('.png')) {
            alert('Please select a valid PNG image file.');
            return;
        }

        currentPngFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            loadedPngImage = new Image();
            loadedPngImage.onload = () => {
                pngOrigImg.src = e.target.result;
                convertPngToJpg();
                pngDropZone.classList.add('d-none');
                pngWorkspace.classList.remove('d-none');
            };
            loadedPngImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function convertPngToJpg() {
        if (!loadedPngImage || !pngJpgCanvas || !pngCtx) return;

        pngJpgCanvas.width = loadedPngImage.width;
        pngJpgCanvas.height = loadedPngImage.height;

        pngCtx.fillStyle = '#FFFFFF';
        pngCtx.fillRect(0, 0, pngJpgCanvas.width, pngJpgCanvas.height);
        pngCtx.drawImage(loadedPngImage, 0, 0);

        const jpgDataUrl = pngJpgCanvas.toDataURL('image/jpeg', 0.95);
        downloadJpgBtn.href = jpgDataUrl;
        
        const fileName = (currentPngFile ? currentPngFile.name.replace(/\.[^/.]+$/, "") : 'converted-image') + ".jpg";
        downloadJpgBtn.download = fileName;
    }

    // ==========================================
    // 6. JPG to PDF Tool Engine
    // ==========================================
    const jpgDropZone = document.getElementById('jpg-to-pdf-drop-zone');
    const jpgFileInput = document.getElementById('jpg-to-pdf-file-input');
    const jpgWorkspace = document.getElementById('jpg-to-pdf-workspace');
    const jpgFileList = document.getElementById('jpg-file-list');
    const jpgFileCount = document.getElementById('jpg-file-count');
    const addMoreJpgBtn = document.getElementById('add-more-jpg-btn');
    const resetJpgBtn = document.getElementById('reset-jpg-btn');
    const executeJpgToPdfBtn = document.getElementById('execute-jpg-to-pdf-btn');
    const jpgDownloadBox = document.getElementById('jpg-download-box');
    const downloadConvertedPdfBtn = document.getElementById('download-converted-pdf-btn');

    let jpgFiles = [];

    if (jpgDropZone && jpgFileInput) {
        jpgDropZone.addEventListener('click', () => jpgFileInput.click());

        jpgDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            jpgDropZone.classList.add('drag-over');
        });

        jpgDropZone.addEventListener('dragleave', () => jpgDropZone.classList.remove('drag-over'));

        jpgDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            jpgDropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleJpgFiles(Array.from(e.dataTransfer.files));
        });

        jpgFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleJpgFiles(Array.from(e.target.files));
        });

        addMoreJpgBtn.addEventListener('click', () => jpgFileInput.click());

        resetJpgBtn.addEventListener('click', () => {
            jpgFiles = [];
            jpgFileInput.value = '';
            jpgWorkspace.classList.add('d-none');
            jpgDownloadBox.classList.add('d-none');
            jpgDropZone.classList.remove('d-none');
        });

        executeJpgToPdfBtn.addEventListener('click', convertJpgToPdf);
    }

    function handleJpgFiles(files) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const validImages = files.filter(f => validTypes.includes(f.type) || /\.(jpg|jpeg|png)$/i.test(f.name));
        
        if (validImages.length === 0) return;

        jpgFiles = [...jpgFiles, ...validImages].slice(0, 50);
        renderJpgList();

        jpgDropZone.classList.add('d-none');
        jpgWorkspace.classList.remove('d-none');
        jpgDownloadBox.classList.add('d-none');
    }

    function renderJpgList() {
        jpgFileList.innerHTML = '';
        jpgFileCount.innerText = jpgFiles.length;

        jpgFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'pdf-item-card';

            const previewUrl = URL.createObjectURL(file);

            item.innerHTML = `
                <div class="d-flex align-items-center gap-2 overflow-hidden">
                    <img src="${previewUrl}" class="rounded" style="width: 36px; height: 36px; object-fit: cover;">
                    <div class="text-truncate">
                        <div class="text-white fw-bold fs-8 text-truncate">${file.name}</div>
                        <span class="text-secondary-custom fs-8">${(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-1">
                    <button class="btn btn-sm btn-glass px-2 py-0 fs-8" onclick="moveJpg(${index}, -1)" ${index === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
                    <button class="btn btn-sm btn-glass px-2 py-0 fs-8" onclick="moveJpg(${index}, 1)" ${index === jpgFiles.length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
                    <button class="btn btn-sm btn-outline-danger px-2 py-0 fs-8 ms-1" onclick="removeJpg(${index})"><i class="bi bi-trash"></i></button>
                </div>
            `;

            jpgFileList.appendChild(item);
        });
    }

    window.moveJpg = function(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= jpgFiles.length) return;
        const temp = jpgFiles[index];
        jpgFiles[index] = jpgFiles[newIndex];
        jpgFiles[newIndex] = temp;
        renderJpgList();
    };

    window.removeJpg = function(index) {
        jpgFiles.splice(index, 1);
        if (jpgFiles.length === 0) {
            jpgWorkspace.classList.add('d-none');
            jpgDropZone.classList.remove('d-none');
        } else {
            renderJpgList();
        }
    };

    async function convertJpgToPdf() {
        if (jpgFiles.length < 1) return;

        executeJpgToPdfBtn.disabled = true;
        executeJpgToPdfBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Converting...`;

        try {
            const { PDFDocument } = PDFLib;
            const pdfDoc = await PDFDocument.create();

            for (const file of jpgFiles) {
                const arrayBuffer = await file.arrayBuffer();
                let image;

                if (file.type === 'image/png' || file.name.endsWith('.png')) {
                    image = await pdfDoc.embedPng(arrayBuffer);
                } else {
                    image = await pdfDoc.embedJpg(arrayBuffer);
                }

                const page = pdfDoc.addPage([image.width, image.height]);
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: image.width,
                    height: image.height,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);

            downloadConvertedPdfBtn.href = blobUrl;
            jpgDownloadBox.classList.remove('d-none');
        } catch (error) {
            alert("Error converting images to PDF: " + error.message);
        } finally {
            executeJpgToPdfBtn.disabled = false;
            executeJpgToPdfBtn.innerHTML = `<i class="bi bi-filetype-pdf me-1"></i> Convert to PDF`;
        }
    }

    // ==========================================
    // 7. MHTML / MHT to PDF Converter Engine
    // ==========================================
    const mhtmlDropZone = document.getElementById('mhtml-drop-zone');
    const mhtmlFileInput = document.getElementById('mhtml-file-input');
    const mhtmlWorkspace = document.getElementById('mhtml-workspace');
    const mhtmlFilename = document.getElementById('mhtml-filename');
    const mhtmlFilesize = document.getElementById('mhtml-filesize');
    const mhtmlPreviewFrame = document.getElementById('mhtml-preview-frame');
    const resetMhtmlBtn = document.getElementById('reset-mhtml-btn');
    const printMhtmlBtn = document.getElementById('print-mhtml-btn');

    if (mhtmlDropZone && mhtmlFileInput) {
        mhtmlDropZone.addEventListener('click', () => mhtmlFileInput.click());

        mhtmlDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            mhtmlDropZone.classList.add('drag-over');
        });

        mhtmlDropZone.addEventListener('dragleave', () => mhtmlDropZone.classList.remove('drag-over'));

        mhtmlDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            mhtmlDropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleMhtmlFile(e.dataTransfer.files[0]);
        });

        mhtmlFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handleMhtmlFile(e.target.files[0]);
        });

        if (resetMhtmlBtn) {
            resetMhtmlBtn.addEventListener('click', () => {
                mhtmlFileInput.value = '';
                mhtmlPreviewFrame.srcdoc = '';
                mhtmlWorkspace.classList.add('d-none');
                mhtmlDropZone.classList.remove('d-none');
            });
        }

        if (printMhtmlBtn) {
            printMhtmlBtn.addEventListener('click', () => {
                if (mhtmlPreviewFrame.contentWindow) {
                    mhtmlPreviewFrame.contentWindow.focus();
                    mhtmlPreviewFrame.contentWindow.print();
                }
            });
        }
    }

    function handleMhtmlFile(file) {
        mhtmlFilename.innerText = file.name;
        mhtmlFilesize.innerText = formatBytes(file.size);

        const reader = new FileReader();
        reader.onload = (e) => {
            const rawContent = e.target.result;
            const parsedHtml = parseMhtmlToHtml(rawContent);
            
            mhtmlPreviewFrame.srcdoc = parsedHtml;
            mhtmlDropZone.classList.add('d-none');
            mhtmlWorkspace.classList.remove('d-none');
        };
        reader.readAsText(file);
    }

    function parseMhtmlToHtml(mhtmlText) {
        const parts = mhtmlText.split(/------=_NextPart_[^\r\n]+|--[a-zA-Z0-9_=\-\.]+/);
        let htmlContent = '';
        const resources = {};

        parts.forEach(part => {
            if (part.includes('Content-Type: text/html')) {
                const bodyMatch = part.split(/\r?\n\r?\n/);
                if (bodyMatch.length > 1) {
                    htmlContent = bodyMatch.slice(1).join('\n\n');
                    if (part.includes('Content-Transfer-Encoding: base64')) {
                        try { htmlContent = atob(htmlContent.replace(/\s/g, '')); } catch(e){}
                    } else if (part.includes('Content-Transfer-Encoding: quoted-printable')) {
                        htmlContent = decodeQuotedPrintable(htmlContent);
                    }
                }
            } else if (part.includes('Content-Type: image/')) {
                const locationMatch = part.match(/Content-Location:\s*([^\r\n]+)/i);
                const typeMatch = part.match(/Content-Type:\s*([^\r\n;]+)/i);
                if (locationMatch && typeMatch) {
                    const url = locationMatch[1].trim();
                    const mime = typeMatch[1].trim();
                    const bodyParts = part.split(/\r?\n\r?\n/);
                    if (bodyParts.length > 1) {
                        const base64Data = bodyParts.slice(1).join('').replace(/\s/g, '');
                        resources[url] = `data:${mime};base64,${base64Data}`;
                    }
                }
            }
        });

        if (!htmlContent) {
            return `<div style="font-family:sans-serif;padding:20px;text-align:center;">
                        <h3>Reconstructed Preview</h3>
                        <p>Loaded MHTML document archive directly in your browser.</p>
                    </div>` + mhtmlText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        Object.keys(resources).forEach(resUrl => {
            const escapedUrl = resUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            htmlContent = htmlContent.replace(new RegExp(escapedUrl, 'g'), resources[resUrl]);
        });

        return htmlContent;
    }

    function decodeQuotedPrintable(str) {
        return str
            .replace(/=\r?\n/g, '')
            .replace(/=([0-9A-F]{2})/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
    }

    // ==========================================
    // 8. PDF Merge Tool Engine
    // ==========================================
    const pdfDropZone = document.getElementById('pdf-merge-drop-zone');
    const pdfFileInput = document.getElementById('pdf-merge-file-input');
    const pdfWorkspace = document.getElementById('pdf-merge-workspace');
    const pdfFileList = document.getElementById('pdf-file-list');
    const pdfFileCount = document.getElementById('pdf-file-count');
    const addMorePdfBtn = document.getElementById('add-more-pdf-btn');
    const resetPdfBtn = document.getElementById('reset-pdf-btn');
    const executePdfMergeBtn = document.getElementById('execute-pdf-merge-btn');
    const pdfDownloadBox = document.getElementById('pdf-download-box');
    const downloadMergedPdfBtn = document.getElementById('download-merged-pdf-btn');

    let pdfFiles = [];

    if (pdfDropZone && pdfFileInput) {
        pdfDropZone.addEventListener('click', () => pdfFileInput.click());

        pdfDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            pdfDropZone.classList.add('drag-over');
        });

        pdfDropZone.addEventListener('dragleave', () => pdfDropZone.classList.remove('drag-over'));

        pdfDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            pdfDropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handlePdfFiles(Array.from(e.dataTransfer.files));
        });

        pdfFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) handlePdfFiles(Array.from(e.target.files));
        });

        addMorePdfBtn.addEventListener('click', () => pdfFileInput.click());

        resetPdfBtn.addEventListener('click', () => {
            pdfFiles = [];
            pdfFileInput.value = '';
            pdfWorkspace.classList.add('d-none');
            pdfDownloadBox.classList.add('d-none');
            pdfDropZone.classList.remove('d-none');
        });

        executePdfMergeBtn.addEventListener('click', mergePdfFiles);
    }

    function handlePdfFiles(files) {
        const validPdfs = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
        if (validPdfs.length === 0) return;

        pdfFiles = [...pdfFiles, ...validPdfs].slice(0, 10);
        renderPdfList();

        pdfDropZone.classList.add('d-none');
        pdfWorkspace.classList.remove('d-none');
        pdfDownloadBox.classList.add('d-none');
    }

    function renderPdfList() {
        pdfFileList.innerHTML = '';
        pdfFileCount.innerText = pdfFiles.length;

        pdfFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'pdf-item-card';

            item.innerHTML = `
                <div class="d-flex align-items-center gap-2 overflow-hidden">
                    <i class="bi bi-file-earmark-pdf text-danger fs-5"></i>
                    <div class="text-truncate">
                        <div class="text-white fw-bold fs-8 text-truncate">${file.name}</div>
                        <span class="text-secondary-custom fs-8">${(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-1">
                    <button class="btn btn-sm btn-glass px-2 py-0 fs-8" onclick="movePdf(${index}, -1)" ${index === 0 ? 'disabled' : ''}><i class="bi bi-arrow-up"></i></button>
                    <button class="btn btn-sm btn-glass px-2 py-0 fs-8" onclick="movePdf(${index}, 1)" ${index === pdfFiles.length - 1 ? 'disabled' : ''}><i class="bi bi-arrow-down"></i></button>
                    <button class="btn btn-sm btn-outline-danger px-2 py-0 fs-8 ms-1" onclick="removePdf(${index})"><i class="bi bi-trash"></i></button>
                </div>
            `;

            pdfFileList.appendChild(item);
        });
    }

    window.movePdf = function(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= pdfFiles.length) return;
        const temp = pdfFiles[index];
        pdfFiles[index] = pdfFiles[newIndex];
        pdfFiles[newIndex] = temp;
        renderPdfList();
    };

    window.removePdf = function(index) {
        pdfFiles.splice(index, 1);
        if (pdfFiles.length === 0) {
            pdfWorkspace.classList.add('d-none');
            pdfDropZone.classList.remove('d-none');
        } else {
            renderPdfList();
        }
    };

    async function mergePdfFiles() {
        if (pdfFiles.length < 1) return;

        executePdfMergeBtn.disabled = true;
        executePdfMergeBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Merging...`;

        try {
            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();

            for (const file of pdfFiles) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);

            downloadMergedPdfBtn.href = blobUrl;
            pdfDownloadBox.classList.remove('d-none');
        } catch (error) {
            alert("Error merging PDFs: " + error.message);
        } finally {
            executePdfMergeBtn.disabled = false;
            executePdfMergeBtn.innerHTML = `<i class="bi bi-intersect me-1"></i> Merge & Download PDF`;
        }
    }

    // ==========================================
    // 12. Text & Lists Tools: Text to Binary
    // ==========================================
    const rawTextInput = document.getElementById('raw-text-input');
    const binaryOutputText = document.getElementById('binary-output-text');
    const resetBinaryBtn = document.getElementById('reset-binary-btn');
    const copyBinaryBtn = document.getElementById('copy-binary-btn');

    if (rawTextInput && binaryOutputText) {
        rawTextInput.addEventListener('input', () => {
            const text = rawTextInput.value;
            binaryOutputText.value = text.split('')
                .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
                .join(' ');
        });

        if (resetBinaryBtn) {
            resetBinaryBtn.addEventListener('click', () => {
                rawTextInput.value = '';
                binaryOutputText.value = '';
            });
        }

        if (copyBinaryBtn) {
            copyBinaryBtn.addEventListener('click', () => {
                if (!binaryOutputText.value) return;
                binaryOutputText.select();
                navigator.clipboard.writeText(binaryOutputText.value).then(() => {
                    const origHtml = copyBinaryBtn.innerHTML;
                    copyBinaryBtn.innerHTML = `<i class="bi bi-check2 me-1"></i>Copied!`;
                    setTimeout(() => copyBinaryBtn.innerHTML = origHtml, 2000);
                });
            });
        }
    }

   // ==========================================
// 13. Text & Lists Tools: IP to Binary
// ==========================================
const ipInputText = document.getElementById('ip-input-text');
const ipOutputText = document.getElementById('ip-output-text');
const convertIpBtn = document.getElementById('convert-ip-btn');
const copyIpBtn = document.getElementById('copy-ip-btn');
const resetIpBtn = document.getElementById('reset-ip-btn');

if (convertIpBtn && ipInputText && ipOutputText) {
    convertIpBtn.addEventListener('click', () => {
        const rawInput = ipInputText.value;
        if (!rawInput.trim()) {
            ipOutputText.value = '';
            return;
        }

        const ips = rawInput.split('\n');
        const converted = ips.map(ip => {
            const trimmedIp = ip.trim();
            if (!trimmedIp) return ''; // Preserve empty lines smoothly

            const parts = trimmedIp.split('.');
            
            // Regex validation ensures exactly 4 octets containing 1-3 digits only (0-255)
            const isValid = parts.length === 4 && parts.every(p => {
                if (!/^\d{1,3}$/.test(p)) return false;
                const num = Number(p);
                return num >= 0 && num <= 255;
            });

            if (isValid) {
                return parts.map(p => Number(p).toString(2).padStart(8, '0')).join('.');
            }
            return 'Invalid IP Format';
        });

        ipOutputText.value = converted.join('\n');
    });

    if (resetIpBtn) {
        resetIpBtn.addEventListener('click', () => {
            ipInputText.value = '';
            ipOutputText.value = '';
        });
    }

    if (copyIpBtn) {
        copyIpBtn.addEventListener('click', () => {
            if (!ipOutputText.value) return;
            
            navigator.clipboard.writeText(ipOutputText.value).then(() => {
                const origHtml = copyIpBtn.innerHTML;
                copyIpBtn.innerHTML = `<i class="bi bi-check2 me-1"></i>Copied!`;
                setTimeout(() => copyIpBtn.innerHTML = origHtml, 2000);
            }).catch(() => {
                // Fallback for restricted clipboard contexts
                ipOutputText.select();
                document.execCommand('copy');
            });
        });
    }
}

});