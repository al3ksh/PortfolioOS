/**
 * Minimal, safe Markdown renderer for GitHub READMEs.
 *
 * Everything is HTML-escaped first; only a known set of constructs is turned
 * back into markup. Raw HTML blocks are reduced to their images and links.
 * Links and images must resolve to http(s) URLs.
 */

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function resolveUrl(url, base) {
    const value = String(url || '').trim().replace(/^<|>$/g, '');
    if (!value || value.startsWith('#')) return null;
    try {
        const resolved = new URL(value, base);
        return ['http:', 'https:'].includes(resolved.protocol) ? resolved.href : null;
    } catch {
        return null;
    }
}

function renderImage(alt, src, options) {
    const url = resolveUrl(src, options.rawBase);
    if (!url) return escapeHtml(alt);
    return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy" referrerpolicy="no-referrer">`;
}

function renderLink(label, href, options) {
    const url = resolveUrl(href, options.linkBase);
    if (!url) return label;
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function renderInline(text, options) {
    const slots = [];
    const keep = html => `\u0000${slots.push(html) - 1}\u0000`;

    let out = String(text)
        .replace(/`([^`]+)`/g, (m, code) => keep(`<code>${escapeHtml(code)}</code>`))
        .replace(/\[!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
            (m, alt, src, href) => keep(renderLink(renderImage(alt, src, options), href, options)))
        .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (m, alt, src) => keep(renderImage(alt, src, options)))
        .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
            (m, label, href) => keep(renderLink(renderInline(label, options), href, options)))
        .replace(/<img\b[^>]*>/gi, (tag) => {
            const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
            const alt = tag.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] || '';
            return src ? keep(renderImage(alt, src, options)) : '';
        })
        .replace(/<br\s*\/?>/gi, () => keep('<br>'))
        .replace(/<\/?[a-z][^>]*>/gi, '')
        .replace(/https?:\/\/[^\s<>()]+/g, url => keep(renderLink(escapeHtml(url), url, options)));

    out = escapeHtml(out)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
        .replace(/(^|[^_\w])_([^_\s][^_]*?)_(?!\w)/g, '$1<em>$2</em>')
        .replace(/~~([^~]+)~~/g, '<del>$1</del>');

    return out.replace(/\u0000(\d+)\u0000/g, (m, index) => slots[Number(index)]);
}

function renderTable(rows, options) {
    const cells = row => row.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
    const [head, , ...body] = rows;
    return `<table><thead><tr>${cells(head).map(cell => `<th>${renderInline(cell, options)}</th>`).join('')}</tr></thead>`
        + `<tbody>${body.map(row => `<tr>${cells(row).map(cell => `<td>${renderInline(cell, options)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

export function renderMarkdown(source, options = {}) {
    const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
    const html = [];
    let paragraph = [];
    let list = null;

    const flushParagraph = () => {
        if (paragraph.length) html.push(`<p>${renderInline(paragraph.join(' '), options)}</p>`);
        paragraph = [];
    };
    const flushList = () => {
        if (list) html.push(`<${list.type}>${list.items.map(item => `<li>${renderInline(item, options)}</li>`).join('')}</${list.type}>`);
        list = null;
    };
    const flush = () => { flushParagraph(); flushList(); };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const fence = line.match(/^\s*(```|~~~)/);

        if (fence) {
            flush();
            const code = [];
            for (i++; i < lines.length && !lines[i].trim().startsWith(fence[1]); i++) code.push(lines[i]);
            html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
            continue;
        }

        if (!line.trim()) { flush(); continue; }

        const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
        if (heading) {
            flush();
            const level = Math.min(heading[1].length + 1, 6);
            html.push(`<h${level}>${renderInline(heading[2], options)}</h${level}>`);
            continue;
        }

        if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { flush(); html.push('<hr>'); continue; }

        if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1] || '') && (lines[i + 1] || '').includes('-')) {
            flush();
            const rows = [];
            while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(lines[i++]);
            i--;
            html.push(renderTable(rows, options));
            continue;
        }

        const quote = line.match(/^\s*>\s?(.*)$/);
        if (quote) {
            flush();
            const quoted = [quote[1]];
            while (i + 1 < lines.length && /^\s*>/.test(lines[i + 1])) quoted.push(lines[++i].replace(/^\s*>\s?/, ''));
            html.push(`<blockquote>${renderMarkdown(quoted.join('\n'), options)}</blockquote>`);
            continue;
        }

        const item = line.match(/^\s*([-*+]|\d+[.)])\s+(.*)$/);
        if (item) {
            flushParagraph();
            const type = /\d/.test(item[1]) ? 'ol' : 'ul';
            if (!list || list.type !== type) { flushList(); list = { type, items: [] }; }
            list.items.push(item[2].replace(/^\[( |x)\]\s*/i, (m, done) => (done.trim() ? '☑ ' : '☐ ')));
            continue;
        }

        if (list && /^\s{2,}\S/.test(line)) {
            list.items[list.items.length - 1] += ` ${line.trim()}`;
            continue;
        }

        flushList();
        paragraph.push(line.trim());
    }

    flush();
    return html.join('\n');
}

export default renderMarkdown;
