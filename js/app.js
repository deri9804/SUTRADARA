function setMobileDrawer(open, restoreFocus = true) {
    const phone = window.matchMedia('(max-width: 767px)').matches;
    open = phone && open;
    document.body.classList.toggle('mobile-menu-open', open);
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) {
        // V5.0 (Mobile Fix #2): the `inert` attribute is only
        // supported on iOS Safari 15.4+ and modern Android
        // browsers. On older devices, the sidebar may stay
        // clickable when the drawer is supposed to be closed,
        // or vice versa. We feature-detect and fall back to
        // aria-hidden + tabindex which Safari has supported
        // since iOS 7.
        const shouldHide = phone && !open;
        try {
            if ('inert' in HTMLElement.prototype) {
                sidebar.inert = shouldHide;
            } else {
                if (shouldHide) {
                    sidebar.setAttribute('aria-hidden', 'true');
                    sidebar.setAttribute('tabindex', '-1');
                } else {
                    sidebar.removeAttribute('aria-hidden');
                    sidebar.removeAttribute('tabindex');
                }
            }
        } catch (_) {
            // Old WebKit may throw on inert assignment — fall
            // back gracefully to the aria path above.
            if (shouldHide) {
                sidebar.setAttribute('aria-hidden', 'true');
                sidebar.setAttribute('tabindex', '-1');
            } else {
                sidebar.removeAttribute('aria-hidden');
                sidebar.removeAttribute('tabindex');
            }
        }
    }
    const toggle = document.getElementById('sidebarToggle');
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-controls', 'appSidebar');
    toggle?.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    updateSidebarToggleIcon();
    if (open) sidebar?.querySelector('button')?.focus();
    else if (restoreFocus && phone) toggle?.focus();
}
(function initPhoneLayout() {
    const sidebar = document.getElementById('appSidebar');
    if (!sidebar) return;
    sidebar.parentElement.classList.add('mobile-workspace');
    const backdrop = document.createElement('button');
    backdrop.id = 'mobileMenuBackdrop';
    backdrop.type = 'button';
    backdrop.setAttribute('aria-label', 'Tutup menu');
    backdrop.onclick = () => setMobileDrawer(false);
    document.body.appendChild(backdrop);
    const brand = document.createElement('span');
    brand.className = 'mobile-brand-name';
    brand.textContent = 'TRENDORA AI';
    document.querySelector('#appHeader [onclick="handleLogoClick()"]')?.appendChild(brand);
    sidebar.addEventListener('click', event => {
        if (window.matchMedia('(max-width: 767px)').matches && event.target.closest('.nav-subitem, .nav-top-item')) {
            // V5.0 (Mobile Fix #5): 150ms delay before closing
            // the drawer so the navigation handler has time to
            // commit. On slower Android WebView builds the
            // tap event and the route change race; closing
            // the drawer first looks to them like the menu
            // "didn't open" because the next view appears to
            // come from nowhere. 150ms is below the human
            // perception threshold for lag but well above
            // the navigation commit window.
            setTimeout(() => setMobileDrawer(false), 150);
        }
    });
    document.addEventListener('keydown', event => {
        if (!document.body.classList.contains('mobile-menu-open')) return;
        if (event.key === 'Escape') { setMobileDrawer(false); return; }
        if (event.key === 'Tab') {
            const buttons = [...sidebar.querySelectorAll('button, a[href]')].filter(el => el.getClientRects().length && !el.disabled);
            const first = buttons[0], last = buttons[buttons.length - 1];
            if (!first) return;
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    });
    const tabs = document.createElement('div');
    tabs.id = 'mobileRefTabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Kategori foto referensi');
    const categories = [['inputCharRef', 'badgeCharRef', 'Karakter'], ['inputProductRef', 'badgeProductRef', 'Produk'], ['inputLocRef', 'badgeLocRef', 'Lokasi']];
    const panels = categories.map(([id]) => document.getElementById(id)?.parentElement);
    if (panels.every(Boolean)) {
        panels[0].parentElement.before(tabs);
        categories.forEach(([id, badgeId, label], index) => {
            const panel = panels[index]; panel.classList.add('mobile-ref-panel'); panel.id = 'mobileRefPanel' + index;
            const button = document.createElement('button'); button.type = 'button'; button.id = 'mobileRefTab' + index;
            button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', panel.id);
            const syncCount = () => { button.textContent = label + ' ' + document.getElementById(badgeId).textContent.trim(); };
            syncCount(); new MutationObserver(syncCount).observe(document.getElementById(badgeId), { childList: true, subtree: true, characterData: true });
            button.onclick = () => { panels.forEach((p, i) => { p.classList.toggle('mobile-ref-active', i === index); tabs.children[i].setAttribute('aria-selected', String(i === index)); tabs.children[i].tabIndex = i === index ? 0 : -1; }); };
            button.onkeydown = event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3; tabs.children[next].click(); tabs.children[next].focus(); } };
            tabs.appendChild(button);
        });
        tabs.children[0].click();
    }
    const heading = [...document.querySelectorAll('#creatorFormView h3')].find(el => el.textContent.includes('STORYBOARD SETTINGS'));
    if (heading) {
        const panel = heading.parentElement; panel.classList.add('mobile-settings-panel');
        const button = document.createElement('button'); button.type = 'button'; button.className = 'mobile-settings-toggle';
        const update = () => { const open = panel.classList.contains('mobile-settings-open'); button.textContent = open ? 'Pengaturan storyboard ?' : 'Pengaturan storyboard +'; button.setAttribute('aria-expanded', String(open)); };
        button.onclick = () => { panel.classList.toggle('mobile-settings-open'); update(); };
        panel.prepend(button); update();
    }
    const media = window.matchMedia('(max-width: 767px)');
    media.addEventListener('change', () => setMobileDrawer(false, false));
    new MutationObserver(() => { if (document.body.classList.contains('show-auth') && document.body.classList.contains('mobile-menu-open')) setMobileDrawer(false, false); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    setMobileDrawer(false, false);
})();