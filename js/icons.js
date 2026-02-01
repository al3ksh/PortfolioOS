/**
 * SVG Icons for Win 3.1 OS
 */

export const Icons = {
    // Window control icons
    minimize: `<svg viewBox="0 0 10 10"><line x1="1" y1="8" x2="9" y2="8" stroke="black" stroke-width="2"/></svg>`,
    
    maximize: `<svg viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" fill="none" stroke="black" stroke-width="1.5"/><line x1="1" y1="2.5" x2="9" y2="2.5" stroke="black" stroke-width="2"/></svg>`,
    
    restore: `<svg viewBox="0 0 10 10"><rect x="0" y="2" width="6" height="6" fill="white" stroke="black" stroke-width="1"/><rect x="3" y="0" width="6" height="6" fill="white" stroke="black" stroke-width="1"/></svg>`,
    
    close: `<svg viewBox="0 0 10 10"><line x1="1" y1="1" x2="9" y2="9" stroke="black" stroke-width="1.5"/><line x1="9" y1="1" x2="1" y2="9" stroke="black" stroke-width="1.5"/></svg>`,

    // Desktop icons
    portfolio: `<svg viewBox="0 0 48 48">
        <rect x="4" y="8" width="40" height="32" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <rect x="4" y="8" width="40" height="6" fill="#000080"/>
        <rect x="8" y="18" width="14" height="8" fill="#FFF" stroke="#808080"/>
        <rect x="26" y="18" width="14" height="8" fill="#FFF" stroke="#808080"/>
        <rect x="8" y="28" width="14" height="8" fill="#FFF" stroke="#808080"/>
        <rect x="26" y="28" width="14" height="8" fill="#FFF" stroke="#808080"/>
    </svg>`,

    readme: `<svg viewBox="0 0 48 48">
        <rect x="8" y="4" width="32" height="40" fill="#FFF" stroke="#000" stroke-width="2"/>
        <line x1="12" y1="12" x2="36" y2="12" stroke="#000" stroke-width="2"/>
        <line x1="12" y1="18" x2="36" y2="18" stroke="#000" stroke-width="1"/>
        <line x1="12" y1="22" x2="30" y2="22" stroke="#000" stroke-width="1"/>
        <line x1="12" y1="26" x2="34" y2="26" stroke="#000" stroke-width="1"/>
        <line x1="12" y1="30" x2="28" y2="30" stroke="#000" stroke-width="1"/>
        <polygon points="32,4 40,12 32,12" fill="#C0C0C0" stroke="#000" stroke-width="1"/>
    </svg>`,

    notepad: `<svg viewBox="0 0 48 48">
        <rect x="6" y="6" width="36" height="36" fill="#FFF" stroke="#000" stroke-width="2"/>
        <rect x="6" y="6" width="36" height="6" fill="#000080"/>
        <line x1="10" y1="16" x2="38" y2="16" stroke="#808080" stroke-width="1"/>
        <line x1="10" y1="22" x2="38" y2="22" stroke="#808080" stroke-width="1"/>
        <line x1="10" y1="28" x2="38" y2="28" stroke="#808080" stroke-width="1"/>
        <line x1="10" y1="34" x2="38" y2="34" stroke="#808080" stroke-width="1"/>
        <rect x="10" y="16" width="2" height="8" fill="#000">
            <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
        </rect>
    </svg>`,

    tunes: `<svg viewBox="0 0 48 48">
        <rect x="4" y="8" width="40" height="32" fill="#000" stroke="#808080" stroke-width="2"/>
        <rect x="8" y="12" width="32" height="16" fill="#001100"/>
        <rect x="10" y="22" width="3" height="4" fill="#0F0"/>
        <rect x="15" y="18" width="3" height="8" fill="#0F0"/>
        <rect x="20" y="20" width="3" height="6" fill="#0F0"/>
        <rect x="25" y="16" width="3" height="10" fill="#0F0"/>
        <rect x="30" y="19" width="3" height="7" fill="#0F0"/>
        <rect x="35" y="21" width="3" height="5" fill="#0F0"/>
        <circle cx="16" cy="36" r="4" fill="#C0C0C0" stroke="#000"/>
        <circle cx="32" cy="36" r="4" fill="#C0C0C0" stroke="#000"/>
    </svg>`,

    mines: `<svg viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="16" fill="#000" stroke="#808080" stroke-width="2"/>
        <circle cx="24" cy="24" r="10" fill="#333"/>
        <line x1="24" y1="4" x2="24" y2="12" stroke="#000" stroke-width="3"/>
        <line x1="24" y1="36" x2="24" y2="44" stroke="#000" stroke-width="3"/>
        <line x1="4" y1="24" x2="12" y2="24" stroke="#000" stroke-width="3"/>
        <line x1="36" y1="24" x2="44" y2="24" stroke="#000" stroke-width="3"/>
        <line x1="10" y1="10" x2="16" y2="16" stroke="#000" stroke-width="2"/>
        <line x1="38" y1="10" x2="32" y2="16" stroke="#000" stroke-width="2"/>
        <line x1="10" y1="38" x2="16" y2="32" stroke="#000" stroke-width="2"/>
        <line x1="38" y1="38" x2="32" y2="32" stroke="#000" stroke-width="2"/>
        <ellipse cx="20" cy="20" rx="3" ry="2" fill="#FFF" opacity="0.5"/>
    </svg>`,

    control: `<svg viewBox="0 0 48 48">
        <rect x="4" y="8" width="40" height="32" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <rect x="4" y="8" width="40" height="6" fill="#000080"/>
        <rect x="8" y="18" width="10" height="10" fill="#008080" stroke="#000"/>
        <rect x="20" y="18" width="10" height="10" fill="#FF0000" stroke="#000"/>
        <rect x="32" y="18" width="10" height="10" fill="#000" stroke="#000"/>
        <rect x="14" y="30" width="20" height="6" fill="#808080" stroke="#000"/>
        <rect x="14" y="30" width="8" height="6" fill="#000080"/>
    </svg>`,

    terminal: `<svg viewBox="0 0 48 48">
        <rect x="4" y="8" width="40" height="32" fill="#000" stroke="#C0C0C0" stroke-width="2"/>
        <text x="8" y="22" fill="#C0C0C0" font-family="monospace" font-size="8">C:\\&gt;_</text>
        <rect x="28" y="16" width="6" height="10" fill="#C0C0C0">
            <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
        </rect>
    </svg>`,

    calc: `<svg viewBox="0 0 48 48">
        <rect x="6" y="4" width="36" height="40" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <rect x="6" y="4" width="36" height="6" fill="#000080"/>
        <rect x="10" y="14" width="28" height="8" fill="#9EBD9E" stroke="#808080"/>
        <text x="32" y="20" fill="#000" font-family="monospace" font-size="6" text-anchor="end">0</text>
        <rect x="10" y="26" width="6" height="5" fill="#FFF" stroke="#808080"/>
        <rect x="18" y="26" width="6" height="5" fill="#FFF" stroke="#808080"/>
        <rect x="26" y="26" width="6" height="5" fill="#FFF" stroke="#808080"/>
        <rect x="34" y="26" width="6" height="5" fill="#FFA500" stroke="#808080"/>
        <rect x="10" y="33" width="6" height="5" fill="#FFF" stroke="#808080"/>
        <rect x="18" y="33" width="6" height="5" fill="#FFF" stroke="#808080"/>
        <rect x="26" y="33" width="6" height="5" fill="#FFF" stroke="#808080"/>
        <rect x="34" y="33" width="6" height="5" fill="#FFA500" stroke="#808080"/>
    </svg>`,

    taskmgr: `<svg viewBox="0 0 48 48">
        <rect x="4" y="6" width="40" height="36" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <rect x="4" y="6" width="40" height="6" fill="#000080"/>
        <rect x="8" y="16" width="32" height="4" fill="#008000"/>
        <rect x="8" y="16" width="12" height="4" fill="#00FF00"/>
        <rect x="8" y="22" width="32" height="4" fill="#008000"/>
        <rect x="8" y="22" width="24" height="4" fill="#00FF00"/>
        <rect x="8" y="28" width="32" height="4" fill="#008000"/>
        <rect x="8" y="28" width="8" height="4" fill="#00FF00"/>
        <rect x="8" y="34" width="32" height="4" fill="#008000"/>
        <rect x="8" y="34" width="18" height="4" fill="#00FF00"/>
    </svg>`,

    contact: `<svg viewBox="0 0 48 48">
        <rect x="4" y="10" width="40" height="28" fill="#FFF" stroke="#000" stroke-width="2"/>
        <polygon points="4,10 24,26 44,10" fill="none" stroke="#000080" stroke-width="2"/>
        <line x1="4" y1="38" x2="18" y2="24" stroke="#000080" stroke-width="2"/>
        <line x1="44" y1="38" x2="30" y2="24" stroke="#000080" stroke-width="2"/>
    </svg>`,

    sysinfo: `<svg viewBox="0 0 48 48">
        <rect x="4" y="4" width="40" height="40" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <rect x="4" y="4" width="40" height="6" fill="#000080"/>
        <circle cx="24" cy="26" r="12" fill="none" stroke="#000080" stroke-width="3"/>
        <text x="24" y="30" fill="#000080" font-family="serif" font-size="14" font-weight="bold" text-anchor="middle">i</text>
    </svg>`,

    explorer: `<svg viewBox="0 0 48 48">
        <rect x="4" y="12" width="40" height="32" fill="#FFFF80" stroke="#000" stroke-width="2"/>
        <polygon points="4,12 16,12 20,6 44,6 44,12" fill="#FFFF80" stroke="#000" stroke-width="2"/>
        <rect x="8" y="18" width="32" height="4" fill="#C0C0C0"/>
        <rect x="8" y="24" width="32" height="4" fill="#C0C0C0"/>
        <rect x="8" y="30" width="32" height="4" fill="#C0C0C0"/>
    </svg>`,

    paint: `<svg viewBox="0 0 48 48">
        <rect x="4" y="4" width="40" height="40" fill="#FFF" stroke="#000" stroke-width="2"/>
        <circle cx="16" cy="14" r="4" fill="#FF0000"/>
        <circle cx="28" cy="12" r="4" fill="#00FF00"/>
        <circle cx="38" cy="18" r="4" fill="#0000FF"/>
        <path d="M10,40 Q20,20 30,35 T45,25" fill="none" stroke="#FF00FF" stroke-width="3"/>
        <rect x="6" y="32" width="8" height="14" fill="#8B4513" stroke="#000"/>
        <polygon points="10,32 6,24 14,24" fill="#000"/>
    </svg>`,

    snake: `<svg viewBox="0 0 48 48">
        <rect x="4" y="4" width="40" height="40" fill="#004400" stroke="#000" stroke-width="2"/>
        <rect x="8" y="8" width="32" height="32" fill="#002200" stroke="#006600"/>
        <rect x="12" y="20" width="6" height="6" fill="#00FF00"/>
        <rect x="18" y="20" width="6" height="6" fill="#00DD00"/>
        <rect x="24" y="20" width="6" height="6" fill="#00BB00"/>
        <rect x="30" y="20" width="6" height="6" fill="#009900"/>
        <rect x="30" y="26" width="6" height="6" fill="#007700"/>
        <circle cx="14" cy="22" r="1.5" fill="#000"/>
        <circle cx="15" cy="14" r="3" fill="#FF0000"/>
    </svg>`,

    tetris: `<svg viewBox="0 0 48 48">
        <rect x="4" y="4" width="40" height="40" fill="#000" stroke="#808080" stroke-width="2"/>
        <rect x="12" y="32" width="6" height="6" fill="#00FFFF" stroke="#008888"/>
        <rect x="18" y="32" width="6" height="6" fill="#00FFFF" stroke="#008888"/>
        <rect x="24" y="32" width="6" height="6" fill="#00FFFF" stroke="#008888"/>
        <rect x="30" y="32" width="6" height="6" fill="#00FFFF" stroke="#008888"/>
        <rect x="18" y="26" width="6" height="6" fill="#FFFF00" stroke="#888800"/>
        <rect x="24" y="26" width="6" height="6" fill="#FFFF00" stroke="#888800"/>
        <rect x="18" y="20" width="6" height="6" fill="#FFFF00" stroke="#888800"/>
        <rect x="24" y="20" width="6" height="6" fill="#FFFF00" stroke="#888800"/>
        <rect x="12" y="14" width="6" height="6" fill="#FF00FF" stroke="#880088"/>
        <rect x="18" y="14" width="6" height="6" fill="#FF00FF" stroke="#880088"/>
        <rect x="24" y="14" width="6" height="6" fill="#FF00FF" stroke="#880088"/>
        <rect x="18" y="8" width="6" height="6" fill="#FF00FF" stroke="#880088"/>
    </svg>`,

    browser: `<svg viewBox="0 0 48 48">
        <rect x="4" y="8" width="40" height="32" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <rect x="4" y="8" width="40" height="6" fill="#000080"/>
        <rect x="8" y="18" width="32" height="18" fill="#FFF" stroke="#808080"/>
        <circle cx="24" cy="27" r="8" fill="none" stroke="#0078D4" stroke-width="3"/>
        <text x="21" y="31" fill="#0078D4" font-family="Times New Roman" font-size="12" font-style="italic" font-weight="bold">e</text>
    </svg>`,

    simplemode: `<svg viewBox="0 0 48 48">
        <rect x="6" y="4" width="36" height="40" fill="#FFF" stroke="#000" stroke-width="2"/>
        <rect x="10" y="8" width="28" height="4" fill="#000080"/>
        <line x1="10" y1="16" x2="38" y2="16" stroke="#000" stroke-width="1"/>
        <line x1="10" y1="22" x2="34" y2="22" stroke="#808080" stroke-width="1"/>
        <line x1="10" y1="26" x2="30" y2="26" stroke="#808080" stroke-width="1"/>
        <line x1="10" y1="30" x2="36" y2="30" stroke="#808080" stroke-width="1"/>
        <line x1="10" y1="34" x2="28" y2="34" stroke="#808080" stroke-width="1"/>
        <line x1="10" y1="38" x2="32" y2="38" stroke="#808080" stroke-width="1"/>
    </svg>`,

    // Small icons for taskbar
    smallWindow: `<svg viewBox="0 0 16 16">
        <rect x="1" y="3" width="14" height="10" fill="#C0C0C0" stroke="#000" stroke-width="1"/>
        <rect x="1" y="3" width="14" height="3" fill="#000080"/>
    </svg>`,

    startMenu: `<svg viewBox="0 0 16 16">
        <rect x="1" y="1" width="14" height="14" fill="#C0C0C0" stroke="#000"/>
        <rect x="3" y="3" width="4" height="4" fill="#FF0000"/>
        <rect x="9" y="3" width="4" height="4" fill="#00FF00"/>
        <rect x="3" y="9" width="4" height="4" fill="#0000FF"/>
        <rect x="9" y="9" width="4" height="4" fill="#FFFF00"/>
    </svg>`
};

export default Icons;
