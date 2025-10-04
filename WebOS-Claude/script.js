// Window Management System
class WindowManager {
    constructor() {
        this.windows = [];
        this.zIndexCounter = 100;
        this.activeWindow = null;
        this.init();
    }

    init() {
        // Desktop icon clicks
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', (e) => {
                const appName = e.currentTarget.dataset.app;
                this.openApp(appName);
            });
        });

        // Start menu
        document.getElementById('start-button').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleStartMenu();
        });

        document.querySelectorAll('.start-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const appName = e.currentTarget.dataset.app;
                this.openApp(appName);
                this.hideStartMenu();
            });
        });

        // Close start menu when clicking outside
        document.addEventListener('click', () => {
            this.hideStartMenu();
        });

        // Update clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    toggleStartMenu() {
        const menu = document.getElementById('start-menu');
        menu.classList.toggle('hidden');
    }

    hideStartMenu() {
        document.getElementById('start-menu').classList.add('hidden');
    }

    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('taskbar-time').textContent = timeString;
    }

    openApp(appName) {
        // Check if app is already open
        const existingWindow = this.windows.find(w => w.appName === appName);
        if (existingWindow) {
            this.focusWindow(existingWindow.element);
            return;
        }

        const windowId = `window-${Date.now()}`;
        const apps = {
            files: { title: '📁 Files', content: this.getFilesContent() },
            terminal: { title: '⌨️ Terminal', content: this.getTerminalContent() },
            notepad: { title: '📝 Notepad', content: this.getNotepadContent() },
            calculator: { title: '🔢 Calculator', content: this.getCalculatorContent() },
            about: { title: 'ℹ️ About WebOS', content: this.getAboutContent() }
        };

        const app = apps[appName];
        if (!app) return;

        const windowElement = this.createWindow(windowId, app.title, app.content, appName);

        const windowObj = {
            id: windowId,
            element: windowElement,
            appName: appName,
            title: app.title,
            isMaximized: false
        };

        this.windows.push(windowObj);
        this.setupWindowInteractions(windowObj);
        this.createTaskbarItem(windowObj);
        this.focusWindow(windowElement);

        // Initialize app-specific functionality
        this.initializeApp(appName, windowId);
    }

    createWindow(id, title, content, appName) {
        const container = document.getElementById('windows-container');
        const windowEl = document.createElement('div');
        windowEl.className = 'window';
        windowEl.id = id;

        // Random initial position
        const x = 50 + Math.random() * 200;
        const y = 50 + Math.random() * 100;

        windowEl.style.left = `${x}px`;
        windowEl.style.top = `${y}px`;
        windowEl.style.width = '600px';
        windowEl.style.height = '400px';

        windowEl.innerHTML = `
            <div class="window-titlebar">
                <div class="window-title">${title}</div>
                <div class="window-controls">
                    <div class="window-control minimize"></div>
                    <div class="window-control maximize"></div>
                    <div class="window-control close"></div>
                </div>
            </div>
            <div class="window-content">${content}</div>
            <div class="window-resize-handle"></div>
        `;

        container.appendChild(windowEl);
        return windowEl;
    }

    setupWindowInteractions(windowObj) {
        const windowEl = windowObj.element;
        const titlebar = windowEl.querySelector('.window-titlebar');

        // Window dragging
        let isDragging = false;
        let currentX, currentY, initialX, initialY;

        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            if (windowObj.isMaximized) return;

            isDragging = true;
            initialX = e.clientX - windowEl.offsetLeft;
            initialY = e.clientY - windowEl.offsetTop;
            this.focusWindow(windowEl);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            windowEl.style.left = `${currentX}px`;
            windowEl.style.top = `${currentY}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Window resizing
        const resizeHandle = windowEl.querySelector('.window-resize-handle');
        let isResizing = false;

        resizeHandle.addEventListener('mousedown', (e) => {
            if (windowObj.isMaximized) return;
            isResizing = true;
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const width = e.clientX - windowEl.offsetLeft;
            const height = e.clientY - windowEl.offsetTop;

            if (width > 400) windowEl.style.width = `${width}px`;
            if (height > 300) windowEl.style.height = `${height}px`;
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });

        // Window controls
        windowEl.querySelector('.window-control.close').addEventListener('click', () => {
            this.closeWindow(windowObj);
        });

        windowEl.querySelector('.window-control.minimize').addEventListener('click', () => {
            windowEl.style.display = 'none';
            this.updateTaskbarItem(windowObj.id, false);
        });

        windowEl.querySelector('.window-control.maximize').addEventListener('click', () => {
            this.toggleMaximize(windowObj);
        });

        // Focus on click
        windowEl.addEventListener('mousedown', () => {
            this.focusWindow(windowEl);
        });
    }

    focusWindow(windowEl) {
        this.zIndexCounter++;
        windowEl.style.zIndex = this.zIndexCounter;
        this.activeWindow = windowEl.id;

        // Update taskbar
        document.querySelectorAll('.taskbar-app').forEach(app => {
            app.classList.remove('active');
        });
        const taskbarItem = document.querySelector(`[data-window-id="${windowEl.id}"]`);
        if (taskbarItem) {
            taskbarItem.classList.add('active');
        }
    }

    toggleMaximize(windowObj) {
        windowObj.isMaximized = !windowObj.isMaximized;
        windowObj.element.classList.toggle('maximized');
    }

    closeWindow(windowObj) {
        windowObj.element.remove();
        this.windows = this.windows.filter(w => w.id !== windowObj.id);

        const taskbarItem = document.querySelector(`[data-window-id="${windowObj.id}"]`);
        if (taskbarItem) taskbarItem.remove();
    }

    createTaskbarItem(windowObj) {
        const taskbarApps = document.getElementById('taskbar-apps');
        const item = document.createElement('div');
        item.className = 'taskbar-app';
        item.dataset.windowId = windowObj.id;
        item.textContent = windowObj.title;

        item.addEventListener('click', () => {
            if (windowObj.element.style.display === 'none') {
                windowObj.element.style.display = 'flex';
                this.focusWindow(windowObj.element);
            } else if (this.activeWindow === windowObj.id) {
                windowObj.element.style.display = 'none';
            } else {
                this.focusWindow(windowObj.element);
            }
            this.updateTaskbarItem(windowObj.id, windowObj.element.style.display !== 'none');
        });

        taskbarApps.appendChild(item);
    }

    updateTaskbarItem(windowId, isActive) {
        const item = document.querySelector(`[data-window-id="${windowId}"]`);
        if (item) {
            item.classList.toggle('active', isActive);
        }
    }

    // App Content Generators
    getFilesContent() {
        return `
            <h3>My Files</h3>
            <ul class="file-list">
                <li class="file-item">📁 Documents</li>
                <li class="file-item">📁 Pictures</li>
                <li class="file-item">📁 Downloads</li>
                <li class="file-item">📁 Music</li>
                <li class="file-item">📁 Videos</li>
                <li class="file-item">📄 readme.txt</li>
                <li class="file-item">📄 notes.md</li>
            </ul>
        `;
    }

    getTerminalContent() {
        return `
            <div id="terminal-output">WebOS Terminal v1.0
Type 'help' for available commands

$ </div>
            <input type="text" id="terminal-input" placeholder="Enter command..." />
        `;
    }

    getNotepadContent() {
        return `<textarea id="notepad-textarea" placeholder="Start typing..."></textarea>`;
    }

    getCalculatorContent() {
        return `
            <div class="calculator">
                <div class="calculator-display" id="calc-display">0</div>
                <button class="calc-btn clear">C</button>
                <button class="calc-btn operator">/</button>
                <button class="calc-btn operator">*</button>
                <button class="calc-btn operator">-</button>
                <button class="calc-btn">7</button>
                <button class="calc-btn">8</button>
                <button class="calc-btn">9</button>
                <button class="calc-btn operator">+</button>
                <button class="calc-btn">4</button>
                <button class="calc-btn">5</button>
                <button class="calc-btn">6</button>
                <button class="calc-btn operator">%</button>
                <button class="calc-btn">1</button>
                <button class="calc-btn">2</button>
                <button class="calc-btn">3</button>
                <button class="calc-btn">.</button>
                <button class="calc-btn">0</button>
                <button class="calc-btn equals">=</button>
            </div>
        `;
    }

    getAboutContent() {
        return `
            <div class="about-content">
                <h2>WebOS</h2>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Built with:</strong> HTML, CSS, and JavaScript</p>
                <p>A fully functional web-based operating system simulation featuring:</p>
                <ul>
                    <li>Draggable and resizable windows</li>
                    <li>Multiple applications</li>
                    <li>Start menu and taskbar</li>
                    <li>Window management system</li>
                </ul>
                <p style="margin-top: 20px; color: #999; font-size: 12px;">
                    Built with Claude Code
                </p>
            </div>
        `;
    }

    // App Initializers
    initializeApp(appName, windowId) {
        switch(appName) {
            case 'terminal':
                this.initTerminal(windowId);
                break;
            case 'calculator':
                this.initCalculator(windowId);
                break;
        }
    }

    initTerminal(windowId) {
        const window = document.getElementById(windowId);
        const input = window.querySelector('#terminal-input');
        const output = window.querySelector('#terminal-output');

        const commands = {
            help: 'Available commands: help, clear, date, echo, whoami, ls',
            clear: () => {
                output.textContent = 'WebOS Terminal v1.0\nType \'help\' for available commands\n\n$ ';
                return '';
            },
            date: () => new Date().toString(),
            whoami: 'webos-user',
            ls: 'Documents  Pictures  Downloads  Music  Videos  readme.txt  notes.md'
        };

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                output.textContent += command + '\n';

                if (command === 'clear') {
                    commands.clear();
                } else if (command.startsWith('echo ')) {
                    output.textContent += command.substring(5) + '\n';
                } else if (commands[command]) {
                    const result = typeof commands[command] === 'function'
                        ? commands[command]()
                        : commands[command];
                    if (result) output.textContent += result + '\n';
                } else if (command) {
                    output.textContent += `Command not found: ${command}\n`;
                }

                output.textContent += '$ ';
                input.value = '';
                output.scrollTop = output.scrollHeight;
            }
        });

        input.focus();
    }

    initCalculator(windowId) {
        const window = document.getElementById(windowId);
        const display = window.querySelector('#calc-display');
        const buttons = window.querySelectorAll('.calc-btn');

        let currentValue = '0';
        let previousValue = null;
        let operation = null;
        let shouldResetDisplay = false;

        const updateDisplay = () => {
            display.textContent = currentValue;
        };

        const calculate = () => {
            const prev = parseFloat(previousValue);
            const current = parseFloat(currentValue);

            switch(operation) {
                case '+': return prev + current;
                case '-': return prev - current;
                case '*': return prev * current;
                case '/': return prev / current;
                case '%': return prev % current;
                default: return current;
            }
        };

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.textContent;

                if (button.classList.contains('clear')) {
                    currentValue = '0';
                    previousValue = null;
                    operation = null;
                    shouldResetDisplay = false;
                } else if (button.classList.contains('equals')) {
                    if (operation && previousValue !== null) {
                        currentValue = calculate().toString();
                        previousValue = null;
                        operation = null;
                        shouldResetDisplay = true;
                    }
                } else if (button.classList.contains('operator')) {
                    if (operation && previousValue !== null && !shouldResetDisplay) {
                        currentValue = calculate().toString();
                    }
                    previousValue = currentValue;
                    operation = value;
                    shouldResetDisplay = true;
                } else {
                    if (currentValue === '0' || shouldResetDisplay) {
                        currentValue = value;
                        shouldResetDisplay = false;
                    } else {
                        currentValue += value;
                    }
                }

                updateDisplay();
            });
        });
    }
}

// Initialize the OS
document.addEventListener('DOMContentLoaded', () => {
    new WindowManager();
});
