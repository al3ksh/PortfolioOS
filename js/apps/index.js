/**
 * Apps Index - Export all apps
 */

import { PortfolioApp } from './PortfolioApp.js';
import { ReadmeApp } from './ReadmeApp.js';
import { NotepadApp } from './NotepadApp.js';
import { TunesApp } from './TunesApp.js';
import { MinesApp } from './MinesApp.js';
import { ControlApp } from './ControlApp.js';
import { TerminalApp } from './TerminalApp.js';
import { CalcApp } from './CalcApp.js';
import { TaskMgrApp } from './TaskMgrApp.js';
import { ContactApp } from './ContactApp.js';
import { SysInfoApp } from './SysInfoApp.js';
import { FileExplorerApp } from './FileExplorerApp.js';
import { PaintApp } from './PaintApp.js';
import { SnakeApp } from './SnakeApp.js';
import { TetrisApp } from './TetrisApp.js';
import { BrowserApp } from './BrowserApp.js';
import { SimpleModeApp } from './SimpleModeApp.js';

export const Apps = {
    portfolio: PortfolioApp,
    readme: ReadmeApp,
    notepad: NotepadApp,
    tunes: TunesApp,
    mines: MinesApp,
    control: ControlApp,
    terminal: TerminalApp,
    calc: CalcApp,
    taskmgr: TaskMgrApp,
    contact: ContactApp,
    sysinfo: SysInfoApp,
    explorer: FileExplorerApp,
    paint: PaintApp,
    snake: SnakeApp,
    tetris: TetrisApp,
    browser: BrowserApp,
    simplemode: SimpleModeApp
};

export default Apps;
