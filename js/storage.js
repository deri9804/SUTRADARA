const DB_NAME = "TRENDORAAI_DB";
const DB_VERSION = 2;
const STORE_NAME = "storyboard_history";
const IMG_STORE_NAME = "imagegen_history";

function getBrowserHistoryOwnerKey() {
    try {
        const key = 'TRENDORA.browserHistoryOwner';
        let value = localStorage.getItem(key);
        if (!value) {
            value = 'browser-' + (crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(16).slice(2));
            localStorage.setItem(key, value);
        }
        return String(value);
    } catch (e) {
        return '';
    }
}

function getHistoryOwnerId() {
    const active = currentUser && currentUser.loggedIn && currentUser.userId ? String(currentUser.userId) : '';
    return getBrowserHistoryOwnerKey() || active;
}

function getHistoryOwnerCandidates() {
    const candidates = [];
    const browser = getBrowserHistoryOwnerKey();
    if (browser) candidates.push(browser);
    const active = currentUser && currentUser.loggedIn && currentUser.userId ? String(currentUser.userId) : '';
    if (active) candidates.push(active);
    return Array.from(new Set(candidates.filter(Boolean)));
}

function openHistoryDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains(IMG_STORE_NAME)) {
                const store = db.createObjectStore(IMG_STORE_NAME, { keyPath: "id" });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveToHistory(record) {
    try {
        const ownerId = getHistoryOwnerId();
        if (!ownerId || !record) return false;
        record.ownerId = ownerId;
        const db = await openHistoryDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(record);

        // Await transaction completion so write is confirmed
        await new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });

        return true;
    } catch (err) {
        console.warn("Failed to save history to IndexedDB:", err);
        return false;
    }
}

async function loadAllHistory() {
    try {
        const db = await openHistoryDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => {
                const owners = getHistoryOwnerCandidates();
                const items = (request.result || []).filter(item => owners.length && owners.indexOf(String(item.ownerId || '')) >= 0);
                items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                resolve(items);
            };
            request.onerror = () => resolve([]);
        });
    } catch (err) {
        return [];
    }
}

async function deleteHistoryRecord(id) {
    try {
        const db = await openHistoryDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        await new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => {
                const existing = request.result || null;
                const owners = getHistoryOwnerCandidates();
                if (existing && owners.indexOf(String(existing.ownerId || '')) >= 0) store.delete(id);
            };
            request.onerror = () => reject(request.error);
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
        if (currentStoryboardHistoryId === id) currentStoryboardHistoryId = null;
    } catch (err) {
        console.warn("Failed to delete history record:", err);
    }
}

async function getHistoryRecord(id) {
    if (!id) return null;
    try {
        const db = await openHistoryDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        return await new Promise((resolve, reject) => {
            const req = store.get(id);
            req.onsuccess = () => {
                const record = req.result || null;
                if (!record) return resolve(null);
                const owners = getHistoryOwnerCandidates();
                resolve(owners.indexOf(String(record.ownerId || '')) >= 0 ? record : null);
            };
            req.onerror = () => reject(req.error);
        });
    } catch (err) {
        return null;
    }
}

function collectLatestStoryboardImages(count, fallbackImages) {
    const images = [];
    const fallback = Array.isArray(fallbackImages) ? fallbackImages : [];
    const n = Math.max(Number(count) || 0, fallback.length);
    for (let i = 0; i < n; i++) {
        images[i] = getSceneImageDataUrl(i) || fallback[i] || '';
    }
    return images;
}

function migrateStoryboardBreakdown(breakdown, config = {}) {
    if (!breakdown || typeof breakdown !== 'object') return null;
    if (!Array.isArray(breakdown.scenes)) {
        breakdown.scenes = breakdown.scenes && typeof breakdown.scenes === 'object'
            ? Object.values(breakdown.scenes)
            : [];
    }
    if (!Array.isArray(breakdown.hashtags)) {
        breakdown.hashtags = String(breakdown.hashtags || '')
            .split(/\s+/).map(tag => tag.replace(/^#+/, '')).filter(Boolean).map(tag => '#' + tag);
    }
    breakdown.scenes.forEach((scene, index) => {
        if (!scene || typeof scene !== 'object') return;
        scene.sceneNumber = Number(scene.sceneNumber) || index + 1;
        scene.continuityFromPrevious = scene.continuityFromPrevious || (index === 0
            ? 'Opening state established by the story brief.'
            : 'Continue from the previous scene end state without resetting the locked world.');
        scene.continuityToNext = scene.continuityToNext || (index === breakdown.scenes.length - 1
            ? 'Final scene resolves the selected story beat.'
            : 'End on a readable state that motivates the next scene.');
        if (!Array.isArray(scene.shots)) scene.shots = [];
        if (!scene.promptCompiler) {
            scene.promptCompiler = {
                version: 'V4.0-migrated',
                sceneNumber: scene.sceneNumber,
                assetRefs: {},
                blocks: [],
                silentAudio: isSilentAudioMode(config),
                hashtags: breakdown.hashtags
            };
        }
        if (scene.finalAssetState && !scene.finalAssetState.imageDataUrl) {
            delete scene.finalAssetState;
        }
    });
    if (!breakdown.productionPlan) {
        breakdown.productionPlan = {
            mode: config.storyboardMode || 'custom',
            durationPerScene: config.durationPerScene || '10s',
            shotsPerScene: Number(config.shotsPerScene) || Math.max(...breakdown.scenes.map(scene => scene.shots.length), 1),
            scenes: breakdown.scenes.map(scene => ({
                sceneNumber: scene.sceneNumber,
                title: scene.title || '',
                function: scene.sceneVisualPlan?.sceneFunction || scene.storyPurpose || '',
                beat: scene.sceneBeat || '',
                participants: scene.dialoguePlan?.participants || [],
                shotCount: scene.shots.length,
                duration: Number(String(config.durationPerScene || '10').match(/\d+/)?.[0] || 10),
                continuityFromPrevious: scene.continuityFromPrevious,
                continuityToNext: scene.continuityToNext
            }))
        };
    }
    breakdown.schemaVersion = 'V4.0';
    return breakdown;
}

async function persistCurrentStoryboardHistory() {
    if (!state.directorData) return;
    const ep = (state.episodeSeries || []).find(e => e.episode === state.currentEpisode);
    const historyId = currentStoryboardHistoryId || (ep && ep.historyId);
    if (!historyId) return;
    try {
        const existing = await getHistoryRecord(historyId);
        if (!existing) return;
        const sceneCount = (state.directorData.scenes && state.directorData.scenes.length) || existing.sceneCount || 0;
        const images = collectLatestStoryboardImages(sceneCount, existing.images);
        existing.breakdown = state.directorData;
        existing.images = images;
        existing.breakdown = migrateStoryboardBreakdown(existing.breakdown, state);
        existing.breakdown.scenes.forEach((scene, index) => {
            if (images[index]) {
                scene.finalAssetState = Object.assign({}, scene.finalAssetState || {}, {
                    imageDataUrl: images[index],
                    imagePrompt: scene.masterImagePrompt || '',
                    videoPrompt: scene.masterVideoPrompt || '',
                    updatedAt: new Date().toISOString()
                });
            }
        });
        existing.timestamp = new Date().toISOString();
        existing.sceneCount = sceneCount;
        existing.ownerId = getHistoryOwnerId();
        existing.configSnapshot = Object.assign({}, existing.configSnapshot || {}, {
            story: state.story,
            storyboardMode: state.storyboardMode,
            sceneCount: sceneCount,
            shotsPerScene: state.shotsPerScene,
            durationPerScene: state.durationPerScene,
            aspectRatio: state.aspectRatio,
            visualStyle: state.visualStyle,
            customStyle: state.customStyle,
            animationStyle: state.animationStyle,
            animationCustomStyle: state.animationCustomStyle,
            animationGenre: state.animationGenre,
            episodeCount: state.episodeCount,
            currentEpisode: state.currentEpisode,
            seriesPlan: state.seriesPlan,
            audioMode: state.audioMode,
            language: state.language,
            characterNames: getRegisteredCharacterNames(state)
        });
        existing.title = (STORYBOARD_MODE_REGISTRY[state.storyboardMode]?.label || 'Storyboard') + ' · ' + (state.episodeCount > 1 ? ('Ep ' + state.currentEpisode + ': ') : '') + state.story.substring(0, 40) + '...';
        await saveToHistory(existing);
        currentStoryboardHistoryId = historyId;
        if (ep) {
            ep.breakdown = state.directorData;
            ep.images = images;
            ep.historyId = historyId;
        }
    } catch (err) {
        console.warn("Failed to persist storyboard history update:", err);
    }
}

async function saveImageGenHistory(record) {
    try {
        const ownerId = getHistoryOwnerId();
        if (!ownerId || !record) return false;
        record.ownerId = ownerId;
        const db = await openHistoryDB();
        const tx = db.transaction(IMG_STORE_NAME, "readwrite");
        const store = tx.objectStore(IMG_STORE_NAME);
        store.put(record);
        await new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        return true;
    } catch (err) {
        console.warn('Failed to save image gen history:', err);
        return false;
    }
}

async function loadAllImageGenHistory() {
    try {
        const db = await openHistoryDB();
        const tx = db.transaction(IMG_STORE_NAME, 'readonly');
        const store = tx.objectStore(IMG_STORE_NAME);
        const records = await new Promise((resolve, reject) => {
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
        const owners = getHistoryOwnerCandidates();
        return records.filter(record => owners.length && owners.indexOf(String(record.ownerId || '')) >= 0)
            .sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));
    } catch (err) {
        console.warn('Failed to load image gen history:', err);
        return [];
    }
}

async function getImageGenHistoryRecord(id) {
    try {
        const db = await openHistoryDB();
        const tx = db.transaction(IMG_STORE_NAME, 'readonly');
        const store = tx.objectStore(IMG_STORE_NAME);
        return await new Promise((resolve, reject) => {
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    } catch (err) {
        return null;
    }
}

/* ----------------------------------------------------------------- */
/* AUTHENTICATION & SESSION LIFECYCLE MANAGEMENT                      */
/* ----------------------------------------------------------------- */
function withAuthTimeout(promise, label, timeoutMs = 15000) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(label + ' timeout.')), timeoutMs);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

window.addEventListener('load', async () => {
    logSupabaseDiagnostics();
    migrateRememberedSessionToLocalStorage();
    initPillSelectors();
    updateSummaryPill();
    initSidebarState();
    showSessionCheckView();

    if (supabaseClient) {
        try {
            supabaseClient.auth.onAuthStateChange(async (event, session) => {
                if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && session.user) {
                    if (currentUser.loggedIn && currentUser.userId === session.user.id) return;
                    await handleSupabaseUserSession(session.user);
                } else if (event === 'SIGNED_OUT') {
                    resetUserSession();
                    showAuthView();
                }
            });

            const { data: { session } } = await withAuthTimeout(supabaseClient.auth.getSession(), 'Pembacaan sesi Supabase');
            if (session && session.user) {
                await handleSupabaseUserSession(session.user);
            } else {
                showAuthView();
            }

        } catch (err) {
            console.warn("[Supabase Auth] Session init failed:", err.message);
            showAuthView();
        }
    } else {
        showAuthView();
    }
});

let profileSessionLock = null;
let deviceLimitBlockedUserId = null;
let deviceWatchTimer = null;
let deviceWatchUserId = null;
let deviceWatchDeviceId = null;
let deviceWatchInFlight = false;
let deviceRealtimeChannel = null;
let deviceRealtimeUserId = null;
let deviceRealtimeDeviceId = null;
const DEVICE_WATCH_INTERVAL_MS = 5000;