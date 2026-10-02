/* ----------------------------------------------------------------- */
/* PHASE 6A.2: APP SIDEBAR NAVIGATION                                */
/* ----------------------------------------------------------------- */

const sidebarState = {
    minimized: false,
    expandedGroups: { storyboard: true, imageGen: true },
    activeKey: null
};

function toggleSidebar() {
    if (window.matchMedia("(max-width: 767px)").matches) { setMobileDrawer(!document.body.classList.contains("mobile-menu-open")); return; }
    sidebarState.minimized = !sidebarState.minimized;
    document.body.classList.toggle('sidebar-minimized', sidebarState.minimized);
    updateSidebarToggleIcon();
}

function updateSidebarToggleIcon() {
    if (window.matchMedia("(max-width: 767px)").matches) {
        const mobileIcon = document.getElementById("sidebarToggleIcon");
        if (mobileIcon) mobileIcon.className = "fa-solid " + (document.body.classList.contains("mobile-menu-open") ? "fa-xmark" : "fa-bars");
        return;
    }
    document.getElementById("sidebarToggleIcon")?.classList.remove("fa-bars", "fa-xmark");
    const icon = document.getElementById('sidebarToggleIcon');
    if (!icon) return;
    if (sidebarState.minimized) {
        icon.classList.remove('fa-angles-left');
        icon.classList.add('fa-angles-right');
    } else {
        icon.classList.remove('fa-angles-right');
        icon.classList.add('fa-angles-left');
    }
}

function toggleNavGroup(slug) {
    if (sidebarState.minimized) {
        // In minimized state, expand temporarily so user can see submenu.
        document.body.classList.remove('sidebar-minimized');
        sidebarState.minimized = false;
        updateSidebarToggleIcon();
    }
    sidebarState.expandedGroups[slug] = !sidebarState.expandedGroups[slug];
    const submenu = document.getElementById('navGroup' + slug.charAt(0).toUpperCase() + slug.slice(1));
    if (submenu) {
        if (sidebarState.expandedGroups[slug]) {
            submenu.classList.add('open');
        } else {
            submenu.classList.remove('open');
        }
    }
    // Rotate chevron of the parent button
    const header = submenu ? submenu.previousElementSibling : null;
    if (header) {
        const chevron = header.querySelector('.nav-chevron');
        if (chevron) {
            chevron.style.transform = sidebarState.expandedGroups[slug] ? 'rotate(0deg)' : 'rotate(-90deg)';
        }
    }
}

function setActiveSidebarItem(key) {
    sidebarState.activeKey = key;
    document.querySelectorAll('[data-nav-key], .nav-group-header').forEach(el => {
        el.removeAttribute('data-active');
    });
    if (key) {
        const activeEl = document.querySelector('[data-nav-key="' + key + '"]');
        if (activeEl) {
            activeEl.setAttribute('data-active', 'true');
            // Highlight parent group header too so the active context is visible.
            const parentGroup = activeEl.closest('.nav-group');
            if (parentGroup) {
                const header = parentGroup.querySelector('.nav-group-header');
                if (header) header.setAttribute('data-active', 'true');
            }
        }
    }
}

function expandNavGroup(slug) {
    sidebarState.expandedGroups[slug] = true;
    const submenu = document.getElementById('navGroup' + slug.charAt(0).toUpperCase() + slug.slice(1));
    if (submenu) submenu.classList.add('open');
    const header = submenu ? submenu.previousElementSibling : null;
    if (header) {
        const chevron = header.querySelector('.nav-chevron');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
}

function navGoStoryboard() {
    const restoredModeKey = STORYBOARD_MODE_REGISTRY[state.storyboardMode]?.navKey || 'storyboard-create';
    setActiveViewKey(restoredModeKey);
    setActiveSidebarItem(restoredModeKey);
    expandNavGroup('storyboard');
    showAppView();
}

function applyStoryboardModeStyleDefaults(mode) {
    state.visualStyle = mode === 'animation'
        ? (state.animationStyle || 'Auto Director Animation')
        : 'Auto';
    // V5.0 (Isu #2): switching storyboard mode always clears the
    // overlay opt-in flag — the user has to re-enable it per mode.
    state.visualStyleExplicitOverlay = false;
    if (mode !== 'animation') state.customStyle = '';
    const animationSection = document.getElementById('animationStyleSection');
    if (animationSection) animationSection.classList.toggle('hidden', mode !== 'animation');
    const animationStyleSelect = document.getElementById('selectAnimationStyle');
    if (animationStyleSelect) animationStyleSelect.value = state.animationStyle || 'Auto Director Animation';
    const animationGenreSelect = document.getElementById('selectAnimationGenre');
    if (animationGenreSelect) animationGenreSelect.value = state.animationGenre || 'Auto Director Detection';
    syncAnimationCustomStyleUI();
}

function selectStoryboardMode(mode) {
    const profile = STORYBOARD_MODE_REGISTRY[mode];
    if (!profile) throw new Error('Mode storyboard tidak dikenal: ' + mode);
    state.storyboardMode = mode;
    applyStoryboardModeStyleDefaults(mode);
    const title = document.getElementById('storyboardPageTitle');
    const focus = document.getElementById('storyboardModeFocus');
    if (title) title.textContent = profile.label;
    if (focus) focus.textContent = profile.focus;
    updateSummaryPill();
}

function navGoStoryboardMode(mode) {
    const profile = STORYBOARD_MODE_REGISTRY[mode];
    if (!profile) throw new Error('Mode storyboard tidak dikenal: ' + mode);
    if (storyboardGenerating && storyboardGenerationMode && storyboardGenerationMode !== mode) {
        showCanvasNotice('Pembuatan ' + (STORYBOARD_MODE_REGISTRY[storyboardGenerationMode]?.label || 'storyboard') + ' masih berjalan. Kembali ke menu tersebut untuk melihat prosesnya.');
        return;
    }
    if (state.storyboardMode !== mode) {
        try { persistCurrentStoryboardHistory(); } catch (_) {}
        saveStoryboardSession(state.storyboardMode);
        restoreStoryboardSession(mode);
    }
    setActiveViewKey(profile.navKey);
    setActiveSidebarItem(profile.navKey);
    selectStoryboardMode(mode);
    expandNavGroup('storyboard');
    showAppView();
}

// ============================================================
// SWITCH MODE WITH FULL TRANSFER (used by menu mismatch popup)
// ============================================================
// navGoStoryboardMode only updates title/focus but never refreshes
// the pill selectors, dropdowns, or forces the form view to be
// visible — it lets showAppView route by directorData. For a
// user-driven menu switch (e.g. "Pindah" from the mismatch
// warning), we need EVERY form control to reflect the restored
// session state, and we want the creator form (not the result
// view) to land on.
function buildStoryboardTransferSession(sourceState) {
    const out = {};
    const keys = [
        'story', 'sceneCount', 'shotsPerScene', 'durationPerScene', 'aspectRatio',
        'audioMode', 'language', 'visualStyle', 'customStyle',
        'animationStyle', 'animationCustomStyle', 'animationGenre',
        'episodeCount', 'currentEpisode', 'episodeBible', 'seriesPlan',
        'productLock'
    ];
    keys.forEach(k => {
        if (k in sourceState) {
            if (Array.isArray(sourceState[k])) out[k] = sourceState[k].slice();
            else if (sourceState[k] && typeof sourceState[k] === 'object') out[k] = Object.assign({}, sourceState[k]);
            else out[k] = sourceState[k];
        }
    });
    out.characterReference = Array.isArray(sourceState.characterReference) ? sourceState.characterReference.slice() : [];
    out.productReference = Array.isArray(sourceState.productReference) ? sourceState.productReference.slice() : [];
    out.locationReference = Array.isArray(sourceState.locationReference) ? sourceState.locationReference.slice() : [];
    // NOTE: directorData / episodePlate / episodeSeries / historyId
    // are intentionally NOT transferred — they belong to a
    // generated storyboard, not to user inputs. The target mode
    // will need a fresh generation.
    return out;
}

function refreshStoryboardFormUI() {
    try {
        setPillValue('#selectorScenes', state.sceneCount, 'sceneCount');
        setPillValue('#selectorFrames', state.shotsPerScene, 'shotsPerScene');
        setPillValue('#selectorDuration', state.durationPerScene, 'durationPerScene');
        setPillValue('#selectorRatio', state.aspectRatio, 'aspectRatio');
        setPillValue('#selectorEpisodes', state.episodeCount, 'episodeCount');
    } catch (_) {}
    try {
        const audioSelect = document.getElementById('selectAudioMode');
        if (audioSelect) audioSelect.value = state.audioMode || (audioSelect.options[0] && audioSelect.options[0].value);
    } catch (_) {}
    try {
        const languageSelect = document.getElementById('selectLanguage');
        if (languageSelect) languageSelect.value = state.language || (languageSelect.options[0] && languageSelect.options[0].value);
    } catch (_) {}
    try {
        const customStyleInput = document.getElementById('customStyleInput');
        if (customStyleInput) customStyleInput.value = state.customStyle || '';
    } catch (_) {}
    try {
        const promptInput = document.getElementById('promptInput');
        if (promptInput) promptInput.value = state.story || '';
    } catch (_) {}
    try {
        updateSummaryPill();
    } catch (_) {}
}

function switchStoryboardModeWithTransfer(targetMode) {
    const profile = STORYBOARD_MODE_REGISTRY[targetMode];
    if (!profile) throw new Error('Mode storyboard tidak dikenal: ' + targetMode);

    // 1. Snapshot the current mode (for undo/restore) and the
    //    target mode (so restoreStoryboardSession has something
    //    to read instead of resetting to defaults).
    try { persistCurrentStoryboardHistory(); } catch (_) {}
    saveStoryboardSession(state.storyboardMode);
    state.storyboardSessions[targetMode] = buildStoryboardTransferSession(state);

    // 2. Flip the active mode and restore the target session.
    state.storyboardMode = targetMode;
    restoreStoryboardSession(targetMode);

    // 3. Update header / sidebar / title / focus.
    setActiveViewKey(profile.navKey);
    setActiveSidebarItem(profile.navKey);
    try {
        const title = document.getElementById('storyboardPageTitle');
        const focus = document.getElementById('storyboardModeFocus');
        if (title) title.textContent = profile.label;
        if (focus) focus.textContent = profile.focus;
    } catch (_) {}
    applyStoryboardModeStyleDefaults(targetMode);
    expandNavGroup('storyboard');

    // 4. Force the creator form view (NOT result/loading) so the
    //    user can review inputs and click Generate again.
    try { hideMainViews(); } catch (_) {}
    try {
        const form = document.getElementById('creatorFormView');
        if (form) form.classList.remove('hidden');
        const result = document.getElementById('resultView');
        if (result) result.classList.add('hidden');
        const loading = document.getElementById('loadingView');
        if (loading) loading.classList.add('hidden');
    } catch (_) {}
    try {
        document.getElementById('userNavMenu')?.classList.remove('hidden');
        document.getElementById('userDropdown')?.classList.add('hidden');
        showAppHeader();
    } catch (_) {}

    // 5. Refresh every form control from the restored state.
    refreshStoryboardFormUI();
}

function resetActiveStoryboardSession() {
    state.story = '';
    state.directorData = null;
    state.currentEpisode = 1;
    state.episodeBible = null;
    state.seriesPlan = null;
    state.episodePlate = null;
    state.episodeSeries = [];
    currentStoryboardHistoryId = null;
    resetProductLock();
    const prompt = document.getElementById('promptInput');
    if (prompt) prompt.value = '';
    hideMainViews();
}

function saveStoryboardSession(mode) {
    if (!mode) return;
    const prompt = document.getElementById('promptInput');
    state.storyboardSessions[mode] = {
        story: state.story || (prompt && prompt.value) || '',
        sceneCount: state.sceneCount,
        shotsPerScene: state.shotsPerScene,
        durationPerScene: state.durationPerScene,
        aspectRatio: state.aspectRatio,
        audioMode: state.audioMode,
        language: state.language,
        visualStyle: state.visualStyle,
        customStyle: state.customStyle,
        animationStyle: state.animationStyle,
        animationCustomStyle: state.animationCustomStyle,
        animationGenre: state.animationGenre,
        characterReference: Array.isArray(state.characterReference) ? state.characterReference.slice() : [],
        productReference: Array.isArray(state.productReference) ? state.productReference.slice() : [],
        locationReference: Array.isArray(state.locationReference) ? state.locationReference.slice() : [],
        productLock: Object.assign({}, state.productLock || {}),
        episodeCount: state.episodeCount,
        currentEpisode: state.currentEpisode,
        episodeBible: state.episodeBible,
        seriesPlan: state.seriesPlan,
        episodePlate: state.episodePlate,
        episodeSeries: state.episodeSeries,
        directorData: state.directorData,
        historyId: currentStoryboardHistoryId
    };
}

function restoreStoryboardSession(mode) {
    const session = state.storyboardSessions[mode];
    state.storyboardMode = mode;
    if (!session) {
        state.story = '';
        state.directorData = null;
        state.sceneCount = DEFAULT_STORYBOARD_SETTINGS.sceneCount;
        state.shotsPerScene = DEFAULT_STORYBOARD_SETTINGS.shotsPerScene;
        state.durationPerScene = DEFAULT_STORYBOARD_SETTINGS.durationPerScene;
        state.aspectRatio = DEFAULT_STORYBOARD_SETTINGS.aspectRatio;
        state.audioMode = DEFAULT_STORYBOARD_SETTINGS.audioMode;
        state.language = DEFAULT_STORYBOARD_SETTINGS.language;
        state.visualStyle = DEFAULT_STORYBOARD_SETTINGS.visualStyle;
        state.visualStyleExplicitOverlay = DEFAULT_STORYBOARD_SETTINGS.visualStyleExplicitOverlay;
        state.customStyle = '';
        state.animationStyle = 'Auto Director Animation';
        state.animationCustomStyle = '';
        state.animationGenre = 'Auto Director Detection';
        state.characterReference = [];
        state.productReference = [];
        state.locationReference = [];
        state.productLock = { name: '', brand: '', size: '', material: '', color: '', texture: '', keyDetails: '' };
        const productSizeInput = document.getElementById('productSizeInput');
        if (productSizeInput) productSizeInput.value = '';
        state.episodeCount = DEFAULT_STORYBOARD_SETTINGS.episodeCount;
        state.currentEpisode = 1;
        state.episodeBible = null;
        state.seriesPlan = null;
        state.episodePlate = null;
        state.episodeSeries = [];
        currentStoryboardHistoryId = null;
    } else {
        Object.keys(session).forEach(key => {
            if (key === 'historyId') return;
            if (Array.isArray(session[key])) state[key] = session[key].slice();
            else if (session[key] && typeof session[key] === 'object') state[key] = Object.assign({}, session[key]);
            else state[key] = session[key];
        });
        currentStoryboardHistoryId = session.historyId || null;
        const productSizeInput = document.getElementById('productSizeInput');
        if (productSizeInput) productSizeInput.value = (state.productLock && state.productLock.size) || '';
    }
    const prompt = document.getElementById('promptInput');
    if (prompt) prompt.value = state.story || '';
    resetProductReferenceInputs();
    ['characterReference', 'productReference', 'locationReference'].forEach(updateRefCardUI);
    updateSummaryPill();
}

function resetProductReferenceInputs() {
    ['inputCharRef', 'inputProductRef', 'inputLocRef'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
}

function navGoHistory() {
    setActiveViewKey('history-view');
    setActiveSidebarItem('history-view');
    showHistoryView();
}

function navGoVideoMerge() {
    if (!videoMergeBusy) clearVideoMergeQueue();
    setActiveViewKey('videoTools-merge');
    setActiveSidebarItem('videoTools-merge');
    expandNavGroup('videoTools');
    showVideoToolsView();
}

function showVideoToolsView() {
    if (!currentUser.loggedIn || currentUser.status !== 'active') {
        showAuthView();
        return;
    }
    hideMainViews();
    showAppHeader();
    const v = document.getElementById('videoToolsView');
    if (v) v.classList.remove('hidden');
    document.getElementById('userNavMenu').classList.remove('hidden');
    document.getElementById('userDropdown').classList.add('hidden');
    renderVideoMergeList();
    updateVideoMergeControls();
}

function showHistoryView() {
    if (!currentUser.loggedIn || currentUser.status !== 'active') {
        showAuthView();
        return;
    }
    hideMainViews();
    showAppHeader();
    const hv = document.getElementById('historyView');
    if (hv) hv.classList.remove('hidden');
    document.getElementById('userNavMenu').classList.remove('hidden');
    document.getElementById('userDropdown').classList.add('hidden');
    document.getElementById('historyFilter') && (document.getElementById('historyFilter').value = 'all');
    renderUnifiedHistoryView();
}

function navGoFotoGenerate() {
    setActiveViewKey('imageGen-foto');
    setActiveSidebarItem('imageGen-foto');
    expandNavGroup('imageGen');
    showImageGenView();
    // Ensure the FotoGenerate form is shown when navigating via sidebar.
    if (typeof selectImageGenTool === 'function') {
        selectImageGenTool('foto');
    }
}

function navGoThumbnail() {
    setActiveViewKey('imageGen-thumbnail');
    setActiveSidebarItem('imageGen-thumbnail');
    expandNavGroup('imageGen');
    showImageGenView();
    if (typeof selectImageGenTool === 'function') {
        selectImageGenTool('thumbnail');
    }
}

function navGoInfographic() {
    setActiveViewKey('imageGen-infographic');
    setActiveSidebarItem('imageGen-infographic');
    expandNavGroup('imageGen');
    showImageGenView();
    if (typeof selectImageGenTool === 'function') {
        selectImageGenTool('infographic');
    }
}

function navGoUGC() {
    setActiveViewKey('imageGen-ugc');
    setActiveSidebarItem('imageGen-ugc');
    expandNavGroup('imageGen');
    showImageGenView();
    if (typeof selectImageGenTool === 'function') {
        selectImageGenTool('ugc');
    }
}

function navGoCharacter() {
    setActiveViewKey('imageGen-character');
    setActiveSidebarItem('imageGen-character');
    expandNavGroup('imageGen');
    showImageGenView();
    if (typeof selectImageGenTool === 'function') {
        selectImageGenTool('character');
    }
}

async function navGoAdmin() {
    if (!currentUser.loggedIn || currentUser.status !== 'active') {
        showAuthView();
        return;
    }
    // Server-side database re-verification: prevents F12 console role elevation
    try {
        if (!supabaseClient) throw new Error('Supabase client unavailable');
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session || !session.user) {
            showAuthView();
            return;
        }
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('role, status')
            .eq('id', session.user.id)
            .maybeSingle();

        if (error || !profile || profile.status !== 'active' || profile.role !== 'admin') {
            console.warn('[Security Guard] Unauthorized attempt to access admin view blocked.');
            currentUser.role = profile?.role || 'member';
            updateSidebarRoleVisibility();
            if (typeof showCanvasNotice === 'function') {
                showCanvasNotice('Akses Ditolak: Akun Anda bukan Administrator.', 'error');
            }
            showHomeView();
            return;
        }
        currentUser.role = 'admin';
    } catch (e) {
        console.error('[Security Guard]', e);
        showHomeView();
        return;
    }
    setActiveViewKey('admin');
    setActiveSidebarItem('admin');
    showAdminView();
}

function updateSidebarRoleVisibility() {
    const adminItem = document.getElementById('sidebarAdminPanel');
    if (!adminItem) return;
    if (currentUser.loggedIn && currentUser.status === 'active' && currentUser.role === 'admin') {
        adminItem.style.display = '';
    } else {
        adminItem.style.display = 'none';
    }
}

function initSidebarState() {
    // Phone drawer does not change the desktop sidebar preference.
    // Apply chevron rotation based on initial expandedGroups
    Object.keys(sidebarState.expandedGroups).forEach(slug => {
        const submenu = document.getElementById('navGroup' + slug.charAt(0).toUpperCase() + slug.slice(1));
        if (submenu) {
            if (sidebarState.expandedGroups[slug]) submenu.classList.add('open');
            const header = submenu.previousElementSibling;
            if (header) {
                const chevron = header.querySelector('.nav-chevron');
                if (chevron) {
                    chevron.style.transform = sidebarState.expandedGroups[slug] ? 'rotate(0deg)' : 'rotate(-90deg)';
                }
            }
        }
    });
    updateSidebarRoleVisibility();
}

/* ----------------------------------------------------------------- */
/* PHASE 6A.2B: ACTIVE VIEW PERSISTENCE (localStorage)               */
/* ----------------------------------------------------------------- */

const ACTIVE_VIEW_STORAGE_KEY = 'TRENDORA.activeView';

function setActiveViewKey(key) {
    try {
        if (key) localStorage.setItem(ACTIVE_VIEW_STORAGE_KEY, key);
        else localStorage.removeItem(ACTIVE_VIEW_STORAGE_KEY);
    } catch (e) { /* localStorage may be disabled */ }
}

function getActiveViewKey() {
    try {
        return localStorage.getItem(ACTIVE_VIEW_STORAGE_KEY);
    } catch (e) {
        return null;
    }
}

function clearActiveViewKey() {
    try { localStorage.removeItem(ACTIVE_VIEW_STORAGE_KEY); } catch (e) {}
}

const VALID_ACTIVE_KEYS = ['storyboard-create', 'storyboard-commercial', 'storyboard-drama', 'storyboard-animation', 'storyboard-shortFilm', 'storyboard-education', 'storyboard-documentary', 'storyboard-custom', 'imageGen-foto', 'imageGen-thumbnail', 'imageGen-infographic', 'imageGen-ugc', 'imageGen-character', 'imageGen-poster', 'videoTools-merge', 'history-view', 'voiceover', 'admin'];

function restoreActiveView(role) {
    const saved = getActiveViewKey();
    if (!saved || !VALID_ACTIVE_KEYS.includes(saved)) {
        clearActiveViewKey();
        return false;
    }
    // Role check — members cannot restore admin.
    if (saved === 'admin' && role !== 'admin') {
        clearActiveViewKey();
        return false;
    }
    // Block restoration for unauthenticated / non-active sessions.
    if (!currentUser.loggedIn || currentUser.status !== 'active') {
        return false;
    }

    // Set active BEFORE calling view switcher so the view switcher doesn't override.
    setActiveSidebarItem(saved);

    switch (saved) {
        case 'storyboard-create':
            expandNavGroup('storyboard');
            showAppView();
            return true;
        case 'storyboard-commercial':
        case 'storyboard-drama':
        case 'storyboard-animation':
        case 'storyboard-shortFilm':
        case 'storyboard-education':
        case 'storyboard-documentary':
        case 'storyboard-custom':
            selectStoryboardMode(saved.replace('storyboard-', ''));
            expandNavGroup('storyboard');
            showAppView();
            return true;
        case 'imageGen-foto':
            expandNavGroup('imageGen');
            showImageGenView();
            if (typeof selectImageGenTool === 'function') selectImageGenTool('foto');
            return true;
        case 'imageGen-thumbnail':
            expandNavGroup('imageGen');
            showImageGenView();
            if (typeof selectImageGenTool === 'function') selectImageGenTool('thumbnail');
            return true;
        case 'imageGen-infographic':
            expandNavGroup('imageGen');
            showImageGenView();
            if (typeof selectImageGenTool === 'function') selectImageGenTool('infographic');
            return true;
        case 'imageGen-ugc':
            expandNavGroup('imageGen');
            showImageGenView();
            if (typeof selectImageGenTool === 'function') selectImageGenTool('ugc');
            return true;
        case 'imageGen-character':
            expandNavGroup('imageGen');
            showImageGenView();
            if (typeof selectImageGenTool === 'function') selectImageGenTool('character');
            return true;
        case 'imageGen-poster':
            expandNavGroup('imageGen');
            showImageGenView();
            if (typeof selectImageGenTool === 'function') selectImageGenTool('poster');
            return true;
        case 'history-view':
            setActiveSidebarItem('history-view');
            if (typeof showHistoryView === 'function') showHistoryView();
            return true;
        case 'voiceover':
            setActiveSidebarItem('voiceover');
            if (typeof showVoiceOverView === 'function') showVoiceOverView();
            return true;
        case 'videoTools-merge':
            expandNavGroup('videoTools');
            setActiveSidebarItem('videoTools-merge');
            if (typeof showVideoToolsView === 'function') showVideoToolsView();
            return true;
        case 'admin':
            showAdminView();
            return true;
    }
    return false;
}
