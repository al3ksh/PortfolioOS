/**
 * Profile configuration - the single place to personalise Portfolio OS.
 *
 * Every app (Portfolio.exe, Simple View, Projects, Contact, Terminal,
 * File Explorer, CV generator...) reads its personal data from here.
 * Replace the placeholder values below with your own.
 *
 * Any text value can be a plain string or a { en, pl } object - the visitor
 * switches language with the EN/PL button in the taskbar.
 *
 * Static files that cannot read this module (index.html meta tags,
 * cv.html no-JS fallback) must be edited by hand - see README.md.
 */

export const Profile = {
    // Public address of the site (used for link previews and the static pages)
    siteUrl: 'https://example.com',

    name: 'Your Name',
    firstName: 'User',
    initials: 'Y.N.',
    title: { en: 'Full-Stack Developer', pl: 'Full-Stack Developer' },
    location: 'City, Country',

    // Short lines shown on the Portfolio.exe hero card
    bio: [
        'CS Student @ Your University',
        'Backend & Web Developer',
        'City, Country'
    ],

    about: {
        en: 'Short introduction about yourself: what you study or do, what you are certified in, and what kind of software you like to build.',
        pl: 'Krótko o sobie: co studiujesz lub czym się zajmujesz, jakie masz certyfikaty i jakie oprogramowanie lubisz tworzyć.'
    },

    contact: {
        email: 'you@example.com',
        github: 'your-github-username',
        discord: 'your-discord-username',
        // Shown on the CV only; leave empty to hide
        phone: '',
        linkedin: '' // full profile URL, e.g. https://www.linkedin.com/in/your-name
    },

    experience: [
        {
            role: 'Full-Stack Developer (Contract)',
            company: 'Company Name · Client Name',
            date: { en: 'Mar 2024 - Sep 2024', pl: 'mar 2024 - wrz 2024' },
            description: 'Describe what you built, which stack you used and what impact it had.'
        },
        {
            role: 'Full-Stack Intern',
            company: 'Company Name',
            date: { en: 'Jul 2023 - Aug 2023', pl: 'lip 2023 - sie 2023' },
            description: 'Describe your internship responsibilities and technologies.'
        }
    ],

    education: [
        {
            // Field of study and the kind of studies (level, full-time / part-time)
            degree: { en: 'Computer Science · BSc, full-time', pl: 'Informatyka · studia I stopnia, stacjonarne' },
            school: 'Your University',
            date: { en: 'Oct 2025 - present', pl: 'paź 2025 - obecnie' }
        },
        {
            degree: 'IT Technician',
            school: 'Your Technical School · Certifications',
            date: { en: 'Sep 2020 - Jun 2025', pl: 'wrz 2020 - cze 2025' }
        }
    ],

    skills: [
        'JavaScript', 'TypeScript', 'Python', 'C++', 'Node.js', 'Express',
        'Next.js', 'PostgreSQL', 'MongoDB', 'Tailwind', 'Docker', 'Git'
    ],

    // Shown on the CV and the static page
    interests: [
        { en: 'Figuring out how things work and why', pl: 'Dociekanie, jak coś działa i dlaczego' },
        { en: 'A hobby you enjoy', pl: 'Hobby, które lubisz' }
    ],

    // Optional extras for the printable CV (cv.html) and the printer in the
    // desktop. Anything left out falls back to the fields above.
    cv: {
        title: { en: 'Junior Full-Stack Developer', pl: 'Junior Full-Stack Developer' },
        profile: {
            en: 'A few sentences for recruiters: what you study, where you have worked and what you built there, and what kind of role you are looking for.',
            pl: 'Kilka zdań dla rekrutera: co studiujesz, gdzie pracowałeś i co tam zbudowałeś oraz jakiej pracy szukasz.'
        },
        // Skills in groups; without this the CV shows the flat `skills` list
        skills: [
            { group: { en: 'Programming', pl: 'Programowanie' }, items: ['JavaScript', 'TypeScript', 'Python', 'C++'] },
            { group: 'Backend', items: ['Node.js', 'Express', 'Next.js'] },
            { group: { en: 'Databases', pl: 'Bazy danych' }, items: ['PostgreSQL', 'MongoDB'] },
            { group: { en: 'Tools', pl: 'Narzędzia' }, items: ['Git', 'Docker', 'Tailwind'] }
        ],
        languages: [
            { name: { en: 'English', pl: 'Angielski' }, level: 'B2' }
        ],
        // Longer descriptions of featured projects, by project name
        projects: {
            PortfolioOS: {
                tech: 'JavaScript, Node.js, Express',
                description: {
                    en: 'Windows 3.1-style portfolio in vanilla JavaScript with working apps and games.',
                    pl: 'Portfolio w stylu Windows 3.1 w czystym JavaScripcie z działającymi aplikacjami i grami.'
                }
            }
        }
    },

    // Cloudflare Turnstile site key (public) for the contact form. Leave empty to
    // disable it. Needs TURNSTILE_SECRET in the backend .env; see README.
    turnstileSiteKey: '',

    // Projects.exe loads your public repositories live from the GitHub API
    // (stars, descriptions, licenses, dates). Set to false to only use the list below.
    githubSync: true,

    // Offline fallback for Projects.exe and the source of `featured` flags:
    // featured projects also appear in Portfolio.exe, Simple View and the CV.
    projects: [
        { name: 'PortfolioOS', language: 'JavaScript', tech: 'JavaScript, CSS, HTML', description: 'Interactive Windows 3.1 style portfolio with apps and games.', license: 'MIT', updated: 'Jan 1, 2026', url: 'https://github.com/your-github-username/PortfolioOS', featured: true },
        { name: 'Project-One', language: 'JavaScript', tech: 'Node.js, Express', description: 'Short description of your first project.', stars: 1, updated: 'Jan 1, 2026', url: 'https://github.com/your-github-username/project-one', featured: true },
        { name: 'Project-Two', language: 'C++', tech: 'C++', description: 'Short description of your second project.', license: 'MIT', updated: 'Jan 1, 2026', url: 'https://github.com/your-github-username/project-two', featured: true },
        { name: 'Project-Three', language: 'Python', description: 'Short description of your third project.', updated: 'Jan 1, 2026', url: 'https://github.com/your-github-username/project-three' }
    ],

    // Extra targets for the terminal `open <name>` command
    links: {
        website: 'https://example.com'
    }
};

export const githubUrl = (path = '') => `https://github.com/${Profile.contact.github}${path}`;

export const featuredProjects = () => Profile.projects.filter(project => project.featured);

export default Profile;
