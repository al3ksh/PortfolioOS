/**
 * SVG Icons for Win 3.1 OS
 */

export const Icons = {
    // Window control icons
    minimize: `<svg width="16" height="16" viewBox="0 0 10 10"><line x1="1" y1="8" x2="9" y2="8" stroke="black" stroke-width="2"/></svg>`,
    
    maximize: `<svg width="16" height="16" viewBox="0 0 10 10"><rect x="1" y="1" width="8" height="8" fill="none" stroke="black" stroke-width="1.5"/><line x1="1" y1="2.5" x2="9" y2="2.5" stroke="black" stroke-width="2"/></svg>`,
    
    restore: `<svg width="16" height="16" viewBox="0 0 10 10"><rect x="0" y="2" width="6" height="6" fill="white" stroke="black" stroke-width="1"/><rect x="3" y="0" width="6" height="6" fill="white" stroke="black" stroke-width="1"/></svg>`,
    
    close: `<svg width="16" height="16" viewBox="0 0 10 10"><line x1="1" y1="1" x2="9" y2="9" stroke="black" stroke-width="1.5"/><line x1="9" y1="1" x2="1" y2="9" stroke="black" stroke-width="1.5"/></svg>`,

    // Desktop icons
    portfolio: `<svg width="16" height="16" viewBox="0 0 48 48">
        <rect x="4" y="8" width="40" height="32" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <rect x="4" y="8" width="40" height="6" fill="#000080"/>
        <rect x="8" y="18" width="14" height="8" fill="#FFF" stroke="#808080"/>
        <rect x="26" y="18" width="14" height="8" fill="#FFF" stroke="#808080"/>
        <rect x="8" y="28" width="14" height="8" fill="#FFF" stroke="#808080"/>
        <rect x="26" y="28" width="14" height="8" fill="#FFF" stroke="#808080"/>
    </svg>`,

    readme: `<svg width="16" height="16" viewBox="0 0 48 48">
        <rect x="8" y="4" width="32" height="40" fill="#FFF" stroke="#000" stroke-width="2"/>
        <line x1="12" y1="12" x2="36" y2="12" stroke="#000" stroke-width="2"/>
        <line x1="12" y1="18" x2="36" y2="18" stroke="#000" stroke-width="1"/>
        <line x1="12" y1="22" x2="30" y2="22" stroke="#000" stroke-width="1"/>
        <line x1="12" y1="26" x2="34" y2="26" stroke="#000" stroke-width="1"/>
        <line x1="12" y1="30" x2="28" y2="30" stroke="#000" stroke-width="1"/>
        <polygon points="32,4 40,12 32,12" fill="#C0C0C0" stroke="#000" stroke-width="1"/>
    </svg>`,

    notepad: `<svg width="16" height="16" viewBox="0 0 48 48">
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

    tunes: `<svg width="16" height="16" viewBox="0 0 48 48">
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

    mines: `<svg width="16" height="16" viewBox="0 0 48 48">
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

    control: `<svg width="16" height="16" viewBox="0 0 48 48">
        <rect x="4" y="8" width="40" height="32" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <rect x="4" y="8" width="40" height="6" fill="#000080"/>
        <rect x="8" y="18" width="10" height="10" fill="#008080" stroke="#000"/>
        <rect x="20" y="18" width="10" height="10" fill="#FF0000" stroke="#000"/>
        <rect x="32" y="18" width="10" height="10" fill="#000" stroke="#000"/>
        <rect x="14" y="30" width="20" height="6" fill="#808080" stroke="#000"/>
        <rect x="14" y="30" width="8" height="6" fill="#000080"/>
    </svg>`,

    terminal: `<svg width="16" height="16" viewBox="0 0 48 48">
        <rect x="4" y="8" width="40" height="32" fill="#000" stroke="#C0C0C0" stroke-width="2"/>
        <text x="8" y="22" fill="#C0C0C0" font-family="monospace" font-size="8">C:\\&gt;_</text>
        <rect x="28" y="16" width="6" height="10" fill="#C0C0C0">
            <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
        </rect>
    </svg>`,

    calc: `<svg width="16" height="16" viewBox="0 0 48 48">
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

    taskmgr: `<svg width="16" height="16" viewBox="0 0 48 48">
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

    contact: `<svg width="16" height="16" viewBox="0 0 48 48">
        <rect x="4" y="10" width="40" height="28" fill="#FFF" stroke="#000" stroke-width="2"/>
        <polygon points="4,10 24,26 44,10" fill="none" stroke="#000080" stroke-width="2"/>
        <line x1="4" y1="38" x2="18" y2="24" stroke="#000080" stroke-width="2"/>
        <line x1="44" y1="38" x2="30" y2="24" stroke="#000080" stroke-width="2"/>
    </svg>`,

    sysinfo: `<svg width="16" height="16" viewBox="0 0 48 48">
        <rect x="4" y="4" width="40" height="40" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <rect x="4" y="4" width="40" height="6" fill="#000080"/>
        <circle cx="24" cy="26" r="12" fill="none" stroke="#000080" stroke-width="3"/>
        <text x="24" y="30" fill="#000080" font-family="serif" font-size="14" font-weight="bold" text-anchor="middle">i</text>
    </svg>`,

    explorer: `<svg width="16" height="16" viewBox="0 0 48 48">
        <rect x="4" y="12" width="40" height="32" fill="#FFFF80" stroke="#000" stroke-width="2"/>
        <polygon points="4,12 16,12 20,6 44,6 44,12" fill="#FFFF80" stroke="#000" stroke-width="2"/>
        <rect x="8" y="18" width="32" height="4" fill="#C0C0C0"/>
        <rect x="8" y="24" width="32" height="4" fill="#C0C0C0"/>
        <rect x="8" y="30" width="32" height="4" fill="#C0C0C0"/>
    </svg>`,

    paint: `<svg width="16" height="16" viewBox="0 0 48 48">
        <rect x="4" y="4" width="40" height="40" fill="#FFF" stroke="#000" stroke-width="2"/>
        <circle cx="16" cy="14" r="4" fill="#FF0000"/>
        <circle cx="28" cy="12" r="4" fill="#00FF00"/>
        <circle cx="38" cy="18" r="4" fill="#0000FF"/>
        <path d="M10,40 Q20,20 30,35 T45,25" fill="none" stroke="#FF00FF" stroke-width="3"/>
        <rect x="6" y="32" width="8" height="14" fill="#8B4513" stroke="#000"/>
        <polygon points="10,32 6,24 14,24" fill="#000"/>
    </svg>`,

    snake: `<svg width="16" height="16" viewBox="0 0 48 48">
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

    tetris: `<svg width="16" height="16" viewBox="0 0 48 48">
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

    browser: `<svg width="16" height="16" viewBox="0 0 48 48">
        <rect x="4" y="8" width="40" height="32" fill="#C0C0C0" stroke="#000" stroke-width="2"/>
        <rect x="4" y="8" width="40" height="6" fill="#000080"/>
        <rect x="8" y="18" width="32" height="18" fill="#FFF" stroke="#808080"/>
        <circle cx="24" cy="27" r="8" fill="none" stroke="#0078D4" stroke-width="3"/>
        <text x="21" y="31" fill="#0078D4" font-family="Times New Roman" font-size="12" font-style="italic" font-weight="bold">e</text>
    </svg>`,

    simplemode: `<svg width="16" height="16" viewBox="0 0 48 48">
        <rect x="6" y="4" width="36" height="40" fill="#FFF" stroke="#000" stroke-width="2"/>
        <rect x="10" y="8" width="28" height="4" fill="#000080"/>
        <line x1="10" y1="16" x2="38" y2="16" stroke="#000" stroke-width="1"/>
        <line x1="10" y1="22" x2="34" y2="22" stroke="#808080" stroke-width="1"/>
        <line x1="10" y1="26" x2="30" y2="26" stroke="#808080" stroke-width="1"/>
        <line x1="10" y1="30" x2="36" y2="30" stroke="#808080" stroke-width="1"/>
        <line x1="10" y1="34" x2="28" y2="34" stroke="#808080" stroke-width="1"/>
        <line x1="10" y1="38" x2="32" y2="38" stroke="#808080" stroke-width="1"/>
    </svg>`,

    projects: `<svg width="16" height="16" viewBox="0 0 48 48">
        <path d="M4 12h14l4 5h22v23H4z" fill="#FFFF80" stroke="#000" stroke-width="2"/>
        <path d="M4 17h40" stroke="#808080" stroke-width="2"/>
        <rect x="10" y="23" width="7" height="11" fill="#000080"/>
        <rect x="21" y="28" width="7" height="6" fill="#0078D4"/>
        <rect x="32" y="20" width="7" height="14" fill="#008080"/>
        <path d="M10 36h29" stroke="#000" stroke-width="2"/>
    </svg>`,

    // Small icons for taskbar
    smallWindow: `<svg width="16" height="16" viewBox="0 0 16 16">
        <rect x="1" y="3" width="14" height="10" fill="#C0C0C0" stroke="#000" stroke-width="1"/>
        <rect x="1" y="3" width="14" height="3" fill="#000080"/>
    </svg>`,

    startMenu: `<svg width="32" height="32" viewBox="0 0 24 24" fill="#000000"><path d="M5.713 1.596l-.756.068-.238.55.734-.017.26-.601zm1.39.927l-.978.137-.326.807.96-.12.345-.824zM4.89 3.535l-.72.05-.24.567.721-.017.239-.6zm3.724.309l-1.287.068-.394.961 1.27-.053.411-.976zm1.87.566l-1.579.069-.566 1.357 1.596-.088.548-1.338zm-4.188.037l-.977.153-.343.806.976-.12.344-.839zm6.143.668l-1.87.135-.636 1.527 1.87-.154.636-1.508zm2.925.219c-.11 0-.222 0-.334.002l-.767 1.851c1.394-.03 2.52.088 3.373.38l-1.748 4.2c-.955-.304-2.082-.444-3.36-.394l-.539 1.305a8.762 8.762 0 013.364.396l-1.663 4.014c-1.257-.27-2.381-.395-3.386-.344l-.782 1.887c3.362-.446 6.347.822 9.008 3.773L24 9.23c-2.325-2.575-5.2-3.879-8.637-3.896zm-.644.002l-2.024.12-.687 1.68 2.025-.189.686-1.611zm-10.602.05l-.719.036-.224.566h.703l.24-.601zm3.69.397l-1.287.069-.395.959 1.27-.05.412-.978zM5.54 6.3l-.994.154-.344.807.979-.121.359-.84zm4.137.066l-1.58.069L7.53 7.77l1.596-.085.55-1.32zm1.955.688l-1.871.135-.635 1.527 1.887-.154.619-1.508zm2.281.19l-2.01.136-.7 1.682 2.04-.19.67-1.629zm-10.568.066l-.739.035-.238.564h.719l.258-.6zm3.705.293l-1.303.085-.394.961 1.287-.035.41-1.011zm11.838.255a6.718 6.718 0 012.777 1.717l-1.75 4.237c-.617-.584-1.15-.961-1.611-1.149l-1.201-.498 1.785-4.307zM4.734 8.22l-.976.154-.344.807.961-.12.36-.841zm4.186 0l-1.594.052-.549 1.354 1.594-.086.549-1.32zm1.957.668L8.99 9.04l-.619 1.508 1.87-.135.636-1.527zm2.246.275l-2.006.12-.703 1.665 2.041-.156.668-1.629zm-10.602.104l-.718.033-.24.549.718-.016.24-.566zm3.725.273l-1.289.07-.41.961 1.287-.03.412-1zm1.87.6l-1.596.05-.55 1.356 1.598-.084.547-1.322zm-4.186.037l-.979.136-.324.805.959-.119.344-.822zm6.14.633l-1.87.154-.653 1.527 1.906-.154.617-1.527zm2.266.275l-2.025.12-.686 1.663 2.025-.172.686-1.611zm-10.568.031l-.739.037-.238.565.72-.016.257-.586zm3.673.362l-1.289.068-.41.978 1.305-.05.394-.996zm-2.285.533l-.976.154-.326.805.96-.12.342-.84zm4.153.07l-1.596.066-.565 1.356 1.612-.084.549-1.338zm1.957.666l-1.889.154-.617 1.526 1.886-.15.62-1.53zm2.28.223l-2.025.12-.685 1.665 2.041-.172.67-1.613zM.962 13.02l-.738.053-.223.567.72-.02.24-.6zm3.705.31l-1.285.07-.395.976 1.287-.05.393-.997zm11.922.07c1.08.29 2.024.821 2.814 1.613l-1.715 4.183c-.892-.754-1.82-1.32-2.814-1.664l1.715-4.133zm-10.035.515L4.957 14l-.549 1.32 1.578-.066.567-1.338zm-4.184.014l-.996.156-.309.789.961-.105.344-.84zm6.14.67l-1.904.154-.617 1.527 1.889-.154.633-1.527zm2.231.324l-2.025.123-.686 1.682 2.026-.174.685-1.631zm-6.863.328l-1.3.068-.397.979 1.285-.053.412-.994zm1.871.584l-1.578.068-.566 1.334 1.595-.064.549-1.338zm1.953.701l-1.867.137-.635 1.51 1.87-.137.632-1.51zm2.23.31l-2.005.122-.703 1.68 2.04-.19.669-1.611Z"/></svg>`,

    // Start Menu / App icons (16x16 size)
    smFolder: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2,5 L7,5 L8,3 L14,3 L14,13 L2,13 Z" fill="#FFFF80" stroke="#000" stroke-width="1"/></svg>`,
    smEnvelope: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="4" width="14" height="10" fill="#FFF" stroke="#000" stroke-width="1"/><path d="M1,4 L8,9 L15,4" fill="none" stroke="#000080" stroke-width="1"/></svg>`,
    smNotepad: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="1" width="12" height="14" fill="#FFF" stroke="#000" stroke-width="1"/><rect x="2" y="1" width="12" height="3" fill="#000080"/><line x1="4" y1="6" x2="12" y2="6" stroke="#808080"/><line x1="4" y1="9" x2="12" y2="9" stroke="#808080"/><line x1="4" y1="12" x2="10" y2="12" stroke="#808080"/></svg>`,
    smPaint: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" fill="#FFF" stroke="#000" stroke-width="1"/><circle cx="5" cy="5" r="2" fill="#F00"/><circle cx="11" cy="4" r="2" fill="#0F0"/><path d="M3,13 Q8,6 13,11" fill="none" stroke="#F0F" stroke-width="1.5"/></svg>`,
    smTerminal: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="12" fill="#000" stroke="#C0C0C0" stroke-width="1"/><text x="3" y="10" fill="#C0C0C0" font-family="monospace" font-size="6">&gt;_</text></svg>`,
    smCalc: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="1" width="12" height="14" fill="#C0C0C0" stroke="#000" stroke-width="1"/><rect x="2" y="1" width="12" height="3" fill="#000080"/><rect x="4" y="6" width="8" height="3" fill="#9EBD9E" stroke="#808080"/><rect x="4" y="10" width="2.5" height="2" fill="#FFF" stroke="#808080"/><rect x="7" y="10" width="2.5" height="2" fill="#FFF" stroke="#808080"/><rect x="10" y="10" width="2" height="2" fill="#FFA500" stroke="#808080"/></svg>`,
    smBrowser: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="12" fill="#C0C0C0" stroke="#000" stroke-width="1"/><rect x="1" y="2" width="14" height="3" fill="#000080"/><circle cx="8" cy="9" r="3" fill="none" stroke="#0078D4" stroke-width="1.5"/><text x="6.5" y="11" fill="#0078D4" font-family="serif" font-size="6" font-style="italic" font-weight="bold">e</text></svg>`,
    smSimple: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="1" width="12" height="14" fill="#FFF" stroke="#000" stroke-width="1"/><rect x="2" y="1" width="12" height="3" fill="#000080"/><line x1="4" y1="6" x2="12" y2="6" stroke="#000"/><line x1="4" y1="9" x2="10" y2="9" stroke="#808080"/></svg>`,
    smProjects: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 4h5l1.5 2H15v8H1z" fill="#FFFF80" stroke="#000"/><rect x="3" y="8" width="2" height="4" fill="#000080"/><rect x="7" y="10" width="2" height="2" fill="#0078D4"/><rect x="11" y="7" width="2" height="5" fill="#008080"/></svg>`,
    smMines: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#000" stroke="#808080" stroke-width="1"/><line x1="8" y1="2" x2="8" y2="5" stroke="#000" stroke-width="1.5"/><line x1="8" y1="11" x2="8" y2="14" stroke="#000" stroke-width="1.5"/><line x1="2" y1="8" x2="5" y2="8" stroke="#000" stroke-width="1.5"/><line x1="11" y1="8" x2="14" y2="8" stroke="#000" stroke-width="1.5"/></svg>`,
    smTunes: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="3" width="14" height="10" fill="#000" stroke="#808080" stroke-width="1"/><rect x="3" y="5" width="10" height="5" fill="#001100"/><rect x="4" y="7" width="1.5" height="2" fill="#0F0"/><rect x="6" y="6" width="1.5" height="3" fill="#0F0"/><rect x="8" y="6.5" width="1.5" height="2.5" fill="#0F0"/><rect x="10" y="7" width="1.5" height="2" fill="#0F0"/></svg>`,
    smInfo: `<svg class="context-system-info-icon" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#C0C0C0" stroke="#000" stroke-width="1"/><text x="8" y="11" fill="#000080" font-family="serif" font-size="9" font-weight="bold" text-anchor="middle">i</text></svg>`,
    smTaskmgr: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="12" fill="#C0C0C0" stroke="#000" stroke-width="1"/><rect x="1" y="2" width="14" height="2.5" fill="#000080"/><rect x="3" y="6" width="10" height="1.5" fill="#008000"/><rect x="3" y="6" width="4" height="1.5" fill="#00FF00"/><rect x="3" y="8.5" width="10" height="1.5" fill="#008000"/><rect x="3" y="8.5" width="7" height="1.5" fill="#00FF00"/><rect x="3" y="11" width="10" height="1.5" fill="#008000"/></svg>`,
    smSettings: `<svg class="context-settings-icon" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#C0C0C0" stroke="#000" stroke-width="1"/><circle cx="8" cy="8" r="2.5" fill="#FFF" stroke="#000" stroke-width="0.5"/><g stroke="#000" stroke-width="1"><line x1="8" y1="1" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/><line x1="3" y1="3" x2="4.5" y2="4.5"/><line x1="11.5" y1="11.5" x2="13" y2="13"/><line x1="3" y1="13" x2="4.5" y2="11.5"/><line x1="11.5" y1="4.5" x2="13" y2="3"/></g></svg>`,
    smHelp: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#C0C0C0" stroke="#000" stroke-width="1"/><text x="8" y="11" fill="#000" font-family="serif" font-size="10" font-weight="bold" text-anchor="middle">?</text></svg>`,

    // Context menu / action icons
    ctxRefresh: `<svg width="16" height="16" viewBox="0 0 39 39" fill="#000000"><path d="M23.74,9 L31,9 C31.552,9 32,8.55 32,8 C32,7.45 31.552,7 31,7 L21,7 C20.879,7 20,7 20,8 L20,18 C20,18.55 20.448,19 21,19 C21.552,19 22,18.55 22,18 L22,10.36 C26.728,12.61 30,17.42 30,23 C30,30.73 23.732,37 16,37 C8.268,37 2,30.73 2,23 C2,15.95 7.218,10.13 14,9.16 L14,7.14 C6.109,8.13 0,14.84 0,23 C0,31.84 7.164,39 16,39 C24.836,39 32,31.84 32,23 C32,16.97 28.664,11.73 23.74,9"/></svg>`,
    ctxArrange: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="5" height="5" fill="none" stroke="#000" stroke-width="1"/><rect x="9" y="2" width="5" height="5" fill="none" stroke="#000" stroke-width="1"/><rect x="2" y="9" width="5" height="5" fill="none" stroke="#000" stroke-width="1"/><rect x="9" y="9" width="5" height="5" fill="none" stroke="#000" stroke-width="1"/></svg>`,
    ctxSort: `<svg width="16" height="16" viewBox="0 0 16 16"><text x="2" y="12" fill="#000080" font-family="sans-serif" font-size="11" font-weight="bold">Az</text><line x1="1" y1="14" x2="15" y2="14" stroke="#000" stroke-width="1"/></svg>`,
    ctxOpen: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2,5 L7,5 L8,3 L14,3 L14,13 L2,13 Z" fill="#FFFF80" stroke="#000" stroke-width="1"/><rect x="5" y="7" width="6" height="1" fill="#000"/></svg>`,
    ctxProps: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="11" fill="#C0C0C0" stroke="#000" stroke-width="1"/><rect x="1" y="2" width="14" height="2.5" fill="#000080"/><line x1="3" y1="7" x2="13" y2="7" stroke="#808080"/><line x1="3" y1="9.5" x2="11" y2="9.5" stroke="#808080"/></svg>`,

    // File type icons
    fileConfig: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="1" width="10" height="14" fill="#FFF" stroke="#000" stroke-width="1"/><rect x="2" y="1" width="10" height="3" fill="#000080"/><circle cx="7" cy="10" r="2.5" fill="none" stroke="#000" stroke-width="1"/><line x1="7" y1="7.5" x2="7" y2="8.5" stroke="#000" stroke-width="1"/></svg>`,
    fileText: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="1" width="10" height="14" fill="#FFF" stroke="#000" stroke-width="1"/><line x1="4" y1="5" x2="10" y2="5" stroke="#000"/><line x1="4" y1="8" x2="10" y2="8" stroke="#808080"/><line x1="4" y1="11" x2="8" y2="11" stroke="#808080"/></svg>`,
    fileLock: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="8" width="10" height="7" fill="#C0C0C0" stroke="#000" stroke-width="1"/><path d="M5,8 L5,6 A3,3 0 0,1 11,6 L11,8" fill="none" stroke="#000" stroke-width="1.5"/><circle cx="8" cy="11.5" r="1.5" fill="#000"/></svg>`,
    fileFont: `<svg width="16" height="16" viewBox="0 0 16 16"><text x="3" y="13" fill="#000" font-family="serif" font-size="12" font-weight="bold">A</text><line x1="1" y1="14" x2="15" y2="14" stroke="#000" stroke-width="1"/></svg>`,
    fileAudio: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="4" width="12" height="10" fill="#C0C0C0" stroke="#000" stroke-width="1"/><path d="M5,7 L5,11 M8,5 L8,11 M11,6 L11,11" stroke="#000" stroke-width="1.5"/><circle cx="5" cy="12.5" r="1" fill="#000"/><circle cx="8" cy="12.5" r="1" fill="#000"/><circle cx="11" cy="12.5" r="1" fill="#000"/></svg>`,
    fileExe: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="12" fill="#FFF" stroke="#000" stroke-width="1"/><rect x="1" y="2" width="14" height="3" fill="#000080"/><text x="8" y="13" fill="#000080" font-family="monospace" font-size="6" text-anchor="middle" font-weight="bold">EXE</text></svg>`,
    fileLink: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3,12 L8,4 L13,4 L13,12 Z" fill="none" stroke="#000080" stroke-width="1.5" stroke-dasharray="2,1"/><path d="M6,8 L10,8 L10,10 L6,10 Z" fill="#000080"/></svg>`,
    fileImage: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="12" fill="#FFF" stroke="#000" stroke-width="1"/><circle cx="5" cy="7" r="2" fill="#FF0000"/><polyline points="2,13 6,9 9,11 14,6" fill="none" stroke="#00AA00" stroke-width="1.5"/></svg>`,
    fileZip: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="1" width="10" height="14" fill="#FFFF80" stroke="#000" stroke-width="1"/><rect x="6" y="1" width="4" height="3" fill="#C0C0C0" stroke="#000" stroke-width="1"/><rect x="6.5" y="2" width="3" height="1" fill="#000"/><rect x="6.5" y="6" width="3" height="1.5" fill="#000"/><rect x="6.5" y="9" width="3" height="1.5" fill="#000"/><rect x="6.5" y="12" width="3" height="1.5" fill="#000"/></svg>`,
    fileDrive: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="5" width="14" height="8" fill="#C0C0C0" stroke="#000" stroke-width="1"/><rect x="3" y="3" width="10" height="3" fill="#808080" stroke="#000" stroke-width="1"/><ellipse cx="8" cy="9" rx="4" ry="2" fill="#E0E0E0" stroke="#808080"/></svg>`,
    fileFolderOpen: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1,5 L6,5 L7,3 L15,3 L15,13 L1,13 Z" fill="#FFFF80" stroke="#000" stroke-width="1"/></svg>`,

    // Toolbar / nav icons
    navBack: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M10,3 L4,8 L10,13" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>`,
    navForward: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M6,3 L12,8 L6,13" fill="none" stroke="#808080" stroke-width="2" stroke-linecap="round"/></svg>`,
    navUp: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3,11 L8,5 L13,11" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>`,
    navHome: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1,8 L8,2 L15,8 L15,14 L11,14 L11,9 L5,9 L5,14 L1,14 Z" fill="#C0C0C0" stroke="#000" stroke-width="1"/></svg>`,
    navSearch: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="4.5" fill="none" stroke="#000" stroke-width="1.5"/><line x1="10" y1="10" x2="14" y2="14" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>`,
    navGlobe: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#0078D4" stroke="#000" stroke-width="1"/><ellipse cx="8" cy="8" rx="6" ry="2" fill="none" stroke="#FFF" stroke-width="0.5"/><line x1="8" y1="2" x2="8" y2="14" stroke="#FFF" stroke-width="0.5"/><line x1="2" y1="8" x2="14" y2="8" stroke="#FFF" stroke-width="0.5"/></svg>`,
    navLock: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="8" width="10" height="6" fill="#C0C0C0" stroke="#000" stroke-width="1"/><path d="M5,8 L5,6 A3,3 0 0,1 11,6 L11,8" fill="none" stroke="#000" stroke-width="1.2"/></svg>`,

    // Paint tool icons
    toolBrush: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M9 2h4v4l-5 5-3-3z" fill="#C0C0C0" stroke="#000"/><path d="m5 8 3 3-2 2c-1 1-3 1-4 0 0-1 0-3 1-4z" fill="#000080" stroke="#000"/><path d="M10 3h2" stroke="#FFF"/></svg>`,
    toolPencil: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="m2 12 9-9 3 3-9 9-3 1z" fill="#FFE080" stroke="#000"/><path d="m11 3 2 2M2 12l3 3" stroke="#000"/><path d="m2 12-1 3 3-1" fill="#C0C0C0" stroke="#000"/></svg>`,
    toolEraser: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="m3 10 6-6 5 5-5 5H4z" fill="#FFB0B0" stroke="#000"/><path d="m8 6 5 5" stroke="#FFF" stroke-width="1.5"/><path d="M4 14h8" stroke="#000"/></svg>`,
    toolFill: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="m3 3 4-2 5 5-5 5-4-4z" fill="#C0C0C0" stroke="#000"/><path d="M8 11h6v3H8z" fill="#0078D4" stroke="#000"/><path d="m11 8 2 2" stroke="#000"/></svg>`,
    toolLine: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 13 13 3" stroke="#000" stroke-width="2"/><path d="M2 14h3M12 2h3" stroke="#0078D4"/></svg>`,
    toolRect: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2.5" y="3" width="11" height="10" fill="none" stroke="#000" stroke-width="1.5"/><path d="M2.5 5h11" stroke="#0078D4"/></svg>`,
    toolCircle: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="none" stroke="#000" stroke-width="1.5"/><path d="M8 2.5a5.5 5.5 0 0 1 5.5 5.5" stroke="#0078D4"/></svg>`,
    toolText: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 3h10M8 3v10M5 13h6" fill="none" stroke="#000" stroke-width="1.5"/><path d="M3 3h10" stroke="#0078D4"/></svg>`,
    toolPicker: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="m3 13 4-4 2 2-4 4zM7 9l4-6 2 2-4 6z" fill="#C0C0C0" stroke="#000"/><path d="M10 3h3v3" fill="none" stroke="#0078D4"/><circle cx="13" cy="13" r="2" fill="#00A0FF" stroke="#000"/></svg>`,

    // Section / card header icons
    secUser: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="5" r="3.5" fill="#C0C0C0" stroke="#000" stroke-width="1"/><path d="M2,14 Q2,9 8,9 Q14,9 14,14" fill="#C0C0C0" stroke="#000" stroke-width="1"/></svg>`,
    secBriefcase: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="6" width="12" height="8" fill="#C0C0C0" stroke="#000" stroke-width="1"/><rect x="5" y="4" width="6" height="3" fill="#C0C0C0" stroke="#000" stroke-width="1"/><line x1="5" y1="5.5" x2="11" y2="5.5" stroke="#000" stroke-width="1"/></svg>`,
    secLightbulb: `<svg width="16" height="16" viewBox="0 0 16 16"><ellipse cx="8" cy="5" rx="4" ry="5" fill="#FFFF00" stroke="#000" stroke-width="1"/><rect x="6" y="10" width="4" height="2" fill="#C0C0C0" stroke="#000" stroke-width="1"/><line x1="7" y1="13" x2="9" y2="13" stroke="#000" stroke-width="1"/></svg>`,
    secGraduation: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 6.5 8 2l7 4.5-7 4.5z" fill="#C0C0C0" stroke="#000"/><path d="M4 8.5v3.3c2.3 1.5 5.7 1.5 8 0V8.5" fill="#FFF" stroke="#000"/><path d="M15 6.5v4" stroke="#000"/><circle cx="15" cy="11.5" r="1" fill="#000"/></svg>`,
    secMail: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="4" width="14" height="10" fill="#FFF" stroke="#000" stroke-width="1"/><path d="M1,4 L8,9 L15,4" fill="none" stroke="#000080" stroke-width="1.5"/></svg>`,
    secLocation: `<svg width="16" height="16" viewBox="0 0 64 64"><path fill="#F76D57" d="M32,52.789l-12-18C18.5,32,16,28.031,16,24c0-8.836,7.164-16,16-16s16,7.164,16,16 c0,4.031-2.055,8-4,10.789L32,52.789z"/><path fill="#394240" d="M32,0C18.746,0,8,10.746,8,24c0,5.219,1.711,10.008,4.555,13.93c0.051,0.094,0.059,0.199,0.117,0.289 l16,24C29.414,63.332,30.664,64,32,64s2.586-0.668,3.328-1.781l16-24c0.059-0.09,0.066-0.195,0.117-0.289 C54.289,34.008,56,29.219,56,24C56,10.746,45.254,0,32,0z M44,34.789l-12,18l-12-18C18.5,32,16,28.031,16,24 c0-8.836,7.164-16,16-16s16,7.164,16,16C48,28.031,45.945,32,44,34.789z"/><circle fill="#394240" cx="32" cy="24" r="8"/></svg>`,

    sysOs: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1.5" y="2" width="13" height="9" fill="#C0C0C0" stroke="#000"/><line x1="5" y1="14" x2="11" y2="14" stroke="#000"/><line x1="8" y1="11" x2="8" y2="14" stroke="#000"/></svg>`,
    sysUptime: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#C0C0C0" stroke="#000"/><path d="M8 4v4l3 2" fill="none" stroke="#000" stroke-linecap="round"/></svg>`,
    sysProcessor: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="4" y="4" width="8" height="8" fill="#C0C0C0" stroke="#000"/><rect x="6" y="6" width="4" height="4" fill="#000080"/><path d="M4 2v2M8 2v2M12 2v2M4 12v2M8 12v2M12 12v2M2 4h2M2 8h2M2 12h2M12 4h2M12 8h2M12 12h2" stroke="#000"/></svg>`,
    sysMemory: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="5" width="12" height="6" fill="#C0C0C0" stroke="#000"/><path d="M4 7h2v2H4zM7 7h2v2H7zM10 7h2v2h-2zM4 11v2M7 11v2M10 11v2" fill="#000080" stroke="#000"/></svg>`,
    sysDisplay: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1.5" y="2" width="13" height="9" fill="#C0C0C0" stroke="#000"/><rect x="3" y="4" width="10" height="5" fill="#000080"/><path d="M5 14h6M8 11v3" stroke="#000"/></svg>`,
    sysPerformance: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 13V3M2 13h12" stroke="#000"/><path d="M4 11V8h2v3M7 11V5h2v6M10 11V7h2v4" fill="#008000" stroke="#000"/></svg>`,
    sysProcesses: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" fill="#C0C0C0" stroke="#000"/><path d="M4 5h8M4 8h5M4 11h7" stroke="#000"/></svg>`,
    sysNetwork: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#0078D4" stroke="#000"/><ellipse cx="8" cy="8" rx="3" ry="6" fill="none" stroke="#FFF"/><path d="M2 8h12" stroke="#FFF"/></svg>`,
    sysBrowser: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="12" fill="#C0C0C0" stroke="#000"/><rect x="1" y="2" width="14" height="3" fill="#000080"/><circle cx="8" cy="9" r="3" fill="none" stroke="#0078D4"/><path d="M5 9h6M8 6v6" stroke="#0078D4"/></svg>`,
    // Social / action icons
    socialGithub: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 30"><path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z" fill="#333"/></svg>`,
    socialDiscord: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 48 48"><path fill="#5865F2" d="M40,12c0,0-4.585-3.588-10-4l-0.488,0.976C34.408,10.174,36.654,11.891,39,14c-4.045-2.065-8.039-4-15-4s-10.955,1.935-15,4c2.346-2.109,5.018-4.015,9.488-5.024L18,8c-5.681,0.537-10,4-10,4s-5.121,7.425-6,22c5.162,5.953,13,6,13,6l1.639-2.185C13.857,36.848,10.715,35.121,8,32c3.238,2.45,8.125,5,16,5s12.762-2.55,16-5c-2.715,3.121-5.857,4.848-8.639,5.815L33,40c0,0,7.838-0.047,13-6C45.121,19.425,40,12,40,12z M17.5,30c-1.933,0-3.5-1.791-3.5-4c0-2.209,1.567-4,3.5-4s3.5,1.791,3.5,4C21,28.209,19.433,30,17.5,30z M30.5,30c-1.933,0-3.5-1.791-3.5-4c0-2.209,1.567-4,3.5-4s3.5,1.791,3.5,4C34,28.209,32.433,30,30.5,30z"/></svg>`,

    // Action button icons
    actSend: `<svg width="16" height="16" viewBox="0 0 485.411 485.411" fill="#000000"><path d="M0,81.824v321.763h485.411V81.824H0z M242.708,280.526L43.612,105.691h398.187L242.708,280.526z M163.397,242.649L23.867,365.178V120.119L163.397,242.649z M181.482,258.533l61.22,53.762l61.22-53.762L441.924,379.72H43.487 L181.482,258.533z M322.008,242.655l139.535-122.536v245.059L322.008,242.655z"/></svg>`,
    actClear: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3,3 L13,13 M13,3 L3,13" stroke="#000" stroke-width="2" stroke-linecap="round"/></svg>`,
    actSave: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2,3 L8,3 L10,1 L14,1 L14,13 L2,13 Z" fill="#C0C0C0" stroke="#000" stroke-width="1"/><polyline points="10,1 10,5 14,5" fill="none" stroke="#000" stroke-width="1"/><rect x="5" y="8" width="6" height="3" fill="#FFF" stroke="#000" stroke-width="0.5"/></svg>`,
    actTrash: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M4,6 L5,14 L11,14 L12,6 Z" fill="#C0C0C0" stroke="#000" stroke-width="1"/><rect x="3" y="4" width="10" height="2" fill="#808080" stroke="#000" stroke-width="1"/><line x1="7" y1="2" x2="9" y2="2" stroke="#000" stroke-width="1.5"/><line x1="7" y1="2" x2="7" y2="4" stroke="#000" stroke-width="1"/><line x1="9" y1="2" x2="9" y2="4" stroke="#000" stroke-width="1"/><line x1="6.5" y1="8" x2="6.5" y2="12" stroke="#000" stroke-width="0.8"/><line x1="8.5" y1="8" x2="8.5" y2="12" stroke="#000" stroke-width="0.8"/><line x1="10.5" y1="8" x2="10.5" y2="12" stroke="#000" stroke-width="0.8"/></svg>`,
    actPrint: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="1" width="10" height="5" fill="#C0C0C0" stroke="#000" stroke-width="1"/><rect x="5" y="6" width="6" height="3" fill="#FFF" stroke="#000" stroke-width="1"/><rect x="2" y="10" width="12" height="4" fill="#C0C0C0" stroke="#000" stroke-width="1"/><rect x="5" y="9" width="6" height="2" fill="#C0C0C0" stroke="#000" stroke-width="1"/></svg>`,
    actCopy: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="3" width="8" height="10" fill="#FFF" stroke="#000" stroke-width="1"/><rect x="6" y="6" width="8" height="10" fill="#C0C0C0" stroke="#000" stroke-width="1"/></svg>`,
    actDownload: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8,1 L8,10 M4,7 L8,11 L12,7" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="2" y="13" width="12" height="2" fill="#C0C0C0" stroke="#000" stroke-width="1"/></svg>`,

    // Status / state icons
    statusTrophy: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3,2 L13,2 L12,9 L4,9 Z" fill="#FFD700" stroke="#000" stroke-width="0.8"/><rect x="6" y="9" width="4" height="2" fill="#DAA520" stroke="#000" stroke-width="0.8"/><rect x="5" y="11" width="6" height="1.5" rx="0.5" fill="#DAA520" stroke="#000" stroke-width="0.8"/><path d="M2,2 Q1,2 1,4 Q1,7 4,7" fill="none" stroke="#FFD700" stroke-width="1.5"/><path d="M14,2 Q15,2 15,4 Q15,7 12,7" fill="none" stroke="#FFD700" stroke-width="1.5"/><line x1="5" y1="4" x2="11" y2="4" stroke="#B8860B" stroke-width="0.5"/><line x1="5" y1="6" x2="11" y2="6" stroke="#B8860B" stroke-width="0.5"/></svg>`,
    statusError: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#CC0000" stroke="#000" stroke-width="1"/><path d="M5,5 L11,11 M11,5 L5,11" stroke="#FFF" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    statusWarning: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8,2 L14,13 L2,13 Z" fill="#FFFF00" stroke="#000" stroke-width="1"/><text x="8" y="11.5" fill="#000" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">!</text></svg>`,
    statusSpeakerOn: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3,5 L6,5 L10,2 L10,14 L6,11 L3,11 Z" fill="#C0C0C0" stroke="#000" stroke-width="1"/><path d="M12,5 Q14,8 12,11" fill="none" stroke="#000" stroke-width="1.2"/><path d="M13.5,3 Q16,8 13.5,13" fill="none" stroke="#000" stroke-width="1"/></svg>`,
    statusSpeakerOff: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3,5 L6,5 L10,2 L10,14 L6,11 L3,11 Z" fill="#C0C0C0" stroke="#000" stroke-width="1"/><line x1="12" y1="4" x2="15" y2="12" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    statusRestart: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M13,8 A5,5 0 1,1 8,3" fill="none" stroke="#000" stroke-width="1.5"/><polygon points="8,1 8,5 11,3" fill="#000"/></svg>`,
    statusWrench: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M12,2 A3,3 0 0,1 14,7 L3,14 L2,12 L9,4 A3,3 0 0,1 12,2Z" fill="#C0C0C0" stroke="#000" stroke-width="1"/><circle cx="12" cy="4" r="1" fill="#FFF"/></svg>`,
    statusPause: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="4" y="3" width="3" height="10" fill="#000"/><rect x="9" y="3" width="3" height="10" fill="#000"/></svg>`,
    statusBomb: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="7" cy="10" r="5.5" fill="#333" stroke="#000" stroke-width="1"/><line x1="9" y1="6" x2="13" y2="3" stroke="#000" stroke-width="1.8" stroke-linecap="round"/><circle cx="14" cy="2.5" r="1.5" fill="#FF4400"/><path d="M4,8 L6,9 M5,11 L7,11 M4,13 L6,12" stroke="#FFF" stroke-width="0.8" stroke-linecap="round"/></svg>`,
    statusSkull: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="4" y="2" width="8" height="9" rx="1" fill="#DDD" stroke="#000" stroke-width="1"/><rect x="5" y="5" width="2" height="3" fill="#000"/><rect x="9" y="5" width="2" height="3" fill="#000"/><rect x="6" y="10" width="4" height="2" fill="#000"/><rect x="7" y="10" width="2" height="1" fill="#DDD"/><rect x="6" y="12" width="1" height="1" fill="#000"/><rect x="7" y="13" width="2" height="1" fill="#000"/><rect x="9" y="12" width="1" height="1" fill="#000"/><rect x="5" y="0" width="2" height="2" fill="#DDD" stroke="#000" stroke-width="0.8"/><rect x="9" y="0" width="2" height="2" fill="#DDD" stroke="#000" stroke-width="0.8"/></svg>`,
    statusDead: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#FFD700" stroke="#000" stroke-width="1"/><line x1="4.5" y1="6" x2="6.5" y2="7.5" stroke="#000" stroke-width="1.5" stroke-linecap="round"/><line x1="6.5" y1="6" x2="4.5" y2="7.5" stroke="#000" stroke-width="1.5" stroke-linecap="round"/><line x1="9.5" y1="6" x2="11.5" y2="7.5" stroke="#000" stroke-width="1.5" stroke-linecap="round"/><line x1="11.5" y1="6" x2="9.5" y2="7.5" stroke="#000" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="8" cy="10.5" rx="2.5" ry="2" fill="#000"/></svg>`,
    statusCool: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#FFD700" stroke="#000" stroke-width="1"/><line x1="3" y1="4" x2="8" y2="6" stroke="#000" stroke-width="1.2"/><line x1="13" y1="4" x2="8" y2="6" stroke="#000" stroke-width="1.2"/><circle cx="5" cy="7" r="1" fill="#000"/><circle cx="11" cy="7" r="1" fill="#000"/><path d="M5,10 Q8,12 11,10" fill="none" stroke="#000" stroke-width="1"/></svg>`,
    statusSmiley: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#FFFF00" stroke="#000" stroke-width="1"/><circle cx="5" cy="6.5" r="1.2" fill="#000"/><circle cx="11" cy="6.5" r="1.2" fill="#000"/><path d="M4,10 Q8,13 12,10" fill="none" stroke="#000" stroke-width="1.2"/></svg>`,
    statusSuccess: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#00AA00" stroke="#000" stroke-width="1"/><path d="M4,8 L7,11 L12,5" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

    // Control panel section icons
    cpWallpaper: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" fill="#9EDBFF" stroke="#000"/><circle cx="11.5" cy="4.5" r="2" fill="#FFD23F" stroke="#000" stroke-width=".6"/><path d="M2 13 6.2 8.5 9 11l2-2 3 4z" fill="#4E8F4E" stroke="#000" stroke-width=".7"/><path d="M2 13h12" stroke="#000"/></svg>`,
    cpDisplay: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="3" width="14" height="10" fill="#C0C0C0" stroke="#000" stroke-width="1"/><rect x="3" y="5" width="10" height="6" fill="#000080"/></svg>`,
    cpSound: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2,6 L5,6 L8,3 L8,13 L5,10 L2,10 Z" fill="#C0C0C0" stroke="#000" stroke-width="1"/><path d="M10,5 Q12,8 10,11" fill="none" stroke="#000" stroke-width="1.2"/><path d="M12,3 Q15,8 12,13" fill="none" stroke="#000" stroke-width="1"/></svg>`,
    cpSession: `<svg width="16" height="16" viewBox="0 0 24 24" fill="#000000"><path d="M5.75,17.5a.75.75,0,0,1,0-1.5h8.8A1.363,1.363,0,0,0,16,14.75v-12A1.363,1.363,0,0,0,14.55,1.5H5.75a.75.75,0,0,1,0-1.5h8.8A2.853,2.853,0,0,1,17.5,2.75v12A2.853,2.853,0,0,1,14.55,17.5ZM7.22,13.28a.75.75,0,0,1,0-1.061L9.939,9.5H.75A.75.75,0,0,1,.75,8H9.94L7.22,5.28A.75.75,0,0,1,8.28,4.22l4,4 .013.013.005.006.007.008.007.008,0,.005.008.009,0,0,.008.01,0,0,.008.011,0,0,.008.011,0,0,.008.011,0,0,.007.011,0,.005.006.01,0,.007,0,.008,0,.009,0,.006.006.011,0,0,.008.015h0a.751.751,0,0,1-.157.878L8.28,13.28a.75.75,0,0,1-1.06,0Z" transform="translate(3.25 3.25)" fill="#141124"/></svg>`,
    cpAbout: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#C0C0C0" stroke="#000" stroke-width="1"/><text x="8" y="11" fill="#000080" font-family="serif" font-size="9" font-weight="bold" text-anchor="middle">i</text></svg>`,

    // Form label icons
    labelName: `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="5" r="3.5" fill="#C0C0C0" stroke="#000" stroke-width="1"/><path d="M2,14 Q2,9 8,9 Q14,9 14,14" fill="#C0C0C0" stroke="#000" stroke-width="1"/></svg>`,
    labelEmail: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="4" width="14" height="10" fill="#FFF" stroke="#000" stroke-width="1"/><path d="M1,4 L8,9 L15,4" fill="none" stroke="#000080" stroke-width="1"/></svg>`,
    labelSubject: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="4" width="14" height="9" fill="#FFF" stroke="#000" stroke-width="1"/><line x1="3" y1="7" x2="13" y2="7" stroke="#000"/><line x1="3" y1="10" x2="11" y2="10" stroke="#808080"/></svg>`,
    labelMessage: `<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="12" fill="#FFF" stroke="#000" stroke-width="1"/><line x1="3" y1="5" x2="13" y2="5" stroke="#808080"/><line x1="3" y1="8" x2="13" y2="8" stroke="#808080"/><line x1="3" y1="11" x2="10" y2="11" stroke="#808080"/></svg>`,

    // Misc
    checkmark: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M4,8 L7,11 L12,5" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    xMark: `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3,3 L13,13 M13,3 L3,13" stroke="#CC0000" stroke-width="2.5" stroke-linecap="round"/></svg>`
};

// Keep every inline icon decorative and consistently scalable. This also
// prevents SVGs from becoming accidental tab stops or noisy screen-reader content.
Object.keys(Icons).forEach((key) => {
    Icons[key] = Icons[key].replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
});

export default Icons;
