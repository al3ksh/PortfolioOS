/**
 * The programs of PortfolioOS in one list: the desktop icons (main.js), the
 * C:\Program Files tree and the shortcuts in C:\Users\<name>\Desktop (vfs.js)
 * are all built from it, so a new app shows up everywhere at once.
 *
 * folder/file/size: where the program sits under C:\Program Files (none for the Recycle Bin).
 */

import { Icons } from './icons.js?v=20';

export const DESKTOP_APPS = [
    { appId: 'portfolio', title: 'Portfolio.exe', icon: Icons.portfolio, folder: 'Portfolio OS', file: 'portfolio.exe', size: '2.1 MB' },
    { appId: 'projects', title: 'Projects.exe', icon: Icons.projects, folder: 'Portfolio OS', file: 'projects.exe', size: '640 KB' },
    { appId: 'network', title: 'Network.exe', icon: Icons.network, folder: 'Portfolio OS', file: 'network.exe', size: '320 KB' },
    { appId: 'readme', title: 'README.TXT', icon: Icons.readme, folder: 'Portfolio OS', file: 'readme.txt', size: '4 KB' },
    { appId: 'contact', title: 'Contact.exe', icon: Icons.contact, folder: 'Portfolio OS', file: 'contact.exe', size: '512 KB' },
    { appId: 'notepad', title: 'Notepad.exe', icon: Icons.notepad, folder: 'Accessories', file: 'notepad.exe', size: '64 KB' },
    { appId: 'code', title: 'Code.exe', icon: Icons.code, folder: 'Accessories', file: 'code.exe', size: '340 KB' },
    { appId: 'terminal', title: 'Terminal.exe', icon: Icons.terminal, folder: 'Accessories', file: 'terminal.exe', size: '96 KB' },
    { appId: 'explorer', title: 'Explorer.exe', icon: Icons.explorer, folder: 'Accessories', file: 'explorer.exe', size: '280 KB' },
    { appId: 'browser', title: 'Internet.exe', icon: Icons.browser, folder: 'Internet', file: 'internet.exe', size: '1.2 MB' },
    { appId: 'simplemode', title: 'Simple View', icon: Icons.simplemode, folder: 'Portfolio OS', file: 'simple.exe', size: '128 KB' },
    { appId: 'paint', title: 'Paint.exe', icon: Icons.paint, folder: 'Accessories', file: 'paint.exe', size: '256 KB' },
    { appId: 'calc', title: 'Calc.exe', icon: Icons.calc, folder: 'Accessories', file: 'calc.exe', size: '48 KB' },
    { appId: 'tunes', title: 'Tunes.exe', icon: Icons.tunes, folder: 'Accessories', file: 'tunes.exe', size: '210 KB' },
    { appId: 'mines', title: 'Mines.exe', icon: Icons.mines, folder: 'Games', file: 'mines.exe', size: '180 KB' },
    { appId: 'snake', title: 'Snake.exe', icon: Icons.snake, folder: 'Games', file: 'snake.exe', size: '96 KB' },
    { appId: 'tetris', title: 'Blocks.exe', icon: Icons.tetris, folder: 'Games', file: 'blocks.exe', size: '150 KB' },
    { appId: 'sysinfo', title: 'System Info', icon: Icons.sysinfo, folder: 'System Tools', file: 'sysinfo.exe', size: '88 KB' },
    { appId: 'taskmgr', title: 'Task Manager', icon: Icons.taskmgr, folder: 'System Tools', file: 'taskmgr.exe', size: '120 KB' },
    { appId: 'control', title: 'Control.cpl', icon: Icons.control, folder: 'System Tools', file: 'control.cpl', size: '72 KB' },
    { appId: 'recycle', title: 'Recycle Bin', icon: Icons.recycleEmpty }
];
