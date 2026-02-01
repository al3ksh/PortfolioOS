/**
 * Internet Explorer App - Web Browser with iframe
 */

import { Icons } from '../icons.js';

export const BrowserApp = {
    id: 'browser',
    title: 'Internet Explorer',
    icon: Icons.browser,
    width: 900,
    height: 700,
    minWidth: 500,
    minHeight: 400,
    hasMenu: true,
    menuItems: ['File', 'Edit', 'View', 'Favorites', 'Help'],

    menuConfig: {
        'File': [
            { label: 'New Window', action: 'newWindow', disabled: true },
            { divider: true },
            { label: 'Open Location...', action: 'openUrl' },
            { divider: true },
            { label: 'Close', action: 'close', shortcut: 'Alt+F4' }
        ],
        'Edit': [
            { label: 'Copy', action: 'copy', shortcut: 'Ctrl+C' },
            { divider: true },
            { label: 'Select All', action: 'selectAll', shortcut: 'Ctrl+A' }
        ],
        'View': [
            { label: 'Refresh', action: 'refresh', shortcut: 'F5' },
            { label: 'Stop', action: 'stop' },
            { divider: true },
            { label: 'Full Screen', action: 'fullscreen', shortcut: 'F11' }
        ],
        'Favorites': [
            { label: 'Add to Favorites...', action: 'addFavorite', disabled: true },
            { divider: true },
            { label: '📁 Wikipedia', action: 'goWiki' },
            { label: '📁 Google', action: 'goGoogle' },
            { label: '📁 GitHub', action: 'goGitHub' }
        ],
        'Help': [
            { label: 'About Internet Explorer', action: 'about' }
        ]
    },

    currentUrl: 'about:home',

    render() {
        return `
            <div class="browser-container">
                <div class="browser-toolbar">
                    <div class="browser-nav-buttons">
                        <button class="browser-nav-btn" id="browserBack" title="Back" disabled>◀</button>
                        <button class="browser-nav-btn" id="browserForward" title="Forward" disabled>▶</button>
                        <button class="browser-nav-btn" id="browserRefresh" title="Refresh">🔄</button>
                        <button class="browser-nav-btn" id="browserHome" title="Home">🏠</button>
                    </div>
                    <div class="browser-address-bar">
                        <span class="address-icon">🌐</span>
                        <input type="text" id="browserUrl" class="browser-url-input" 
                            placeholder="Type a URL and press Enter..." 
                            value="about:home">
                        <button class="browser-go-btn" id="browserGo">Go</button>
                    </div>
                </div>
                
                <div class="browser-bookmarks">
                    <button class="bookmark-btn" data-url="https://en.wikipedia.org">Wikipedia</button>
                    <button class="bookmark-btn" data-url="https://www.google.com">Google</button>
                    <button class="bookmark-btn" data-url="https://github.com">GitHub</button>
                    <button class="bookmark-btn" data-url="https://www.youtube.com">YouTube</button>
                </div>
                
                <div class="browser-content" id="browserContent">
                    ${BrowserApp.renderHomePage()}
                </div>
                
                <div class="browser-statusbar">
                    <span id="browserStatus">Ready</span>
                    <span class="browser-security">🔒 Internet Zone</span>
                </div>
            </div>
        `;
    },

    renderHomePage() {
        return `
            <div class="browser-home-page" id="browserHomePage">
                <div class="home-logo">
                    <div class="ie-logo">
                        <span style="color: #0078D4; font-size: 64px; font-family: 'Times New Roman', serif; font-style: italic; font-weight: bold;">e</span>
                    </div>
                    <h1>Internet Explorer</h1>
                    <p class="ie-version">Version 3.1 for Portfolio OS</p>
                </div>
                
                <div class="home-search">
                    <input type="text" id="homeSearchInput" class="home-search-input" 
                        placeholder="Search the web...">
                    <button class="win-btn" id="homeSearchBtn">🔍 Search</button>
                </div>
                
                <div class="home-quicklinks">
                    <h3>Quick Links</h3>
                    <div class="quicklinks-grid">
                        <a href="#" class="quicklink" data-url="https://en.wikipedia.org">
                            <span class="quicklink-icon">📚</span>
                            <span>Wikipedia</span>
                        </a>
                        <a href="#" class="quicklink" data-url="https://www.google.com">
                            <span class="quicklink-icon">🔍</span>
                            <span>Google</span>
                        </a>
                        <a href="#" class="quicklink" data-url="https://github.com">
                            <span class="quicklink-icon">🐙</span>
                            <span>GitHub</span>
                        </a>
                        <a href="#" class="quicklink" data-url="https://www.youtube.com">
                            <span class="quicklink-icon">📺</span>
                            <span>YouTube</span>
                        </a>
                        <a href="#" class="quicklink" data-url="https://stackoverflow.com">
                            <span class="quicklink-icon">📋</span>
                            <span>Stack Overflow</span>
                        </a>
                        <a href="#" class="quicklink" data-url="https://linkedin.com">
                            <span class="quicklink-icon">💼</span>
                            <span>LinkedIn</span>
                        </a>
                        <a href="#" class="quicklink" data-url="https://twitter.com">
                            <span class="quicklink-icon">🐦</span>
                            <span>Twitter/X</span>
                        </a>
                        <a href="#" class="quicklink" data-url="https://reddit.com">
                            <span class="quicklink-icon">🤖</span>
                            <span>Reddit</span>
                        </a>
                    </div>
                </div>
                
                <div class="browser-info-box">
                    <p>ℹ️ <strong>Note:</strong> Due to security restrictions, some websites may not load in iframe. 
                    They will open in a new browser tab instead.</p>
                </div>
            </div>
        `;
    },

    onMenuAction(action) {
        switch(action) {
            case 'refresh':
                BrowserApp.refreshPage();
                break;
            case 'goGoogle':
                BrowserApp.navigate('https://www.google.com');
                break;
            case 'goGitHub':
                BrowserApp.navigate('https://github.com');
                break;
            case 'goWiki':
                BrowserApp.navigate('https://en.wikipedia.org');
                break;
            case 'openUrl':
                const url = prompt('Enter URL:', 'https://');
                if (url) BrowserApp.navigate(url);
                break;
        }
    },

    onInit() {
        const container = document.querySelector('#window-browser');
        if (!container) return;

        const urlInput = container.querySelector('#browserUrl');
        const goBtn = container.querySelector('#browserGo');
        const homeBtn = container.querySelector('#browserHome');
        const backBtn = container.querySelector('#browserBack');
        const refreshBtn = container.querySelector('#browserRefresh');
        const homeSearch = container.querySelector('#homeSearchInput');
        const homeSearchBtn = container.querySelector('#homeSearchBtn');

        // URL input
        urlInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                BrowserApp.navigate(urlInput.value);
            }
        });

        // Go button
        goBtn?.addEventListener('click', () => {
            BrowserApp.navigate(urlInput.value);
        });

        // Home button
        homeBtn?.addEventListener('click', () => {
            BrowserApp.goHome();
        });

        // Back button
        backBtn?.addEventListener('click', () => {
            BrowserApp.goHome();
        });

        // Refresh button
        refreshBtn?.addEventListener('click', () => {
            BrowserApp.refreshPage();
        });

        // Home page search
        homeSearch?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                BrowserApp.searchWeb(homeSearch.value);
            }
        });
        homeSearchBtn?.addEventListener('click', () => {
            BrowserApp.searchWeb(homeSearch.value);
        });

        // Bookmark buttons
        container.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                BrowserApp.navigate(btn.dataset.url);
            });
        });

        // Quick links
        container.querySelectorAll('.quicklink').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                BrowserApp.navigate(link.dataset.url);
            });
        });
    },

    // Sites known to block iframes (X-Frame-Options)
    blockedSites: [
        'youtube.com',
        'google.com', 
        'facebook.com',
        'twitter.com',
        'instagram.com',
        'linkedin.com',
        'github.com',
        'reddit.com',
        'amazon.com',
        'netflix.com',
        'stackoverflow.com'
    ],

    navigate(url) {
        if (!url || url.trim() === '' || url === 'about:home') {
            BrowserApp.goHome();
            return;
        }

        url = url.trim();
        const status = document.querySelector('#window-browser #browserStatus');
        const urlInput = document.querySelector('#window-browser #browserUrl');
        const content = document.querySelector('#window-browser #browserContent');
        const backBtn = document.querySelector('#window-browser #browserBack');

        // Handle search (no dots, not a protocol)
        if (!url.includes('.') && !url.includes('://')) {
            BrowserApp.searchWeb(url);
            return;
        }

        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Check if site is known to block iframes
        const isBlocked = BrowserApp.blockedSites.some(site => url.includes(site));
        if (isBlocked) {
            BrowserApp.currentUrl = url;
            if (urlInput) urlInput.value = url;
            if (backBtn) backBtn.disabled = false;
            BrowserApp.showBlockedMessage(url);
            return;
        }

        // Try to load in iframe
        BrowserApp.currentUrl = url;
        if (urlInput) urlInput.value = url;
        if (backBtn) backBtn.disabled = false;
        if (status) status.textContent = 'Loading ' + url + '...';

        if (content) {
            content.innerHTML = `
                <div class="browser-loading" id="browserLoading">
                    <div class="loading-spinner"></div>
                    <p style="margin-top: 15px;">Loading...</p>
                </div>
                <iframe class="browser-frame" id="browserFrame" src="${url}" 
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"></iframe>
            `;

            const iframe = content.querySelector('#browserFrame');
            const loading = content.querySelector('#browserLoading');

            // Handle iframe load
            iframe?.addEventListener('load', () => {
                if (loading) loading.style.display = 'none';
                if (status) status.textContent = 'Done';
            });

            // Handle iframe error
            iframe?.addEventListener('error', () => {
                BrowserApp.showError(url);
            });

            // Timeout fallback - if iframe doesn't load in 8s, offer to open in new tab
            setTimeout(() => {
                if (loading && loading.style.display !== 'none') {
                    // Check if iframe loaded anything
                    try {
                        // This will throw if cross-origin
                        const doc = iframe?.contentDocument;
                        if (loading) loading.style.display = 'none';
                        if (iframe) iframe.style.display = 'block';
                        if (status) status.textContent = 'Done';
                    } catch (e) {
                        // Cross-origin or blocked - show loaded anyway
                        if (loading) loading.style.display = 'none';
                        if (iframe) iframe.style.display = 'block';
                        if (status) status.textContent = 'Done';
                    }
                }
            }, 3000);
        }
    },

    showBlockedMessage(url) {
        const content = document.querySelector('#window-browser #browserContent');
        const status = document.querySelector('#window-browser #browserStatus');
        
        if (content) {
            content.innerHTML = `
                <div class="browser-error">
                    <div class="error-icon">🔒</div>
                    <h2>This page blocks embedding</h2>
                    <p>The page <strong>${url}</strong> blocks iframe display for security reasons.</p>
                    <p class="error-note">Most large sites (Google, YouTube, GitHub, LinkedIn) use this protection.</p>
                    <button class="win-btn" id="openInNewTab">🌐 Open in New Tab</button>
                    <button class="win-btn" id="goHomeBtn" style="margin-left: 10px;">🏠 Back to Home</button>
                </div>
            `;
            
            content.querySelector('#openInNewTab')?.addEventListener('click', () => {
                window.open(url, '_blank');
            });
            content.querySelector('#goHomeBtn')?.addEventListener('click', () => {
                BrowserApp.goHome();
            });
        }
        if (status) status.textContent = 'Page blocked';
    },

    showError(url) {
        const content = document.querySelector('#window-browser #browserContent');
        const status = document.querySelector('#window-browser #browserStatus');
        
        if (content) {
            content.innerHTML = `
                <div class="browser-error">
                    <div class="error-icon">⚠️</div>
                    <h2>Cannot display this page</h2>
                    <p>The page at <strong>${url}</strong> refused to connect.</p>
                    <p class="error-note">Many websites block iframe embedding for security reasons.</p>
                    <button class="win-btn" id="openInNewTab">Open in New Tab</button>
                </div>
            `;
            
            content.querySelector('#openInNewTab')?.addEventListener('click', () => {
                window.open(url, '_blank');
            });
        }
        if (status) status.textContent = 'Error loading page';
    },

    goHome() {
        const content = document.querySelector('#window-browser #browserContent');
        const urlInput = document.querySelector('#window-browser #browserUrl');
        const backBtn = document.querySelector('#window-browser #browserBack');
        const status = document.querySelector('#window-browser #browserStatus');

        BrowserApp.currentUrl = 'about:home';
        if (urlInput) urlInput.value = 'about:home';
        if (backBtn) backBtn.disabled = true;
        if (status) status.textContent = 'Ready';

        if (content) {
            content.innerHTML = BrowserApp.renderHomePage();
            // Rebind events for new home page
            BrowserApp.bindHomePageEvents();
        }
    },

    bindHomePageEvents() {
        const container = document.querySelector('#window-browser');
        if (!container) return;

        const homeSearch = container.querySelector('#homeSearchInput');
        const homeSearchBtn = container.querySelector('#homeSearchBtn');
        
        homeSearch?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') BrowserApp.searchWeb(homeSearch.value);
        });
        homeSearchBtn?.addEventListener('click', () => {
            BrowserApp.searchWeb(homeSearch.value);
        });
        container.querySelectorAll('.quicklink').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                BrowserApp.navigate(link.dataset.url);
            });
        });
    },

    refreshPage() {
        if (BrowserApp.currentUrl && BrowserApp.currentUrl !== 'about:home') {
            BrowserApp.navigate(BrowserApp.currentUrl);
        }
    },

    searchWeb(query) {
        if (!query || query.trim() === '') return;
        // Use Google search in iframe
        const searchUrl = 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(query);
        BrowserApp.navigate(searchUrl);
    }
};

export default BrowserApp;
