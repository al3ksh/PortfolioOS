# Portfolio OS

A Windows 3.1 inspired interactive portfolio website.

![Portfolio OS](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

Portfolio OS is a fully functional desktop environment simulation built with vanilla HTML, CSS, and JavaScript. It recreates the nostalgic Windows 3.1 experience while serving as a creative developer portfolio.

## Features

### Desktop Environment
- Draggable, resizable windows with authentic Win 3.1 styling
- Start menu with application launcher
- Taskbar with running applications
- Desktop icons with grid snapping
- Multiple themes (Teal, Dark, Matrix, Windows 95/98, macOS, Ubuntu)
- System clock with calendar popup

### Applications
- **Portfolio.exe** - Main portfolio with bento grid layout
- **Contact.exe** - Contact information and social links
- **README.txt** - About this project
- **File Explorer** - Virtual file system browser
- **Notepad** - Text editor
- **Paint** - Drawing application
- **Calculator** - Functional calculator
- **Terminal** - Command-line interface with custom commands
- **Internet Explorer** - Web browser with iframe
- **Control Panel** - System settings and themes
- **System Information** - "Hardware" and performance info
- **Task Manager** - Running processes view

### Games
- **Minesweeper** - Classic minesweeper game
- **Snake** - Snake game with mobile controls
- **Tetris** - Tetris with touch support

### Special Features
- CV/Resume generator (File > Print Portfolio)
- Mobile-responsive touch controls for games
- Easter eggs (Konami code, terminal commands, hidden files)
- Sound effects (disabled by default)
- Screen saver (Matrix rain)
- Session persistence (window positions saved)

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - ES6 modules, no frameworks
- **No build tools** - Pure browser-native code

## Project Structure

```
Portfolio/
├── index.html          # Main HTML file
├── css/
│   ├── main.css        # CSS imports
│   ├── variables.css   # Theme variables
│   ├── base.css        # Reset and base styles
│   ├── desktop.css     # Desktop, taskbar, start menu
│   ├── window.css      # Window component styles
│   ├── components.css  # Reusable components
│   ├── apps.css        # Application-specific styles
│   └── boot.css        # Boot screen styles
├── js/
│   ├── main.js         # Entry point, boot sequence
│   ├── icons.js        # Icon definitions
│   ├── apps/           # Application modules
│   ├── components/     # UI components
│   └── managers/       # System managers
└── README.md
```

## Running Locally

Simply open `index.html` in a modern browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using VS Code Live Server
# Install "Live Server" extension and click "Go Live"
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Author

**Aleks Szotek**
- GitHub: [@al3ksh](https://github.com/al3ksh)
- Email: alex.szotek@gmail.com
- Discord: aleksh8

## License

MIT License - feel free to use this as inspiration for your own portfolio!

---

*Made with nostalgia and JavaScript*
