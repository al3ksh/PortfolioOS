/**
 * The CV as plain text, 58 columns wide: what the dot-matrix printer prints and
 * what C:\Users\<name>\Documents\cv.txt holds. Same data and order as cv.html
 * (scripts/build-static.mjs), so the three never drift apart.
 */

import { Profile, featuredProjects } from './config.js?v=17';
import { t, loc } from './i18n.js?v=17';

export const WIDTH = 58;

export function wrap(text, indent = '') {
    const lines = [];
    let line = indent;
    String(text).split(/\s+/).filter(Boolean).forEach((word) => {
        if (line.trim() && (line + word).length > WIDTH) {
            lines.push(line.trimEnd());
            line = indent;
        }
        line += `${word} `;
    });
    if (line.trim()) lines.push(line.trimEnd());
    return lines;
}

export const center = text => `${' '.repeat(Math.max(0, Math.floor((WIDTH - text.length) / 2)))}${text}`;
const heading = text => ['', text.toUpperCase(), '-'.repeat(text.length)];
// Title on the left, date on the right; when both do not fit, the date goes on its own line
const row = (left, right) => (left.length + right.length + 1 <= WIDTH
    ? [`${left}${' '.repeat(WIDTH - left.length - right.length)}${right}`]
    : [...wrap(left.replace(/^\* /, ''), '  ').map((line, i) => (i ? line : `* ${line.trimStart()}`)), right.padStart(WIDTH)]);
const bareUrl = url => String(url).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

// The contact details of cv.html, packed into centred lines that fit the paper
function contactLines() {
    const { phone, linkedin, email, github } = Profile.contact;
    const items = [
        loc(Profile.location),
        phone,
        email,
        linkedin && bareUrl(linkedin),
        github && `github.com/${github}`,
        Profile.siteUrl && bareUrl(Profile.siteUrl)
    ].filter(Boolean);
    const lines = [];
    items.forEach((item) => {
        const last = lines[lines.length - 1];
        if (last && `${last}  |  ${item}`.length <= WIDTH) lines[lines.length - 1] = `${last}  |  ${item}`;
        else lines.push(item);
    });
    return lines.map(center);
}

/** Skill groups from Profile.cv.skills, or the plain skill list. */
export function skillLines() {
    const groups = Profile.cv?.skills;
    if (groups) return groups.flatMap(group => wrap(`${loc(group.group)}: ${group.items.map(loc).join(', ')}`));
    return wrap(Profile.skills.map(loc).join(', '));
}

export function cvLines() {
    const cv = Profile.cv || {};
    const lines = [
        center(Profile.name.toUpperCase()),
        center(loc(cv.title || Profile.title)),
        '='.repeat(WIDTH),
        ...contactLines(),
        ...heading(t('cv.profile')),
        ...wrap(loc(cv.profile || Profile.about)),
        ...heading(t('section.experience'))
    ];
    Profile.experience.forEach((job) => {
        lines.push(...row(`* ${loc(job.role)}`, loc(job.date)), `  ${loc(job.company)}`, ...wrap(loc(job.description), '  '));
    });
    lines.push(...heading(t('section.projects')));
    featuredProjects().map(project => ({ ...project, ...cv.projects?.[project.name] })).forEach((project) => {
        const tech = project.tech || project.language;
        lines.push(`* ${project.name}${tech ? ` (${tech})` : ''}`);
        if (project.url) lines.push(`  ${bareUrl(project.url)}`);
        lines.push(...wrap(loc(project.description), '  '));
    });
    lines.push(...heading(t('section.education')));
    Profile.education.forEach((edu) => {
        lines.push(...row(`* ${loc(edu.degree)}`, loc(edu.date)), `  ${loc(edu.school)}`);
    });
    lines.push(...heading(t('section.skills')), ...skillLines());
    if (cv.languages?.length) {
        lines.push(...heading(t('cv.languages')), ...cv.languages.map(item => `- ${loc(item.name)}: ${loc(item.level)}`));
    }
    if (Profile.interests?.length) {
        lines.push(...heading(t('section.interests')), ...Profile.interests.flatMap((item) => {
            const itemLines = wrap(loc(item), '  ');
            itemLines[0] = `- ${itemLines[0].trimStart()}`;
            return itemLines;
        }));
    }
    lines.push('', '='.repeat(WIDTH), center('*** END OF DOCUMENT ***'));
    return lines;
}

export const cvText = () => cvLines().join('\n');
