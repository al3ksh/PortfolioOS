/**
 * i18n - English / Polish translations for the portfolio-facing UI.
 *
 * Profile values in config.js can be plain strings or { en, pl } objects;
 * pass them through loc(). UI strings live in the dictionary below and are
 * read with t(key). Static HTML uses data-i18n / data-i18n-* attributes.
 */

export const LANGUAGES = ['en', 'pl'];

const dictionary = {
    en: {
        'start.portfolio': 'Portfolio',
        'start.contact': 'Contact Me',
        'start.projects': 'Projects',
        'start.network': 'Network',
        'start.explorer': 'File Explorer',
        'start.notepad': 'Notepad',
        'start.paint': 'Paint',
        'start.terminal': 'Terminal',
        'start.calc': 'Calculator',
        'start.internet': 'Internet',
        'start.simple': 'Simple View',
        'start.mines': 'Minesweeper',
        'start.tunes': 'Tunes',
        'start.sysinfo': 'System Info',
        'start.taskmgr': 'Task Manager',
        'start.settings': 'Settings',
        'start.help': 'Help',

        'lang.switch': 'Język: polski',
        'lang.current': 'Language: English',

        'privacy.title': 'Privacy Settings',
        'privacy.heading': 'This website uses local storage',
        'privacy.body': 'We save your preferences, window positions, and session data locally to improve your experience. No data is sent to external servers.',
        'privacy.decline': 'You can decline if you prefer not to have your session saved.',
        'privacy.accept': '✓ Accept',
        'privacy.declineBtn': '✗ Decline',

        'section.about': 'About Me',
        'section.experience': 'Experience',
        'section.skills': 'Skills',
        'section.projects': 'Projects',
        'section.education': 'Education',
        'section.contact': 'Contact',
        'cv.about': 'About',
        'cv.save': 'Save as PDF',
        'portfolio.downloadCv': 'Download CV',
        'portfolio.sendMessage': 'Send Message',
        'portfolio.openProjects': 'Open Projects application',
        'simple.toolbar': 'Plain HTML Portfolio View',
        'simple.print': 'Print',
        'simple.footer': 'Generated with Portfolio OS.',

        'projects.heading': 'Projects',
        'projects.by': 'Public repositories by',
        'projects.repositories': 'repositories',
        'projects.openGithub': 'Open GitHub',
        'projects.find': 'Find a project',
        'projects.placeholder': 'Name or description…',
        'projects.allLanguages': 'All languages',
        'projects.count': '{count} shown',
        'projects.empty': 'No projects match this filter.',
        'projects.featured': 'Featured',
        'projects.noLicense': 'No license listed',
        'projects.updated': 'Updated',
        'projects.details': 'Details',
        'projects.sourceLive': 'Live data from {link}. Click a project to read its README.',
        'projects.sourceOffline': 'Could not load live data from GitHub - showing a saved snapshot of {link}.',
        'projects.sourceSnapshot': 'Snapshot based on {link}.',

        'viewer.loading': 'Loading README…',
        'viewer.noReadme': 'This repository has no README yet.',
        'viewer.error': 'Could not load the README from GitHub.',
        'viewer.openRepo': 'Open on GitHub',
        'viewer.back': 'All projects',
        'viewer.stars': 'stars',

        'network.title': 'Network Neighborhood',
        'network.subtitle': 'Services I host and maintain myself',
        'network.host': 'Host',
        'network.uptime': 'Uptime',
        'network.load': 'Load',
        'network.memory': 'Memory',
        'network.online': 'Online',
        'network.offline': 'Offline',
        'network.checking': 'Checking…',
        'network.checked': 'Last check',
        'network.refresh': 'Refresh',
        'network.unavailable': 'The status service is not available on this deployment.',
        'network.open': 'Open',
        'network.days': 'd',
        'network.hours': 'h',
        'network.minutes': 'min',

        'contact.heading': 'Get In Touch',
        'contact.intro': "Send me a message and I'll get back to you!",
        'contact.name': 'Your Name:',
        'contact.email': 'Email Address:',
        'contact.subject': 'Subject:',
        'contact.message': 'Message:',
        'contact.messagePlaceholder': 'Type your message here...',
        'contact.subject.general': 'General Inquiry',
        'contact.subject.job': 'Job Opportunity',
        'contact.subject.project': 'Project Collaboration',
        'contact.subject.feedback': 'Feedback',
        'contact.subject.bug': 'Bug Report',
        'contact.send': 'Send Message',
        'contact.clear': 'Clear',
        'contact.sending': 'Sending message...',
        'contact.sent': 'Message Sent!',
        'contact.thanks': 'Thanks',
        'contact.willRespond': "I'll respond to {email} as soon as possible.",
        'contact.yourMessage': 'Your message:',
        'contact.sendAnother': 'Send Another',
        'contact.failed': 'Failed to Send',
        'contact.timeout': 'The request timed out. Please try again.',
        'contact.genericError': 'Something went wrong. Please try again.',
        'contact.tryAgain': 'Try Again',

        'readme.welcome': 'Welcome to my digital portfolio!',
        'readme.intro': ['This operating system was created', 'to showcase my web development', 'skills in an interactive way.'],
        'readme.howTo': 'HOW TO USE:',
        'readme.howToItems': ['• Double click = open application', '• Drag window = move it around', '• Buttons [-][□][×] = window controls', '• Start Menu = access everything', '• EN/PL in the taskbar = language'],
        'readme.apps': 'AVAILABLE APPLICATIONS:',
        'readme.appItems': ['📁 PORTFOLIO.EXE - My projects & bio', '📂 PROJECTS.EXE - Live GitHub repos', '🌐 NETWORK.EXE  - Status of my servers', '📝 NOTEPAD.EXE  - Notepad with save', '🎵 TUNES.EXE    - Background music', '💣 MINES.EXE    - Classic Minesweeper', '🐍 SNAKE.EXE    - Classic Snake', '🧱 TETRIS.EXE   - Classic Tetris', '🎨 PAINT.EXE    - Draw & paint', '🖩 CALC.EXE     - Calculator', '💻 TERMINAL.EXE - Command line', '📊 TASKMGR.EXE  - Task Manager', '📂 EXPLORER.EXE - File browser', 'ℹ️ SYSINFO.EXE  - System info', '📧 CONTACT.EXE  - Contact form', '⚙️ CONTROL.CPL  - Control Panel'],
        'readme.themes': 'THEMES:',
        'readme.themeItems': ['Available in Control Panel:', 'Teal, Dark, Hotdog Stand, Matrix,', 'Clouds, Win95, Win98, macOS, Ubuntu', '+ Auto-theme (dark mode 19:00-7:00)'],
        'readme.secrets': '🔐 HIDDEN SECRETS (SPOILER)'
    },

    pl: {
        'start.portfolio': 'Portfolio',
        'start.contact': 'Kontakt',
        'start.projects': 'Projekty',
        'start.network': 'Sieć',
        'start.explorer': 'Eksplorator plików',
        'start.notepad': 'Notatnik',
        'start.paint': 'Paint',
        'start.terminal': 'Terminal',
        'start.calc': 'Kalkulator',
        'start.internet': 'Internet',
        'start.simple': 'Widok prosty',
        'start.mines': 'Saper',
        'start.tunes': 'Muzyka',
        'start.sysinfo': 'Informacje o systemie',
        'start.taskmgr': 'Menedżer zadań',
        'start.settings': 'Ustawienia',
        'start.help': 'Pomoc',

        'lang.switch': 'Language: English',
        'lang.current': 'Język: polski',

        'privacy.title': 'Ustawienia prywatności',
        'privacy.heading': 'Ta strona korzysta z pamięci lokalnej',
        'privacy.body': 'Zapisujemy Twoje ustawienia, położenie okien i dane sesji lokalnie w przeglądarce. Żadne dane nie są wysyłane na zewnętrzne serwery.',
        'privacy.decline': 'Możesz odmówić, jeśli nie chcesz zapisywać sesji.',
        'privacy.accept': '✓ Akceptuję',
        'privacy.declineBtn': '✗ Odmawiam',

        'section.about': 'O mnie',
        'section.experience': 'Doświadczenie',
        'section.skills': 'Umiejętności',
        'section.projects': 'Projekty',
        'section.education': 'Wykształcenie',
        'section.contact': 'Kontakt',
        'cv.about': 'O mnie',
        'cv.save': 'Zapisz jako PDF',
        'portfolio.downloadCv': 'Pobierz CV',
        'portfolio.sendMessage': 'Napisz do mnie',
        'portfolio.openProjects': 'Otwórz aplikację Projekty',
        'simple.toolbar': 'Portfolio w prostym HTML',
        'simple.print': 'Drukuj',
        'simple.footer': 'Wygenerowano w Portfolio OS.',

        'projects.heading': 'Projekty',
        'projects.by': 'Publiczne repozytoria:',
        'projects.repositories': 'repozytoriów',
        'projects.openGithub': 'Otwórz GitHub',
        'projects.find': 'Znajdź projekt',
        'projects.placeholder': 'Nazwa lub opis…',
        'projects.allLanguages': 'Wszystkie języki',
        'projects.count': 'Widoczne: {count}',
        'projects.empty': 'Żaden projekt nie pasuje do filtra.',
        'projects.featured': 'Wyróżniony',
        'projects.noLicense': 'Brak licencji',
        'projects.updated': 'Aktualizacja',
        'projects.details': 'Szczegóły',
        'projects.sourceLive': 'Dane na żywo z {link}. Kliknij projekt, żeby przeczytać jego README.',
        'projects.sourceOffline': 'Nie udało się pobrać danych z GitHuba - pokazuję zapisaną listę z {link}.',
        'projects.sourceSnapshot': 'Lista zapisana na podstawie {link}.',

        'viewer.loading': 'Wczytywanie README…',
        'viewer.noReadme': 'To repozytorium nie ma jeszcze README.',
        'viewer.error': 'Nie udało się pobrać README z GitHuba.',
        'viewer.openRepo': 'Otwórz na GitHubie',
        'viewer.back': 'Wszystkie projekty',
        'viewer.stars': 'gwiazdek',

        'network.title': 'Otoczenie sieciowe',
        'network.subtitle': 'Usługi, które sam hostuję i utrzymuję',
        'network.host': 'Serwer',
        'network.uptime': 'Czas pracy',
        'network.load': 'Obciążenie',
        'network.memory': 'Pamięć',
        'network.online': 'Działa',
        'network.offline': 'Nie działa',
        'network.checking': 'Sprawdzam…',
        'network.checked': 'Ostatnie sprawdzenie',
        'network.refresh': 'Odśwież',
        'network.unavailable': 'Usługa statusu nie jest dostępna w tym wdrożeniu.',
        'network.open': 'Otwórz',
        'network.days': 'd',
        'network.hours': 'h',
        'network.minutes': 'min',

        'contact.heading': 'Napisz do mnie',
        'contact.intro': 'Wyślij wiadomość, a odpiszę najszybciej, jak się da!',
        'contact.name': 'Imię i nazwisko:',
        'contact.email': 'Adres e-mail:',
        'contact.subject': 'Temat:',
        'contact.message': 'Wiadomość:',
        'contact.messagePlaceholder': 'Wpisz tutaj swoją wiadomość...',
        'contact.subject.general': 'Pytanie ogólne',
        'contact.subject.job': 'Oferta pracy',
        'contact.subject.project': 'Współpraca przy projekcie',
        'contact.subject.feedback': 'Opinia',
        'contact.subject.bug': 'Zgłoszenie błędu',
        'contact.send': 'Wyślij',
        'contact.clear': 'Wyczyść',
        'contact.sending': 'Wysyłanie wiadomości...',
        'contact.sent': 'Wiadomość wysłana!',
        'contact.thanks': 'Dziękuję',
        'contact.willRespond': 'Odpowiem na {email} najszybciej, jak to możliwe.',
        'contact.yourMessage': 'Twoja wiadomość:',
        'contact.sendAnother': 'Wyślij kolejną',
        'contact.failed': 'Nie udało się wysłać',
        'contact.timeout': 'Przekroczono czas oczekiwania. Spróbuj ponownie.',
        'contact.genericError': 'Coś poszło nie tak. Spróbuj ponownie.',
        'contact.tryAgain': 'Spróbuj ponownie',

        'readme.welcome': 'Witaj w moim cyfrowym portfolio!',
        'readme.intro': ['Ten system operacyjny powstał,', 'żeby w interaktywny sposób pokazać', 'moje umiejętności programistyczne.'],
        'readme.howTo': 'JAK KORZYSTAĆ:',
        'readme.howToItems': ['• Podwójne kliknięcie = otwórz aplikację', '• Przeciągnij okno = przesuń je', '• Przyciski [-][□][×] = sterowanie oknem', '• Menu Start = dostęp do wszystkiego', '• EN/PL na pasku zadań = język'],
        'readme.apps': 'DOSTĘPNE APLIKACJE:',
        'readme.appItems': ['📁 PORTFOLIO.EXE - Projekty i bio', '📂 PROJECTS.EXE - Repozytoria z GitHuba', '🌐 NETWORK.EXE  - Status moich serwerów', '📝 NOTEPAD.EXE  - Notatnik z zapisem', '🎵 TUNES.EXE    - Muzyka w tle', '💣 MINES.EXE    - Klasyczny Saper', '🐍 SNAKE.EXE    - Klasyczny Wąż', '🧱 TETRIS.EXE   - Klasyczny Tetris', '🎨 PAINT.EXE    - Rysowanie', '🖩 CALC.EXE     - Kalkulator', '💻 TERMINAL.EXE - Wiersz poleceń', '📊 TASKMGR.EXE  - Menedżer zadań', '📂 EXPLORER.EXE - Przeglądarka plików', 'ℹ️ SYSINFO.EXE  - Informacje o systemie', '📧 CONTACT.EXE  - Formularz kontaktowy', '⚙️ CONTROL.CPL  - Panel sterowania'],
        'readme.themes': 'MOTYWY:',
        'readme.themeItems': ['Dostępne w Panelu sterowania:', 'Teal, Dark, Hotdog Stand, Matrix,', 'Clouds, Win95, Win98, macOS, Ubuntu', '+ Auto-motyw (ciemny 19:00-7:00)'],
        'readme.secrets': '🔐 UKRYTE SEKRETY (SPOILER)'
    }
};

function detectLanguage() {
    const params = new URLSearchParams(location.search);
    const fromUrl = params.get('lang');
    if (LANGUAGES.includes(fromUrl)) return fromUrl;
    const stored = sessionStorage.getItem('lang') || localStorage.getItem('lang');
    if (LANGUAGES.includes(stored)) return stored;
    return (navigator.language || '').toLowerCase().startsWith('pl') ? 'pl' : 'en';
}

export const lang = detectLanguage();

export function t(key, params = {}) {
    const value = dictionary[lang][key] ?? dictionary.en[key] ?? key;
    if (typeof value !== 'string') return value;
    return value.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match);
}

export function loc(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value[lang] ?? value.en ?? Object.values(value)[0] ?? '';
    }
    return value ?? '';
}

export function setLanguage(next) {
    if (!LANGUAGES.includes(next) || next === lang) return;
    sessionStorage.setItem('lang', next);
    localStorage.setItem('lang', next);
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    location.replace(url);
}

export function applyStaticTranslations(root = document) {
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
        el.title = t(el.dataset.i18nTitle);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
}

export default { lang, t, loc, setLanguage, applyStaticTranslations };
