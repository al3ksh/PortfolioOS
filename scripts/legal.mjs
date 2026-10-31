/**
 * Privacy policy, terms of use and cookie information, in English and Polish.
 * Used by build-static.mjs; every value in `ctx` is already HTML-escaped.
 *
 * Keep this in sync with what the site really does: the contact form, the game
 * leaderboards, Turnstile, the embeds in Internet.exe and Tunes, and the keys the
 * desktop saves in localStorage / sessionStorage.
 */

export const LEGAL_UPDATED = '2026-10-31';

export const LEGAL_PAGES = ['privacy', 'terms', 'cookies'];

export const legalFile = (page, lang) => `${page}${lang === 'pl' ? '.pl' : ''}.html`;

export const LEGAL_STRINGS = {
    en: {
        privacy: 'Privacy policy',
        terms: 'Terms of use',
        cookies: 'Cookies',
        updated: 'Last updated',
        back: 'Back to the portfolio',
        contents: 'Contents',
        storageTitle: 'Saved data on this device',
        storageToggle: 'Remember PortfolioOS settings, window positions and game records in this browser',
        storageCount: 'Items saved right now: {n}',
        storageClear: 'Delete saved data',
        storageOn: 'Saving is on.',
        storageOff: 'Saving is off. PortfolioOS will start with default settings every time.',
        storageCleared: 'Saved data deleted.',
        storageBlocked: 'Your browser blocks local storage for this site, so nothing is saved.',
        storageNoJs: 'Turn on JavaScript to manage saved data here, or clear the site data in your browser settings.'
    },
    pl: {
        privacy: 'Polityka prywatności',
        terms: 'Regulamin',
        cookies: 'Cookies',
        updated: 'Ostatnia aktualizacja',
        back: 'Wróć do portfolio',
        contents: 'Spis treści',
        storageTitle: 'Dane zapisane na tym urządzeniu',
        storageToggle: 'Zapamiętuj ustawienia PortfolioOS, położenie okien i rekordy gier w tej przeglądarce',
        storageCount: 'Zapisane teraz elementy: {n}',
        storageClear: 'Usuń zapisane dane',
        storageOn: 'Zapisywanie jest włączone.',
        storageOff: 'Zapisywanie jest wyłączone. PortfolioOS za każdym razem uruchomi się z ustawieniami domyślnymi.',
        storageCleared: 'Zapisane dane zostały usunięte.',
        storageBlocked: 'Twoja przeglądarka blokuje pamięć lokalną dla tej strony, więc nic nie jest zapisywane.',
        storageNoJs: 'Włącz JavaScript, żeby zarządzać zapisanymi danymi tutaj, albo wyczyść dane strony w ustawieniach przeglądarki.'
    }
};

// What the desktop keeps in the browser: [name, where, purpose, how long]
const STORAGE_ROWS = {
    en: [
        ['lang, portfolio-theme, autoTheme, crtEffect and other settings', 'localStorage', 'Language, theme, sound, screen saver and the other options you pick in PortfolioOS', 'Until you delete them'],
        ['windowPositions, openWindows, desktopIconPositions', 'localStorage', 'Where you left windows and desktop icons', 'Until you delete them'],
        ['virtual disk log', 'localStorage', 'Files you saved, created or deleted on the PortfolioOS disk', 'Until you delete it'],
        ['minesweeper*, snakeWrap, leaderboardName', 'localStorage', 'Game settings, best times and the nickname you typed for the leaderboard', 'Until you delete them'],
        ['osVisited', 'localStorage', 'Opens PortfolioOS straight away on your next visit instead of the home page (Shut Down > Home page forgets it)', 'Until you delete it'],
        ['homeTheme', 'localStorage', 'Light or dark look of the home page and these pages', 'Until you delete it'],
        ['homeVisits', 'localStorage', 'The visit counter on the Internet.exe home page (stays on your device)', 'Until you delete it'],
        ['storagePrefs', 'localStorage', 'Remembers that you switched saving off', 'Until you delete it'],
        ['hasBooted, bootTime, lang, easter eggs', 'sessionStorage', 'Skips the boot screen after the first start, uptime, small jokes', 'Until you close the tab'],
        ['__cf_bm, cf_clearance (Cloudflare)', 'cookie', 'Bot and attack protection set by Cloudflare, which delivers the site', 'Up to 30 minutes / a few hours']
    ],
    pl: [
        ['lang, portfolio-theme, autoTheme, crtEffect i inne ustawienia', 'localStorage', 'Język, motyw, dźwięk, wygaszacz ekranu i pozostałe opcje wybrane w PortfolioOS', 'Do czasu usunięcia'],
        ['windowPositions, openWindows, desktopIconPositions', 'localStorage', 'Gdzie zostawiłeś okna i ikony na pulpicie', 'Do czasu usunięcia'],
        ['dziennik dysku wirtualnego', 'localStorage', 'Pliki zapisane, utworzone lub usunięte na dysku PortfolioOS', 'Do czasu usunięcia'],
        ['minesweeper*, snakeWrap, leaderboardName', 'localStorage', 'Ustawienia gier, najlepsze czasy i nick wpisany do tabeli wyników', 'Do czasu usunięcia'],
        ['osVisited', 'localStorage', 'Przy następnej wizycie otwiera od razu PortfolioOS zamiast strony głównej (Zamknij system > Strona główna to zapomina)', 'Do czasu usunięcia'],
        ['homeTheme', 'localStorage', 'Jasny lub ciemny wygląd strony głównej i tych stron', 'Do czasu usunięcia'],
        ['homeVisits', 'localStorage', 'Licznik odwiedzin na stronie startowej Internet.exe (zostaje na Twoim urządzeniu)', 'Do czasu usunięcia'],
        ['storagePrefs', 'localStorage', 'Zapamiętuje, że wyłączyłeś zapisywanie', 'Do czasu usunięcia'],
        ['hasBooted, bootTime, lang, easter eggi', 'sessionStorage', 'Pomija ekran startowy po pierwszym uruchomieniu, czas pracy, drobne żarty', 'Do zamknięcia karty'],
        ['__cf_bm, cf_clearance (Cloudflare)', 'cookie', 'Ochrona przed botami i atakami, ustawiana przez Cloudflare, który dostarcza stronę', 'Do 30 minut / kilku godzin']
    ]
};

const mail = ctx => `<a href="mailto:${ctx.email}">${ctx.email}</a>`;

function storageTable(lang) {
    const head = lang === 'pl' ? ['Nazwa', 'Gdzie', 'Po co', 'Jak długo'] : ['Name', 'Where', 'Purpose', 'How long'];
    return `<div class="table-wrap"><table class="list-view">
                            <thead><tr>${head.map(cell => `<th scope="col">${cell}</th>`).join('')}</tr></thead>
                            <tbody>${STORAGE_ROWS[lang].map(([name, where, purpose, time]) => `
                                <tr><td><code>${name}</code></td><td>${where}</td><td>${purpose}</td><td>${time}</td></tr>`).join('')}
                            </tbody>
                        </table></div>`;
}

// Each page: { title, intro, sections: [[heading, html]] }
export function legalContent(page, lang, ctx) {
    const pages = lang === 'pl' ? PL : EN;
    return pages[page](ctx);
}

const EN = {
    privacy: ctx => ({
        title: 'Privacy policy',
        intro: `<p>This page explains what personal data ${ctx.site} processes, why, and what you can do about it. In short: there is no analytics, no advertising and no tracking. Data is only collected when you write to me or put your nickname on a leaderboard.</p>`,
        sections: [
            ['Who is responsible', `<p>The controller of your personal data is ${ctx.name}, who runs this site privately. Write to ${mail(ctx)} about anything related to your data.</p>`],
            ['Contact form', `<p>When you send a message I receive your name, e-mail address, the subject you chose and the message. The message is delivered to my mailbox by e-mail; it is not stored in a database on the server.</p>
                <p><b>Purpose and legal basis:</b> replying to you and continuing the conversation (Art. 6(1)(f) GDPR, my legitimate interest in answering messages) and, if you write about a job or a project, taking steps at your request before a possible contract (Art. 6(1)(b) GDPR).</p>
                <p><b>How long:</b> as long as the conversation needs, and afterwards only as long as there may be a reason to come back to it. You can ask me to delete the conversation at any time.</p>
                <p>Giving your data is voluntary, but without an e-mail address I cannot reply.</p>`],
            ['Game leaderboards', `<p>When you submit a score in PortfolioOS, the nickname you type, the score and the date are saved on the server and shown publicly to everyone. Nothing else is saved with them; please do not use your real name if you do not want to.</p>
                <p><b>Legal basis:</b> your consent, given by submitting the score (Art. 6(1)(a) GDPR). You can withdraw it at any time by asking me to remove the entry. Entries also disappear on their own when better scores push them off the list.</p>`],
            ['Security and server logs', `<p>To keep the site running and protect it from spam and attacks, your IP address is used briefly: it is held in memory to limit how many messages and scores can be sent in a short time, and checked by Cloudflare Turnstile before a message is accepted. The IP address is not written to the leaderboard or kept with your message.</p>
                <p>The web server keeps short technical logs (time, requested address, errors). They contain no message contents, and older entries are overwritten automatically once the log reaches a small size limit.</p>
                <p><b>Legal basis:</b> my legitimate interest in the security of the site (Art. 6(1)(f) GDPR).</p>`],
            ['Who else processes data', `<ul>
                    <li><b>Cloudflare, Inc.</b> delivers the site and protects it from attacks (CDN, tunnel, Turnstile anti-spam check). It handles your IP address and technical connection data.</li>
                    <li><b>Google (Gmail)</b> delivers and stores the e-mail with your message.</li>
                    <li><b>GitHub, Inc.</b> When you open project windows in PortfolioOS, your browser loads public repository data directly from the GitHub API, so GitHub sees your IP address.</li>
                    <li><b>Services you open yourself.</b> Videos, music and pages opened in Internet.exe or Tunes (YouTube in privacy-enhanced mode, Spotify, Vimeo, Wikipedia, the Internet Archive and any site you type in) are loaded only when you choose them and follow those services' own privacy policies.</li>
                </ul>
                <p>Some of these companies are based in the USA. Transfers rely on the EU-US Data Privacy Framework or the European Commission's standard contractual clauses.</p>
                <p>The site uses no analytics tools, advertising networks, social media pixels or external fonts.</p>`],
            ['Data stored in your browser', `<p>PortfolioOS saves your settings, window positions, virtual disk changes and game records in your own browser, so the desktop looks the same next time. This data stays on your device and is not sent to me. Details and a switch to turn it off are on the <a href="${ctx.links.cookies}">Cookies</a> page.</p>`],
            ['Your rights', `<p>You have the right to access your data, have it corrected or deleted, restrict its processing, receive it in a portable format, and object to processing based on legitimate interest. Where processing is based on consent, you can withdraw it at any time without affecting what happened before. To use any of these rights, write to ${mail(ctx)}.</p>
                <p>You can also lodge a complaint with a data protection authority. In Poland that is the President of the Personal Data Protection Office (Prezes UODO, ul. Stawki 2, 00-193 Warszawa, <a href="https://uodo.gov.pl" rel="noopener">uodo.gov.pl</a>).</p>
                <p>No decisions about you are made automatically and no profiling takes place.</p>`],
            ['Changes', `<p>If the way the site handles data changes, this page will be updated and the date at the top will change.</p>`]
        ]
    }),

    terms: ctx => ({
        title: 'Terms of use',
        intro: `<p>These terms describe how you can use ${ctx.site} (the landing page, PortfolioOS and the CV). By using the site you accept them; you can stop using it at any time.</p>`,
        sections: [
            ['About the site', `<p>The site is the personal portfolio of ${ctx.name}. It presents projects, experience and contact details, and includes PortfolioOS, a retro desktop with small apps and games. It is free and does not require an account.</p>`],
            ['What you need', `<p>A current web browser. The landing page and the CV work without JavaScript; PortfolioOS, the leaderboards and the anti-spam check need JavaScript turned on. Sending a message needs an e-mail address where I can reply.</p>`],
            ['Content and code', `<p>Texts, the CV and descriptions of projects belong to ${ctx.name}; you may quote and share them with a link to the source. The source code of PortfolioOS is open and available on <a href="${ctx.repo}" rel="noopener">GitHub</a> under the MIT licence. Names and logos of other companies and services belong to their owners.</p>`],
            ['Rules', `<ul>
                    <li>Do not use the contact form to send spam, advertising or anything illegal.</li>
                    <li>Do not try to break, overload or get around the protection of the site or its server.</li>
                    <li>Leaderboard nicknames must not be offensive, impersonate anyone or contain personal data of other people. I can remove any entry or score that breaks these rules or looks fake.</li>
                </ul>`],
            ['External links and embeds', `<p>The site links to other services (GitHub, project demos, sites opened in Internet.exe, music in Tunes). I am not responsible for their content or how they work; their own terms apply.</p>`],
            ['No warranty', `<p>The site, PortfolioOS and the games are provided as they are, for information and fun. I try to keep everything accurate and working, but I cannot promise that it will always be available or free of errors.</p>`],
            ['Complaints and questions', `<p>If something does not work or you want to report a problem, write to ${mail(ctx)}. I reply within 14 days.</p>`],
            ['Changes and law', `<p>These terms may change when the site changes; the current version is always on this page. Polish law applies, without taking away any rights you have under the law of your own country as a consumer.</p>`]
        ]
    }),

    cookies: ctx => ({
        title: 'Cookies and local storage',
        intro: `<p>${ctx.site} does not use cookies for tracking, analytics or advertising. The only things stored in your browser are there because a feature you use needs them.</p>`,
        sections: [
            ['What is stored', `<p>PortfolioOS keeps your settings and progress in your browser's local storage (localStorage and sessionStorage). This data never leaves your device. Cloudflare, which delivers the site, may set a short-lived security cookie to tell people from bots.</p>
                ${storageTable('en')}`],
            ['Why there is no consent banner', `<p>All of the above is strictly necessary for features you ask for (remembering your desktop, the language you chose, protection against attacks), so the law does not require consent for it. You can still switch saving off below or clear it in your browser at any time.</p>`],
            ['Embedded services', `<p>When you open a video, song or website inside Internet.exe or Tunes, it is loaded from that service (for example YouTube in privacy-enhanced mode, Spotify or Vimeo), which may set its own cookies according to its own policy. Nothing is loaded from them until you open it.</p>`],
            ['More', `<p>How personal data is handled is explained in the <a href="${ctx.links.privacy}">Privacy policy</a>.</p>`]
        ]
    })
};

const PL = {
    privacy: ctx => ({
        title: 'Polityka prywatności',
        intro: `<p>Ta strona wyjaśnia, jakie dane osobowe przetwarza ${ctx.site}, po co i jakie masz prawa. W skrócie: nie ma tu analityki, reklam ani śledzenia. Dane zbieram tylko wtedy, gdy do mnie piszesz albo wpisujesz nick do tabeli wyników.</p>`,
        sections: [
            ['Kto odpowiada za dane', `<p>Administratorem Twoich danych osobowych jest ${ctx.name}, który prowadzi tę stronę prywatnie. W każdej sprawie dotyczącej danych napisz na ${mail(ctx)}.</p>`],
            ['Formularz kontaktowy', `<p>Gdy wysyłasz wiadomość, otrzymuję Twoje imię, adres e-mail, wybrany temat i treść. Wiadomość trafia do mojej skrzynki e-mail; nie jest zapisywana w bazie danych na serwerze.</p>
                <p><b>Cel i podstawa prawna:</b> odpowiedź na wiadomość i dalsza rozmowa (art. 6 ust. 1 lit. f RODO, mój prawnie uzasadniony interes w odpowiadaniu na wiadomości), a jeśli piszesz w sprawie pracy lub projektu, także podjęcie działań na Twoje żądanie przed ewentualnym zawarciem umowy (art. 6 ust. 1 lit. b RODO).</p>
                <p><b>Jak długo:</b> tak długo, jak wymaga tego rozmowa, a potem tylko dopóki może być powód, żeby do niej wrócić. W każdej chwili możesz poprosić o usunięcie korespondencji.</p>
                <p>Podanie danych jest dobrowolne, ale bez adresu e-mail nie mogę odpowiedzieć.</p>`],
            ['Tabele wyników w grach', `<p>Gdy zapisujesz wynik w PortfolioOS, na serwerze zapisuje się wpisany nick, wynik i data, a tabela jest widoczna publicznie dla wszystkich. Nic więcej nie jest z nimi zapisywane; jeśli nie chcesz, nie podawaj prawdziwego imienia i nazwiska.</p>
                <p><b>Podstawa prawna:</b> Twoja zgoda wyrażona przez zapisanie wyniku (art. 6 ust. 1 lit. a RODO). Możesz ją w każdej chwili wycofać, prosząc o usunięcie wpisu. Wpisy znikają też same, gdy lepsze wyniki wypchną je z listy.</p>`],
            ['Bezpieczeństwo i logi serwera', `<p>Żeby strona działała i była chroniona przed spamem i atakami, Twój adres IP jest używany na krótko: trzymany w pamięci, żeby ograniczyć liczbę wiadomości i wyników wysyłanych w krótkim czasie, oraz sprawdzany przez Cloudflare Turnstile przed przyjęciem wiadomości. Adres IP nie jest zapisywany w tabeli wyników ani razem z wiadomością.</p>
                <p>Serwer prowadzi krótkie logi techniczne (czas, adres żądania, błędy). Nie zawierają treści wiadomości, a starsze wpisy są automatycznie nadpisywane, gdy log osiągnie niewielki limit rozmiaru.</p>
                <p><b>Podstawa prawna:</b> mój prawnie uzasadniony interes w zapewnieniu bezpieczeństwa strony (art. 6 ust. 1 lit. f RODO).</p>`],
            ['Kto jeszcze przetwarza dane', `<ul>
                    <li><b>Cloudflare, Inc.</b> dostarcza stronę i chroni ją przed atakami (CDN, tunel, test antyspamowy Turnstile). Przetwarza Twój adres IP i dane techniczne połączenia.</li>
                    <li><b>Google (Gmail)</b> dostarcza i przechowuje e-mail z Twoją wiadomością.</li>
                    <li><b>GitHub, Inc.</b> Gdy otwierasz okna projektów w PortfolioOS, Twoja przeglądarka pobiera publiczne dane repozytoriów bezpośrednio z API GitHuba, więc GitHub widzi Twój adres IP.</li>
                    <li><b>Serwisy, które otwierasz sam.</b> Filmy, muzyka i strony otwierane w Internet.exe lub Tunes (YouTube w trybie rozszerzonej prywatności, Spotify, Vimeo, Wikipedia, Internet Archive i każda wpisana przez Ciebie strona) ładują się dopiero, gdy je wybierzesz, i działają według własnych polityk prywatności.</li>
                </ul>
                <p>Część z tych firm ma siedzibę w USA. Przekazanie danych odbywa się na podstawie programu EU-US Data Privacy Framework lub standardowych klauzul umownych Komisji Europejskiej.</p>
                <p>Strona nie używa narzędzi analitycznych, sieci reklamowych, pikseli mediów społecznościowych ani zewnętrznych czcionek.</p>`],
            ['Dane zapisane w przeglądarce', `<p>PortfolioOS zapisuje ustawienia, położenie okien, zmiany na dysku wirtualnym i rekordy gier w Twojej przeglądarce, żeby pulpit wyglądał tak samo przy następnej wizycie. Te dane zostają na Twoim urządzeniu i nie są do mnie wysyłane. Szczegóły i przełącznik do ich wyłączenia są na stronie <a href="${ctx.links.cookies}">Cookies</a>.</p>`],
            ['Twoje prawa', `<p>Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia oraz sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie. Jeśli przetwarzanie opiera się na zgodzie, możesz ją wycofać w dowolnym momencie, bez wpływu na wcześniejsze przetwarzanie. Żeby skorzystać z tych praw, napisz na ${mail(ctx)}.</p>
                <p>Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa, <a href="https://uodo.gov.pl" rel="noopener">uodo.gov.pl</a>).</p>
                <p>Nie podejmuję wobec Ciebie zautomatyzowanych decyzji i nie profiluję.</p>`],
            ['Zmiany', `<p>Jeśli zmieni się sposób przetwarzania danych, ta strona zostanie zaktualizowana, a data na górze się zmieni.</p>`]
        ]
    }),

    terms: ctx => ({
        title: 'Regulamin',
        intro: `<p>Regulamin opisuje zasady korzystania z ${ctx.site} (strony głównej, PortfolioOS i CV). Korzystając ze strony, akceptujesz go; możesz przestać z niej korzystać w każdej chwili.</p>`,
        sections: [
            ['O stronie', `<p>Strona jest osobistym portfolio ${ctx.name}. Prezentuje projekty, doświadczenie i dane kontaktowe, a także PortfolioOS, czyli retro pulpit z małymi aplikacjami i grami. Jest bezpłatna i nie wymaga zakładania konta.</p>`],
            ['Wymagania techniczne', `<p>Aktualna przeglądarka internetowa. Strona główna i CV działają bez JavaScriptu; PortfolioOS, tabele wyników i test antyspamowy wymagają włączonego JavaScriptu. Do wysłania wiadomości potrzebny jest adres e-mail, na który mogę odpowiedzieć.</p>`],
            ['Treści i kod', `<p>Teksty, CV i opisy projektów należą do ${ctx.name}; możesz je cytować i udostępniać z linkiem do źródła. Kod źródłowy PortfolioOS jest otwarty i dostępny na <a href="${ctx.repo}" rel="noopener">GitHubie</a> na licencji MIT. Nazwy i logotypy innych firm i usług należą do ich właścicieli.</p>`],
            ['Zasady', `<ul>
                    <li>Nie używaj formularza kontaktowego do wysyłania spamu, reklam ani treści niezgodnych z prawem.</li>
                    <li>Nie próbuj psuć, przeciążać ani obchodzić zabezpieczeń strony i serwera.</li>
                    <li>Nicki w tabelach wyników nie mogą być obraźliwe, podszywać się pod innych ani zawierać danych osobowych innych osób. Mogę usunąć każdy wpis lub wynik, który łamie te zasady albo wygląda na fałszywy.</li>
                </ul>`],
            ['Linki i treści zewnętrzne', `<p>Strona zawiera linki do innych serwisów (GitHub, wersje demo projektów, strony otwierane w Internet.exe, muzyka w Tunes). Nie odpowiadam za ich treść ani działanie; obowiązują ich własne regulaminy.</p>`],
            ['Brak gwarancji', `<p>Strona, PortfolioOS i gry są udostępniane w obecnej postaci, w celach informacyjnych i dla zabawy. Staram się, żeby wszystko było aktualne i działało, ale nie mogę zagwarantować, że strona zawsze będzie dostępna i wolna od błędów.</p>`],
            ['Reklamacje i pytania', `<p>Jeśli coś nie działa albo chcesz zgłosić problem, napisz na ${mail(ctx)}. Odpowiadam w ciągu 14 dni.</p>`],
            ['Zmiany i prawo', `<p>Regulamin może się zmienić razem ze stroną; aktualna wersja jest zawsze tutaj. Obowiązuje prawo polskie, bez odbierania Ci praw, które jako konsumentowi przysługują Ci na podstawie prawa Twojego kraju.</p>`]
        ]
    }),

    cookies: ctx => ({
        title: 'Cookies i pamięć lokalna',
        intro: `<p>${ctx.site} nie używa cookies do śledzenia, analityki ani reklam. W przeglądarce zapisuje się tylko to, czego potrzebuje funkcja, z której korzystasz.</p>`,
        sections: [
            ['Co jest zapisywane', `<p>PortfolioOS trzyma ustawienia i postępy w pamięci lokalnej przeglądarki (localStorage i sessionStorage). Te dane nigdy nie opuszczają Twojego urządzenia. Cloudflare, który dostarcza stronę, może ustawić krótkotrwałe cookie bezpieczeństwa, żeby odróżnić ludzi od botów.</p>
                ${storageTable('pl')}`],
            ['Dlaczego nie ma banera ze zgodą', `<p>Wszystko powyżej jest niezbędne do działania funkcji, o które prosisz (zapamiętanie pulpitu, wybranego języka, ochrona przed atakami), więc prawo nie wymaga na to zgody. Mimo to możesz wyłączyć zapisywanie poniżej albo w każdej chwili wyczyścić dane w przeglądarce.</p>`],
            ['Osadzone serwisy', `<p>Gdy otwierasz film, utwór lub stronę w Internet.exe albo Tunes, ładuje się ona z danego serwisu (np. YouTube w trybie rozszerzonej prywatności, Spotify, Vimeo), który może ustawić własne cookies według własnej polityki. Nic z tych serwisów nie ładuje się, dopóki tego nie otworzysz.</p>`],
            ['Więcej', `<p>Sposób przetwarzania danych osobowych opisuje <a href="${ctx.links.privacy}">Polityka prywatności</a>.</p>`]
        ]
    })
};
