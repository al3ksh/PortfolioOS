/**
 * Calculator App - Classic Win 3.1 Calculator
 */

import { Icons } from '../icons.js';
import { SoundManager } from '../managers/SoundManager.js';

export const CalcApp = {
    id: 'calc',
    title: 'Calculator',
    icon: Icons.calc,
    width: 260,
    height: 320,
    hasMenu: false,
    resizable: false,

    display: '0',
    currentValue: null,
    pendingOperation: null,
    shouldResetDisplay: false,

    render() {
        return `
            <div class="calc-container">
                <div class="calc-display">
                    <input type="text" class="calc-screen" id="calcScreen" value="0" readonly>
                </div>
                <div class="calc-buttons">
                    <button class="calc-btn func" data-action="clear">C</button>
                    <button class="calc-btn func" data-action="ce">CE</button>
                    <button class="calc-btn func" data-action="backspace">←</button>
                    <button class="calc-btn op" data-action="divide">÷</button>
                    
                    <button class="calc-btn num" data-value="7">7</button>
                    <button class="calc-btn num" data-value="8">8</button>
                    <button class="calc-btn num" data-value="9">9</button>
                    <button class="calc-btn op" data-action="multiply">×</button>
                    
                    <button class="calc-btn num" data-value="4">4</button>
                    <button class="calc-btn num" data-value="5">5</button>
                    <button class="calc-btn num" data-value="6">6</button>
                    <button class="calc-btn op" data-action="subtract">−</button>
                    
                    <button class="calc-btn num" data-value="1">1</button>
                    <button class="calc-btn num" data-value="2">2</button>
                    <button class="calc-btn num" data-value="3">3</button>
                    <button class="calc-btn op" data-action="add">+</button>
                    
                    <button class="calc-btn num" data-action="negate">±</button>
                    <button class="calc-btn num" data-value="0">0</button>
                    <button class="calc-btn num" data-action="decimal">.</button>
                    <button class="calc-btn op equals" data-action="equals">=</button>
                </div>
            </div>
        `;
    },

    onInit() {
        const window = document.querySelector('#window-calc');
        if (!window) return;

        CalcApp.display = '0';
        CalcApp.currentValue = null;
        CalcApp.pendingOperation = null;
        CalcApp.shouldResetDisplay = false;

        const screen = window.querySelector('#calcScreen');
        const buttons = window.querySelectorAll('.calc-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                SoundManager.play('click');
                
                const value = btn.dataset.value;
                const action = btn.dataset.action;

                if (value !== undefined) {
                    CalcApp.inputDigit(value, screen);
                } else if (action) {
                    CalcApp.handleAction(action, screen);
                }
            });
        });

        // Keyboard support
        window.addEventListener('keydown', (e) => {
            const key = e.key;
            
            if (/[0-9]/.test(key)) {
                CalcApp.inputDigit(key, screen);
            } else if (key === '.') {
                CalcApp.handleAction('decimal', screen);
            } else if (key === '+') {
                CalcApp.handleAction('add', screen);
            } else if (key === '-') {
                CalcApp.handleAction('subtract', screen);
            } else if (key === '*') {
                CalcApp.handleAction('multiply', screen);
            } else if (key === '/') {
                e.preventDefault();
                CalcApp.handleAction('divide', screen);
            } else if (key === 'Enter' || key === '=') {
                CalcApp.handleAction('equals', screen);
            } else if (key === 'Escape') {
                CalcApp.handleAction('clear', screen);
            } else if (key === 'Backspace') {
                CalcApp.handleAction('backspace', screen);
            }
        });
    },

    inputDigit(digit, screen) {
        if (CalcApp.shouldResetDisplay) {
            CalcApp.display = digit;
            CalcApp.shouldResetDisplay = false;
        } else {
            CalcApp.display = CalcApp.display === '0' ? digit : CalcApp.display + digit;
        }
        
        // Limit display length
        if (CalcApp.display.length > 12) {
            CalcApp.display = CalcApp.display.slice(0, 12);
        }
        
        screen.value = CalcApp.display;
    },

    handleAction(action, screen) {
        switch (action) {
            case 'clear':
                CalcApp.display = '0';
                CalcApp.currentValue = null;
                CalcApp.pendingOperation = null;
                break;

            case 'ce':
                CalcApp.display = '0';
                break;

            case 'backspace':
                CalcApp.display = CalcApp.display.length > 1 
                    ? CalcApp.display.slice(0, -1) 
                    : '0';
                break;

            case 'decimal':
                if (!CalcApp.display.includes('.')) {
                    CalcApp.display += '.';
                }
                break;

            case 'negate':
                CalcApp.display = CalcApp.display.startsWith('-')
                    ? CalcApp.display.slice(1)
                    : '-' + CalcApp.display;
                break;

            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                CalcApp.handleOperation(action);
                break;

            case 'equals':
                CalcApp.calculate();
                CalcApp.pendingOperation = null;
                break;
        }

        screen.value = CalcApp.display;
    },

    handleOperation(operation) {
        const inputValue = parseFloat(CalcApp.display);

        if (CalcApp.currentValue === null) {
            CalcApp.currentValue = inputValue;
        } else if (CalcApp.pendingOperation) {
            CalcApp.calculate();
        }

        CalcApp.pendingOperation = operation;
        CalcApp.shouldResetDisplay = true;
    },

    calculate() {
        if (CalcApp.pendingOperation === null || CalcApp.currentValue === null) return;

        const inputValue = parseFloat(CalcApp.display);
        let result;

        switch (CalcApp.pendingOperation) {
            case 'add':
                result = CalcApp.currentValue + inputValue;
                break;
            case 'subtract':
                result = CalcApp.currentValue - inputValue;
                break;
            case 'multiply':
                result = CalcApp.currentValue * inputValue;
                break;
            case 'divide':
                if (inputValue === 0) {
                    CalcApp.display = 'Error';
                    CalcApp.currentValue = null;
                    CalcApp.pendingOperation = null;
                    return;
                }
                result = CalcApp.currentValue / inputValue;
                break;
        }

        // Format result
        CalcApp.display = CalcApp.formatResult(result);
        CalcApp.currentValue = result;
        CalcApp.shouldResetDisplay = true;
    },

    formatResult(num) {
        if (!isFinite(num)) return 'Error';
        
        // Round to avoid floating point issues
        num = Math.round(num * 1000000000) / 1000000000;
        
        let str = num.toString();
        
        // Limit length
        if (str.length > 12) {
            if (Math.abs(num) >= 1e12) {
                str = num.toExponential(6);
            } else {
                str = num.toPrecision(10);
            }
        }
        
        return str;
    }
};

export default CalcApp;
