/**
 * Apps Index - Export all apps
 */

import { PortfolioApp } from './PortfolioApp.js?v=15';
import { ReadmeApp } from './ReadmeApp.js?v=15';
import { NotepadApp } from './NotepadApp.js?v=15';
import { TunesApp } from './TunesApp.js?v=15';
import { MinesApp } from './MinesApp.js?v=15';
import { ControlApp } from './ControlApp.js?v=15';
import { TerminalApp } from './TerminalApp.js?v=15';
import { CalcApp } from './CalcApp.js?v=15';
import { TaskMgrApp } from './TaskMgrApp.js?v=15';
import { ContactApp } from './ContactApp.js?v=15';
import { SysInfoApp } from './SysInfoApp.js?v=15';
import { FileExplorerApp } from './FileExplorerApp.js?v=15';
import { PaintApp } from './PaintApp.js?v=15';
import { SnakeApp } from './SnakeApp.js?v=15';
import { TetrisApp } from './TetrisApp.js?v=15';
import { BrowserApp } from './BrowserApp.js?v=15';
import { SimpleModeApp } from './SimpleModeApp.js?v=15';
import { ProjectsApp } from './ProjectsApp.js?v=15';

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
    simplemode: SimpleModeApp,
    projects: ProjectsApp
};

export default Apps;
