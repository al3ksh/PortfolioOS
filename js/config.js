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
        discord: 'your-discord-username'
    },

    experience: [
        {
            role: 'Full-Stack Developer (Contract)',
            company: 'Company Name · Client Name',
            date: '2024',
            description: 'Describe what you built, which stack you used and what impact it had.'
        },
        {
            role: 'Full-Stack Intern',
            company: 'Company Name',
            date: '2023',
            description: 'Describe your internship responsibilities and technologies.'
        }
    ],

    education: [
        {
            degree: 'Computer Science',
            school: 'Your University',
            date: '2025 - present'
        },
        {
            degree: 'IT Technician',
            school: 'Your Technical School · Certifications',
            date: '2025'
        }
    ],

    skills: [
        'JavaScript', 'TypeScript', 'Python', 'C++', 'Node.js', 'Express',
        'Next.js', 'PostgreSQL', 'MongoDB', 'Tailwind', 'Docker', 'Git'
    ],

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
