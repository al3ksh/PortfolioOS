/**
 * Paint App - Simple drawing application
 */

import { Icons } from '../icons.js';
import { SoundManager } from '../managers/SoundManager.js';

export const PaintApp = {
    id: 'paint',
    title: 'Paint',
    icon: Icons.paint,
    width: 650,
    height: 500,
    hasMenu: true,
    menuItems: ['File', 'Edit', 'View', 'Image', 'Help'],
    resizable: true,
    minWidth: 500,
    minHeight: 400,

    currentTool: 'brush',
    currentColor: '#000000',
    brushSize: 3,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    
    // Undo/Redo history
    undoHistory: [],
    redoHistory: [],
    maxHistorySize: 30,

    menuConfig: {
        'File': [
            { label: 'New', action: 'new', shortcut: 'Ctrl+N' },
            { label: 'Open...', action: 'open', shortcut: 'Ctrl+O', disabled: true },
            { label: 'Save', action: 'save', shortcut: 'Ctrl+S' },
            { label: 'Save As PNG...', action: 'saveAs' },
            { divider: true },
            { label: 'Exit', action: 'close', shortcut: 'Alt+F4' }
        ],
        'Edit': [
            { label: 'Undo', action: 'undo', shortcut: 'Ctrl+Z' },
            { label: 'Redo', action: 'redo', shortcut: 'Ctrl+Y' },
            { divider: true },
            { label: 'Clear Canvas', action: 'clearCanvas' },
            { divider: true },
            { label: 'Select All', action: 'selectAll', shortcut: 'Ctrl+A', disabled: true }
        ],
        'View': [
            { label: 'Toolbar', action: 'toggleToolbar', checked: true },
            { label: 'Color Palette', action: 'toggleColors', checked: true },
            { label: 'Status Bar', action: 'toggleStatus', checked: true },
            { divider: true },
            { label: 'Zoom In', action: 'zoomIn', shortcut: 'Ctrl++', disabled: true },
            { label: 'Zoom Out', action: 'zoomOut', shortcut: 'Ctrl+-', disabled: true }
        ],
        'Image': [
            { label: 'Flip Horizontal', action: 'flipH' },
            { label: 'Flip Vertical', action: 'flipV' },
            { label: 'Rotate 90°', action: 'rotate90' },
            { divider: true },
            { label: 'Resize...', action: 'resize', disabled: true },
            { label: 'Canvas Size...', action: 'canvasSize', disabled: true }
        ],
        'Help': [
            { label: 'Help Topics', action: 'helpTopics', shortcut: 'F1' },
            { divider: true },
            { label: 'About Paint', action: 'about' }
        ]
    },

    onMenuAction(action) {
        const windowEl = document.querySelector('#window-paint');
        const canvas = windowEl?.querySelector('#paintCanvas');
        const ctx = canvas?.getContext('2d');

        switch(action) {
            case 'new':
                if (!canvas || !ctx) return;
                import('../managers/DialogManager.js').then(async ({ DialogManager }) => {
                    const confirmed = await DialogManager.confirm('Create new canvas? Current work will be lost.', 'New Canvas');
                    if (confirmed) {
                        PaintApp.saveToHistory(canvas);
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                });
                break;
            case 'save':
            case 'saveAs':
                if (!canvas) return;
                const link = document.createElement('a');
                link.download = 'painting.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                SoundManager.play('chord');
                break;
            case 'undo':
                PaintApp.undo(canvas, ctx);
                break;
            case 'redo':
                PaintApp.redo(canvas, ctx);
                break;
            case 'clearCanvas':
                if (!canvas || !ctx) return;
                import('../managers/DialogManager.js').then(async ({ DialogManager }) => {
                    const confirmed = await DialogManager.confirm('Clear the entire canvas?', 'Clear Canvas');
                    if (confirmed) {
                        PaintApp.saveToHistory(canvas);
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                });
                break;
            case 'toggleToolbar':
                PaintApp.toggleElement(windowEl, '.paint-toolbar', 'toggleToolbar');
                break;
            case 'toggleColors':
                PaintApp.toggleElement(windowEl, '.paint-colors', 'toggleColors');
                break;
            case 'toggleStatus':
                PaintApp.toggleElement(windowEl, '.paint-statusbar', 'toggleStatus');
                break;
            // Image menu actions
            case 'flipH':
                if (!canvas || !ctx) return;
                PaintApp.saveToHistory(canvas);
                PaintApp.flipCanvas(canvas, ctx, 'horizontal');
                break;
            case 'flipV':
                if (!canvas || !ctx) return;
                PaintApp.saveToHistory(canvas);
                PaintApp.flipCanvas(canvas, ctx, 'vertical');
                break;
            case 'rotate90':
                if (!canvas || !ctx) return;
                PaintApp.saveToHistory(canvas);
                PaintApp.rotateCanvas(canvas, ctx, 90);
                break;
        }
    },

    flipCanvas(canvas, ctx, direction) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (direction === 'horizontal') {
            ctx.scale(-1, 1);
            ctx.drawImage(tempCanvas, -canvas.width, 0);
        } else {
            ctx.scale(1, -1);
            ctx.drawImage(tempCanvas, 0, -canvas.height);
        }
        ctx.restore();
        SoundManager.play('click');
    },

    rotateCanvas(canvas, ctx, degrees) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        
        // For 90 degree rotation, swap dimensions
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        canvas.width = oldHeight;
        canvas.height = oldWidth;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(degrees * Math.PI / 180);
        ctx.drawImage(tempCanvas, -oldWidth / 2, -oldHeight / 2);
        ctx.restore();
        
        // Update size display
        const sizeDisplay = document.querySelector('#canvasSize');
        if (sizeDisplay) sizeDisplay.textContent = `${canvas.width} x ${canvas.height}`;
        
        SoundManager.play('click');
    },

    // Undo/Redo methods
    saveToHistory(canvas) {
        if (!canvas) return;
        // Save current state before changes
        PaintApp.undoHistory.push(canvas.toDataURL());
        // Clear redo history on new action
        PaintApp.redoHistory = [];
        // Limit history size
        if (PaintApp.undoHistory.length > PaintApp.maxHistorySize) {
            PaintApp.undoHistory.shift();
        }
    },

    undo(canvas, ctx) {
        if (!canvas || !ctx || PaintApp.undoHistory.length === 0) {
            SoundManager.play('error');
            return;
        }
        
        // Save current state to redo
        PaintApp.redoHistory.push(canvas.toDataURL());
        
        // Restore previous state
        const imageData = PaintApp.undoHistory.pop();
        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = imageData;
        SoundManager.play('click');
    },

    redo(canvas, ctx) {
        if (!canvas || !ctx || PaintApp.redoHistory.length === 0) {
            SoundManager.play('error');
            return;
        }
        
        // Save current state to undo
        PaintApp.undoHistory.push(canvas.toDataURL());
        
        // Restore next state
        const imageData = PaintApp.redoHistory.pop();
        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = imageData;
        SoundManager.play('click');
    },

    toggleElement(windowEl, selector, action) {
        const element = windowEl?.querySelector(selector);
        if (element) {
            element.classList.toggle('hidden');
            // Update menu checkmark
            import('../managers/WindowManager.js').then(({ WindowManager }) => {
                const windowInstance = WindowManager.getWindowInstance('paint');
                if (windowInstance) {
                    windowInstance.toggleMenuChecked('View', action);
                }
            });
        }
    },

    render() {
        return `
            <div class="paint-container">
                <div class="paint-toolbar">
                    <div class="tool-group">
                        <button class="paint-tool active" data-tool="brush" title="Brush">🖌️</button>
                        <button class="paint-tool" data-tool="pencil" title="Pencil">✏️</button>
                        <button class="paint-tool" data-tool="eraser" title="Eraser">🧽</button>
                        <button class="paint-tool" data-tool="fill" title="Fill">🪣</button>
                    </div>
                    <div class="tool-group">
                        <button class="paint-tool" data-tool="line" title="Line">📏</button>
                        <button class="paint-tool" data-tool="rect" title="Rectangle">⬜</button>
                        <button class="paint-tool" data-tool="circle" title="Circle">⭕</button>
                    </div>
                    <div class="tool-group">
                        <button class="paint-tool" data-tool="text" title="Text">🔤</button>
                        <button class="paint-tool" data-tool="eyedropper" title="Color Picker">💉</button>
                    </div>
                    <div class="tool-separator"></div>
                    <div class="brush-sizes">
                        <button class="size-btn ${PaintApp.brushSize === 1 ? 'active' : ''}" data-size="1">•</button>
                        <button class="size-btn ${PaintApp.brushSize === 3 ? 'active' : ''}" data-size="3">●</button>
                        <button class="size-btn ${PaintApp.brushSize === 5 ? 'active' : ''}" data-size="5">⬤</button>
                        <button class="size-btn ${PaintApp.brushSize === 10 ? 'active' : ''}" data-size="10">🔴</button>
                    </div>
                </div>

                <div class="paint-main">
                    <div class="paint-colors">
                        <div class="color-preview">
                            <div class="current-color" id="currentColor" style="background: ${PaintApp.currentColor}"></div>
                        </div>
                        <div class="color-palette" id="colorPalette">
                            <!-- Colors generated in JS -->
                        </div>
                    </div>

                    <div class="paint-canvas-wrapper">
                        <canvas id="paintCanvas" width="500" height="350"></canvas>
                    </div>
                </div>

                <div class="paint-statusbar">
                    <span id="cursorPos">0, 0</span>
                    <span id="canvasSize">500 x 350</span>
                    <button class="win-btn win-btn-sm" id="clearCanvas">🗑️ Clear</button>
                    <button class="win-btn win-btn-sm" id="saveCanvas">💾 Save</button>
                </div>
            </div>
        `;
    },

    onInit() {
        const container = document.querySelector('#window-paint');
        if (!container) return;

        const canvas = container.querySelector('#paintCanvas');
        const ctx = canvas.getContext('2d');
        
        // Store references
        PaintApp.canvas = canvas;
        PaintApp.ctx = ctx;

        // Fill with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Generate color palette
        PaintApp.generatePalette(container);

        // Tool selection
        container.querySelectorAll('.paint-tool').forEach(tool => {
            tool.addEventListener('click', () => {
                container.querySelectorAll('.paint-tool').forEach(t => t.classList.remove('active'));
                tool.classList.add('active');
                PaintApp.currentTool = tool.dataset.tool;
                SoundManager.play('click');
            });
        });

        // Brush size selection
        container.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                PaintApp.brushSize = parseInt(btn.dataset.size);
                SoundManager.play('click');
            });
        });

        // Canvas events
        canvas.addEventListener('mousedown', (e) => PaintApp.startDrawing(e));
        canvas.addEventListener('mousemove', (e) => PaintApp.draw(e, container));
        canvas.addEventListener('mouseup', () => PaintApp.stopDrawing());
        canvas.addEventListener('mouseout', () => PaintApp.stopDrawing());

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            PaintApp.startDrawing({
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top
            });
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            PaintApp.draw({
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top
            }, container);
        });
        
        canvas.addEventListener('touchend', () => PaintApp.stopDrawing());

        // Clear button
        container.querySelector('#clearCanvas')?.addEventListener('click', async () => {
            const { DialogManager } = await import('../managers/DialogManager.js');
            const confirmed = await DialogManager.confirm('Clear the canvas?', 'Clear Canvas');
            if (confirmed) {
                PaintApp.saveToHistory(canvas);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                SoundManager.play('click');
            }
        });

        // Save button
        container.querySelector('#saveCanvas')?.addEventListener('click', () => {
            PaintApp.saveImage();
        });

        // Update cursor position
        canvas.addEventListener('mousemove', (e) => {
            const posEl = container.querySelector('#cursorPos');
            if (posEl) {
                posEl.textContent = `${Math.round(e.offsetX)}, ${Math.round(e.offsetY)}`;
            }
        });
        
        // Keyboard shortcuts for Undo/Redo
        const handleKeyboard = (e) => {
            // Check if paint window is focused
            const paintWindow = document.querySelector('#window-paint');
            if (!paintWindow || !paintWindow.classList.contains('active')) return;
            
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                PaintApp.undo(canvas, ctx);
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                PaintApp.redo(canvas, ctx);
            }
        };
        
        document.addEventListener('keydown', handleKeyboard);
        
        // Store for cleanup
        PaintApp.keyboardHandler = handleKeyboard;
    },

    generatePalette(container) {
        const palette = container.querySelector('#colorPalette');
        if (!palette) return;

        const colors = [
            '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
            '#FFFFFF', '#C0C0C0', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF',
            '#FFC0CB', '#FFA500', '#A52A2A', '#90EE90', '#ADD8E6', '#DDA0DD', '#F0E68C', '#D2691E'
        ];

        colors.forEach(color => {
            const colorEl = document.createElement('div');
            colorEl.className = 'palette-color';
            colorEl.style.background = color;
            colorEl.dataset.color = color;
            
            colorEl.addEventListener('click', () => {
                PaintApp.currentColor = color;
                const preview = container.querySelector('#currentColor');
                if (preview) preview.style.background = color;
            });
            
            palette.appendChild(colorEl);
        });
    },

    startDrawing(e) {
        PaintApp.isDrawing = true;
        PaintApp.lastX = e.offsetX;
        PaintApp.lastY = e.offsetY;
        
        // Save to undo history before any drawing operation
        if (PaintApp.canvas) {
            PaintApp.saveToHistory(PaintApp.canvas);
        }

        // For fill tool, fill immediately
        if (PaintApp.currentTool === 'fill') {
            PaintApp.floodFill(e.offsetX, e.offsetY);
            PaintApp.isDrawing = false;
        }

        // For eyedropper, pick color
        if (PaintApp.currentTool === 'eyedropper') {
            PaintApp.pickColor(e.offsetX, e.offsetY);
            PaintApp.isDrawing = false;
            // Don't save to history for eyedropper
            PaintApp.undoHistory.pop();
        }

        // For text tool
        if (PaintApp.currentTool === 'text') {
            PaintApp.addText(e.offsetX, e.offsetY);
            PaintApp.isDrawing = false;
        }

        // For shapes, store start point
        if (['line', 'rect', 'circle'].includes(PaintApp.currentTool)) {
            PaintApp.startX = e.offsetX;
            PaintApp.startY = e.offsetY;
            // Save canvas state for preview
            PaintApp.savedImageData = PaintApp.ctx.getImageData(0, 0, PaintApp.canvas.width, PaintApp.canvas.height);
        }
    },

    draw(e, container) {
        if (!PaintApp.isDrawing) return;

        const ctx = PaintApp.ctx;
        const x = e.offsetX;
        const y = e.offsetY;

        ctx.strokeStyle = PaintApp.currentTool === 'eraser' ? '#FFFFFF' : PaintApp.currentColor;
        ctx.fillStyle = PaintApp.currentColor;
        ctx.lineWidth = PaintApp.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        switch (PaintApp.currentTool) {
            case 'brush':
            case 'pencil':
            case 'eraser':
                ctx.beginPath();
                ctx.moveTo(PaintApp.lastX, PaintApp.lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;

            case 'line':
                // Restore and redraw preview
                ctx.putImageData(PaintApp.savedImageData, 0, 0);
                ctx.beginPath();
                ctx.moveTo(PaintApp.startX, PaintApp.startY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;

            case 'rect':
                ctx.putImageData(PaintApp.savedImageData, 0, 0);
                const width = x - PaintApp.startX;
                const height = y - PaintApp.startY;
                ctx.strokeRect(PaintApp.startX, PaintApp.startY, width, height);
                break;

            case 'circle':
                ctx.putImageData(PaintApp.savedImageData, 0, 0);
                const radiusX = Math.abs(x - PaintApp.startX) / 2;
                const radiusY = Math.abs(y - PaintApp.startY) / 2;
                const centerX = PaintApp.startX + (x - PaintApp.startX) / 2;
                const centerY = PaintApp.startY + (y - PaintApp.startY) / 2;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }

        PaintApp.lastX = x;
        PaintApp.lastY = y;
    },

    stopDrawing() {
        PaintApp.isDrawing = false;
    },

    floodFill(startX, startY) {
        const canvas = PaintApp.canvas;
        const ctx = PaintApp.ctx;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        
        // Parse fill color
        const fillColor = PaintApp.hexToRgb(PaintApp.currentColor);
        
        // Don't fill if same color
        if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b) return;
        
        const pixelsToCheck = [[Math.floor(startX), Math.floor(startY)]];
        const width = canvas.width;
        const height = canvas.height;
        
        while (pixelsToCheck.length > 0) {
            const [x, y] = pixelsToCheck.pop();
            const pos = (y * width + x) * 4;
            
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            if (data[pos] !== startR || data[pos + 1] !== startG || data[pos + 2] !== startB) continue;
            
            data[pos] = fillColor.r;
            data[pos + 1] = fillColor.g;
            data[pos + 2] = fillColor.b;
            data[pos + 3] = 255;
            
            pixelsToCheck.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
        
        ctx.putImageData(imageData, 0, 0);
    },

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },

    saveImage() {
        const canvas = PaintApp.canvas;
        const link = document.createElement('a');
        link.download = 'painting.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        SoundManager.play('chord');
    },

    pickColor(x, y) {
        const ctx = PaintApp.ctx;
        const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('');
        PaintApp.currentColor = hex;
        
        // Update color preview
        const preview = document.querySelector('#window-paint #currentColor');
        if (preview) preview.style.background = hex;
        
        SoundManager.play('click');
    },

    async addText(x, y) {
        const { DialogManager } = await import('../managers/DialogManager.js');
        const text = await DialogManager.prompt('Enter text:', '', 'Add Text');
        if (!text) return;
        
        const ctx = PaintApp.ctx;
        ctx.fillStyle = PaintApp.currentColor;
        ctx.font = `${Math.max(12, PaintApp.brushSize * 4)}px Arial`;
        ctx.fillText(text, x, y);
        SoundManager.play('click');
    }
};

export default PaintApp;
