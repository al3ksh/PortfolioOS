/**
 * winSelect - a drop-down picker drawn in the page's own style, put in front of a
 * native <select>. The <select> stays in the form (hidden), so it is still what
 * the form submits, what the app code reads and what the no-JS page shows.
 *
 *   enhanceSelect(select)         - build the picker (safe to call twice)
 *   enhanceSelects(root, query)   - every matching <select> under root
 *
 * The picker follows the select: options added or removed, select.value and
 * select.selectedIndex set from code, form.reset() and the disabled attribute
 * all redraw it. Picking an option sets select.value and fires 'input' and
 * 'change' on the select, the same events a native pick sends.
 *
 * Keyboard (WAI-ARIA select-only combobox): Up/Down, Home/End, PageUp/PageDown,
 * Enter/Space to open or pick, Esc to close without picking, Tab picks the
 * highlighted option and moves on, typed letters jump to the matching option.
 */

const TYPE_RESET_MS = 600;
const PAGE_STEP = 8;
let uid = 0;
let openPicker = null;

const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
const indexDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');

// Text of the select's label without the select itself ("Subject:" -> "Subject")
function labelText(select) {
    const label = select.labels?.[0];
    if (!label) return select.getAttribute('aria-label') || select.title || '';
    const copy = label.cloneNode(true);
    copy.querySelectorAll('select, .win-select-picker').forEach(node => node.remove());
    return copy.textContent.replace(/\s+/g, ' ').trim().replace(/:$/, '');
}

class Picker {
    constructor(select) {
        this.select = select;
        this.id = `win-select-${++uid}`;
        this.active = -1;
        this.typed = '';
        this.typedAt = 0;

        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'win-select-picker';
        this.button.id = `${this.id}-button`;
        this.button.setAttribute('role', 'combobox');
        this.button.setAttribute('aria-haspopup', 'listbox');
        this.button.setAttribute('aria-expanded', 'false');
        this.button.setAttribute('aria-controls', `${this.id}-list`);
        // Hidden copies of every label keep the button as wide as the longest one, like a native select
        this.button.innerHTML = '<span class="win-select-value"><span class="win-select-current"></span><span class="win-select-sizer" aria-hidden="true"></span></span><span class="win-select-arrow" aria-hidden="true"></span>';
        // Classes on the select (win-select, sizes) carry over to the picker
        select.classList.forEach(name => this.button.classList.add(name));
        if (select.title) this.button.title = select.title;

        this.list = document.createElement('ul');
        this.list.className = 'win-select-list';
        this.list.id = `${this.id}-list`;
        this.list.setAttribute('role', 'listbox');
        this.list.tabIndex = -1;
        this.list.hidden = true;

        select.classList.add('win-select-native');
        select.hidden = true;
        select.tabIndex = -1;
        select.setAttribute('aria-hidden', 'true');
        select.after(this.button);

        this.bind();
        this.renderOptions();
    }

    get options() {
        return [...this.select.options];
    }

    bind() {
        const { select, button, list } = this;

        button.addEventListener('click', () => (this.isOpen() ? this.close() : this.open()));
        button.addEventListener('keydown', event => this.onKey(event));
        button.addEventListener('blur', () => {
            // A click in the list keeps the list open (focus comes straight back)
            if (!this.pointerInList) this.close();
        });

        // Keep focus on the button while the list is used with a mouse or finger
        list.addEventListener('pointerdown', event => {
            this.pointerInList = true;
            event.preventDefault();
        });
        list.addEventListener('pointerup', () => { this.pointerInList = false; });
        list.addEventListener('pointermove', event => {
            const item = event.target.closest('[role="option"]');
            if (item && !item.hasAttribute('aria-disabled')) this.highlight(Number(item.dataset.index), false);
        });
        list.addEventListener('click', event => {
            const item = event.target.closest('[role="option"]');
            if (!item || item.hasAttribute('aria-disabled')) return;
            this.pick(Number(item.dataset.index));
            this.close();
            button.focus();
        });

        // The select's <label> now points at the picker
        select.labels?.forEach(label => label.addEventListener('click', event => {
            if (event.target.closest('.win-select-picker, .win-select-list')) return;
            event.preventDefault();
            button.focus();
        }));

        // Changes made from code: new options, value, selectedIndex, disabled, reset()
        this.observer = new MutationObserver(() => this.renderOptions());
        this.observer.observe(select, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled', 'selected', 'label'] });
        Object.defineProperty(select, 'value', {
            configurable: true,
            get: () => valueDescriptor.get.call(select),
            set: value => { valueDescriptor.set.call(select, value); this.sync(); }
        });
        Object.defineProperty(select, 'selectedIndex', {
            configurable: true,
            get: () => indexDescriptor.get.call(select),
            set: value => { indexDescriptor.set.call(select, value); this.sync(); }
        });
        // reset fires before the form clears its fields
        select.form?.addEventListener('reset', () => setTimeout(() => this.sync()));
        select.addEventListener('change', () => this.sync());
        select.addEventListener('invalid', () => button.focus());
    }

    // Rebuild the option rows (cheap: a handful of options)
    renderOptions() {
        this.list.replaceChildren(...this.options.map((option, index) => {
            const item = document.createElement('li');
            item.id = `${this.id}-option-${index}`;
            item.className = 'win-select-option';
            item.setAttribute('role', 'option');
            item.dataset.index = index;
            item.textContent = option.label || option.text || ' ';
            if (option.disabled || option.parentElement?.disabled) item.setAttribute('aria-disabled', 'true');
            return item;
        }));
        this.button.querySelector('.win-select-sizer').replaceChildren(...this.options.map(option => {
            const span = document.createElement('span');
            span.textContent = option.label || option.text;
            return span;
        }));
        this.sync();
    }

    // Show the select's current value on the button and in the list
    sync() {
        const { select, button } = this;
        const index = indexDescriptor.get.call(select);
        const current = select.options[index];
        button.querySelector('.win-select-current').textContent = current ? (current.label || current.text) : ' ';
        button.disabled = select.disabled;
        const name = labelText(select);
        if (name) button.setAttribute('aria-label', name);
        else button.removeAttribute('aria-label');
        [...this.list.children].forEach((item, i) => item.setAttribute('aria-selected', String(i === index)));
        if (!this.isOpen()) this.active = index;
    }

    isOpen() {
        return !this.list.hidden;
    }

    open(start) {
        if (this.isOpen() || this.select.disabled || !this.options.length) return;
        if (openPicker && openPicker !== this) openPicker.close();
        openPicker = this;
        this.sync();
        // In <body> so a window's overflow cannot clip it; the theme comes from body/html
        document.body.append(this.list);
        this.list.hidden = false;
        this.button.setAttribute('aria-expanded', 'true');
        this.button.classList.add('is-open');
        this.place();
        const selected = indexDescriptor.get.call(this.select);
        this.highlight(start ?? (selected >= 0 ? selected : this.step(-1, 1)));

        this.onOutside = event => {
            if (!this.button.contains(event.target) && !this.list.contains(event.target)) this.close();
        };
        // Page or window scrolled (also a smooth scroll still running after focus):
        // the list follows the button and hides while the button is out of view
        this.onScroll = event => {
            if (this.list.contains(event.target) || this.scrollFrame) return;
            this.scrollFrame = requestAnimationFrame(() => {
                this.scrollFrame = 0;
                if (!this.isOpen()) return;
                if (!this.button.isConnected) return this.close();
                this.place();
            });
        };
        this.onResize = () => this.close();
        document.addEventListener('pointerdown', this.onOutside, true);
        window.addEventListener('scroll', this.onScroll, true);
        window.addEventListener('resize', this.onResize);
        window.addEventListener('blur', this.onResize);
    }

    close() {
        if (!this.isOpen()) return;
        this.list.hidden = true;
        this.list.remove();
        cancelAnimationFrame(this.scrollFrame);
        this.scrollFrame = 0;
        this.pointerInList = false;
        this.button.setAttribute('aria-expanded', 'false');
        this.button.removeAttribute('aria-activedescendant');
        this.button.classList.remove('is-open');
        document.removeEventListener('pointerdown', this.onOutside, true);
        window.removeEventListener('scroll', this.onScroll, true);
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('blur', this.onResize);
        if (openPicker === this) openPicker = null;
        this.active = indexDescriptor.get.call(this.select);
    }

    // Under the button, or above it when there is no room below
    place() {
        const { list, button } = this;
        const box = button.getBoundingClientRect();
        list.style.visibility = box.bottom < 0 || box.top > window.innerHeight ? 'hidden' : '';
        const scrolled = list.scrollTop;
        list.style.minWidth = `${Math.round(box.width)}px`;
        list.style.left = '0px';
        list.style.top = '0px';
        list.style.maxHeight = '';
        const below = window.innerHeight - box.bottom - 4;
        const above = box.top - 4;
        const wanted = list.scrollHeight;
        const up = wanted > below && above > below;
        const room = Math.max(60, up ? above : below);
        if (wanted > room) list.style.maxHeight = `${Math.floor(room)}px`;
        const height = Math.min(wanted, room);
        const width = list.offsetWidth;
        const left = Math.max(2, Math.min(box.left, window.innerWidth - width - 2));
        list.style.left = `${Math.round(left)}px`;
        list.style.top = `${Math.round(up ? box.top - height : box.bottom)}px`;
        list.classList.toggle('is-up', up);
        list.scrollTop = scrolled;
    }

    // Next enabled option from index in direction dir (or the nearest one back)
    step(index, dir) {
        const items = [...this.list.children];
        for (let i = index + dir; i >= 0 && i < items.length; i += dir) {
            if (!items[i].hasAttribute('aria-disabled')) return i;
        }
        return index >= 0 && index < items.length && !items[index].hasAttribute('aria-disabled') ? index : -1;
    }

    edge(dir) {
        return dir > 0 ? this.step(-1, 1) : this.step(this.list.children.length, -1);
    }

    highlight(index, scroll = true) {
        const items = [...this.list.children];
        if (index < 0 || index >= items.length) return;
        this.active = index;
        items.forEach((item, i) => item.classList.toggle('is-active', i === index));
        this.button.setAttribute('aria-activedescendant', items[index].id);
        if (scroll) items[index].scrollIntoView({ block: 'nearest' });
    }

    // Choose an option: the select gets the value and sends its usual events
    pick(index) {
        const option = this.select.options[index];
        if (!option || option.disabled) return;
        const changed = indexDescriptor.get.call(this.select) !== index;
        indexDescriptor.set.call(this.select, index);
        this.sync();
        if (changed) {
            this.select.dispatchEvent(new Event('input', { bubbles: true }));
            this.select.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    // Typed letters: repeat one letter to cycle, type a word to jump straight to it
    typeAhead(char) {
        const now = Date.now();
        this.typed = now - this.typedAt > TYPE_RESET_MS ? char : this.typed + char;
        this.typedAt = now;
        const items = [...this.list.children];
        const cycling = this.typed.split('').every(c => c === this.typed[0]);
        const search = cycling ? this.typed[0] : this.typed;
        const start = cycling ? this.active + 1 : Math.max(this.active, 0);
        for (let n = 0; n < items.length; n++) {
            const i = (start + n) % items.length;
            const item = items[i];
            if (!item.hasAttribute('aria-disabled') && item.textContent.trim().toLowerCase().startsWith(search)) return i;
        }
        return -1;
    }

    onKey(event) {
        const { key, altKey, ctrlKey, metaKey } = event;
        const open = this.isOpen();
        const current = open ? this.active : indexDescriptor.get.call(this.select);
        let handled = true;

        if (!open) {
            switch (key) {
                case 'ArrowDown':
                case 'ArrowUp':
                case 'Enter':
                case ' ':
                    this.open();
                    break;
                case 'Home':
                    this.open(this.edge(1));
                    break;
                case 'End':
                    this.open(this.edge(-1));
                    break;
                default:
                    handled = false;
            }
        } else if (altKey && key === 'ArrowUp') {
            this.pick(this.active);
            this.close();
        } else {
            switch (key) {
                case 'ArrowDown': this.highlight(this.step(current, 1)); break;
                case 'ArrowUp': this.highlight(this.step(current, -1)); break;
                case 'Home': this.highlight(this.edge(1)); break;
                case 'End': this.highlight(this.edge(-1)); break;
                case 'PageDown': this.highlight(this.step(Math.min(current + PAGE_STEP - 1, this.list.children.length), 1)); break;
                case 'PageUp': this.highlight(this.step(Math.max(current - PAGE_STEP + 1, -1), -1)); break;
                case 'Enter':
                    this.pick(this.active);
                    this.close();
                    break;
                case ' ':
                    if (this.typed && Date.now() - this.typedAt < TYPE_RESET_MS) {
                        const match = this.typeAhead(' ');
                        if (match >= 0) this.highlight(match);
                    } else {
                        this.pick(this.active);
                        this.close();
                    }
                    break;
                case 'Escape':
                    this.close();
                    break;
                case 'Tab':
                    this.pick(this.active);
                    this.close();
                    handled = false; // focus still moves on
                    break;
                default:
                    handled = false;
            }
        }

        // Printable character: type-ahead (opens the list when it is closed)
        if (!handled && key.length === 1 && key !== ' ' && !ctrlKey && !metaKey && !altKey) {
            const match = this.typeAhead(key.toLowerCase());
            if (match >= 0) {
                if (this.isOpen()) this.highlight(match);
                else this.open(match);
            }
            handled = true;
        }

        if (handled) {
            event.preventDefault();
            // Esc or arrows must not also close the window or move the desktop selection
            event.stopPropagation();
        }
    }

    destroy() {
        this.close();
        this.observer?.disconnect();
    }
}

export function enhanceSelect(select) {
    if (!(select instanceof HTMLSelectElement) || select.multiple || select.size > 1) return null;
    if (select._winSelect) return select._winSelect;
    select._winSelect = new Picker(select);
    return select._winSelect;
}

export function enhanceSelects(root = document, query = 'select') {
    return [...root.querySelectorAll(query)].map(enhanceSelect).filter(Boolean);
}

export default enhanceSelect;
