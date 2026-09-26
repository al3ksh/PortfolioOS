# Portfolio OS

A Windows 3.1 inspired desktop environment that works as an interactive developer portfolio. Built with vanilla HTML, CSS and JavaScript: no frameworks, no build step.

![Version](https://img.shields.io/badge/version-1.1.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Vanilla JS](https://img.shields.io/badge/vanilla-JavaScript-f7df1e)

![Portfolio OS desktop with Portfolio.exe open](docs/screenshots/desktop.png)

<table>
  <tr>
    <td width="72%"><img src="docs/screenshots/apps.png" alt="Projects, Minesweeper and Terminal running in the dark theme"></td>
    <td width="28%"><img src="docs/screenshots/mobile.png" alt="Portfolio OS on a phone"></td>
  </tr>
  <tr>
    <td align="center"><sub>Projects, Minesweeper and Terminal in the Dark theme</sub></td>
    <td align="center"><sub>Mobile layout</sub></td>
  </tr>
</table>

## Features

### Desktop environment
- Draggable, resizable windows with authentic retro styling
- Start menu, taskbar, system tray and clock with calendar popup
- Desktop icons with grid snapping
- Themes: Teal, Dark, Hotdog Stand, Matrix, Clouds, Windows 95/98, macOS, Ubuntu, plus auto dark mode
- CRT effect, Matrix screensaver and optional system sounds
- Session persistence (window positions and open apps, opt-in via local storage)

### Applications
| App | Description |
| --- | --- |
| **Portfolio.exe** | Main portfolio in a bento grid layout |
| **Projects.exe** | Searchable, filterable list of your repositories, synced live from GitHub |
| **Simple View** | Plain HTML version of the portfolio |
| **Contact.exe** | Contact form (backed by a small Node.js API) and social links |
| **README.txt** | Welcome screen and usage guide |
| **File Explorer** | Virtual file system with hidden files |
| **Notepad**, **Paint**, **Calculator** | Classic utilities |
| **Terminal** | Fake DOS prompt with custom commands |
| **Internet** | Iframe based web browser |
| **Tunes** | Embedded Spotify player |
| **Control Panel** | Themes, sounds, screensaver and session settings |
| **System Information**, **Task Manager** | "Hardware" info and running windows |

### Games
- **Minesweeper**
- **Snake** (with touch controls)
- **Tetris** (with swipe and hold to drop)

### Extras
- CV generator (File > Print Portfolio) with print / save as PDF
- Static `cv.html` fallback for visitors without JavaScript
- Easter eggs: Konami code, hidden files, secret terminal commands

## Quick start

No build tools are required. Serve the project root with any static server:

```bash
git clone https://github.com/your-github-username/PortfolioOS.git
cd PortfolioOS
python -m http.server 8000
```

Then open <http://localhost:8000>. Alternatives: `npx serve`, or the VS Code "Live Server" extension.

> Opening `index.html` directly from disk (`file://`) does not work, because browsers block ES module imports there.

The contact form needs the backend (see [Docker deployment](#docker-deployment)). Everything else works as a plain static site.

## Personalization

All personal data lives in a single file: [`js/config.js`](js/config.js). Edit it to make the portfolio yours:

| Field | Used for |
| --- | --- |
| `name`, `firstName`, `initials`, `title`, `location` | Portfolio header, CV, System Info, File Explorer, footers |
| `bio`, `about` | Portfolio hero card and About section |
| `contact.email`, `contact.github`, `contact.discord` | Contact app, Portfolio, CV, Terminal `github` command |
| `experience`, `education`, `skills` | Portfolio, Simple View, CV, `cv.txt` in File Explorer |
| `githubSync` | When `true` (default), Projects.exe loads your public repositories live from the GitHub API, so stars, descriptions and new repos stay up to date |
| `projects` | Offline fallback for Projects.exe; entries with `featured: true` also appear in Portfolio, Simple View and CV |
| `links` | Extra targets for the Terminal `open <name>` command |

A few files are static and cannot read `config.js`, so update them by hand:

- **`index.html`**: `<title>`, `description` and Open Graph meta tags
- **`cv.html`**: the no-JavaScript CV fallback
- **`js/apps/TunesApp.js`**: the Spotify track in `TRACK`

### Keeping your data out of the repository

If you publish your fork but do not want your personal data in it, keep `config.js` with placeholders and store the real files in a `private/` folder (ignored by git). A `docker-compose.override.yml` in the repo root (also ignored, and loaded automatically by Docker Compose) mounts them over the placeholders:

```yaml
services:
  frontend:
    volumes:
      - ./private/config.js:/usr/share/nginx/html/js/config.js:ro
      - ./private/index.html:/usr/share/nginx/html/index.html:ro
      - ./private/cv.html:/usr/share/nginx/html/cv.html:ro
```

## Docker deployment

The repository ships with a two-container setup:

- **frontend**: nginx serving the static files, proxying `/api/*` to the backend
- **backend**: Express + Nodemailer API that sends contact form messages by email

```bash
cp .env.example .env
# fill in your SMTP credentials and CONTACT_EMAIL
docker compose up -d --build
```

The site is then available on port 80.

### Environment variables

| Variable | Description | Default |
| --- | --- | --- |
| `FRONTEND_PORT` | Host port for the website | `80` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use TLS from the start (`true` for port 465) | `false` |
| `SMTP_USER` | SMTP login (also used as the sender address) | none |
| `SMTP_PASS` | SMTP password; for Gmail use an [App Password](https://support.google.com/accounts/answer/185833) | none |
| `CONTACT_EMAIL` | Where contact form messages are delivered | `SMTP_USER` |
| `CORS_ORIGIN` | Allowed origin for the API | `*` |

The backend applies Helmet security headers, input validation, HTML escaping and rate limiting (5 messages per 15 minutes per IP).

### Running the backend without Docker

```bash
cd backend
npm install
SMTP_USER=you@example.com SMTP_PASS=your-app-password npm start
```

The frontend calls `/api/contact`, so put a reverse proxy in front of it (see [`nginx.conf`](nginx.conf)) when not using Docker.

## Project structure

```
PortfolioOS/
├── index.html            # App shell, boot screen, desktop markup
├── cv.html               # Static CV (no-JS fallback)
├── css/
│   ├── main.css          # Entry point, imports the rest
│   ├── variables.css     # Theme variables
│   └── ...               # base, desktop, window, components, apps, boot
├── js/
│   ├── config.js         # Your personal data (edit this!)
│   ├── main.js           # Boot sequence and desktop logic
│   ├── icons.js          # SVG icon set
│   ├── apps/             # One module per application
│   ├── components/       # Window and desktop icon components
│   └── managers/         # Windows, dialogs, sounds, storage, desktop grid
├── backend/              # Contact form API (Express + Nodemailer)
├── Dockerfile            # Frontend image (nginx)
├── docker-compose.yml
├── nginx.conf
└── .env.example
```

### Adding an app

1. Create `js/apps/MyApp.js` exporting an object with `id`, `title`, `icon`, `render()` and optionally `onInit()`, `onClose()`, `menuConfig` and `onMenuAction()`. Existing apps such as `CalcApp.js` are good references.
2. Register it in [`js/apps/index.js`](js/apps/index.js).
3. Add styles to `css/apps.css`.

> Imports use a `?v=15` query string for cache busting. Bump it across files when deploying changes behind aggressive caches.

## Browser support

Current versions of Chrome, Firefox, Safari and Edge (ES modules and CSS custom properties are required).

## License

Released under the [MIT License](LICENSE). Feel free to fork it and build your own portfolio on top of it.
