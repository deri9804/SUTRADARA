/* ----------------------------------------------------------------- */
/* CENTRAL STATE OBJECT (PHASE 1 - SOURCE OF TRUTH)                  */
/* ----------------------------------------------------------------- */
const STORYBOARD_MODE_REGISTRY = Object.freeze({
    commercial: { label: 'Pembuatan Video Iklan', navKey: 'storyboard-commercial', focus: 'Iklan: hook, masalah, solusi, benefit, dan CTA.' },
    drama: { label: 'Pembuatan Konten Kreatif', navKey: 'storyboard-drama', focus: 'Cerita, komedi, horor, podcast, monolog, dan berbagai konten video.' },
    animation: { label: 'Pembuatan Video Animasi', navKey: 'storyboard-animation', focus: 'Animasi: aksi visual, ekspresi, staging, dan timing.' },
    shortFilm: { label: 'Pembuatan Film Pendek', navKey: 'storyboard-shortFilm', focus: 'Film pendek: alur, turning point, klimaks, dan resolusi.' },
    education: { label: 'Pembuatan Video Edukasi', navKey: 'storyboard-education', focus: 'Edukasi: tujuan belajar, penjelasan, contoh, dan rangkuman.' },
    documentary: { label: 'Pembuatan Video Dokumenter', navKey: 'storyboard-documentary', focus: 'Dokumenter: fakta, narasi, konteks, dan urutan informasi.' },
    custom: { label: 'Storyboard Custom', navKey: 'storyboard-custom', focus: 'Custom: aturan produksi ditentukan oleh pengguna.' }
});

const DEFAULT_STORYBOARD_SETTINGS = Object.freeze({
    sceneCount: 2,
    shotsPerScene: 5,
    durationPerScene: '10s',
    aspectRatio: '9:16',
    episodeCount: 1,
    audioMode: 'Auto Director (Kontekstual)',
    language: 'Bahasa Indonesia (Gen Z)',
    // V5.0 (Isu #2): default visual style is NEVER Auto Caption
    // Overlay. The overlay mode must be opted into explicitly per
    // storyboard; loading the app or starting a fresh storyboard
    // never inherits it.
    visualStyle: 'Auto',
    // V5.0 (Isu #2): explicit opt-in flag for the overlay mode.
    // Stays false unless the user clicks the overlay button.
    visualStyleExplicitOverlay: false
});

const state = {
    storyboardMode: 'custom',
    story: "",
    sceneCount: DEFAULT_STORYBOARD_SETTINGS.sceneCount,
    shotsPerScene: DEFAULT_STORYBOARD_SETTINGS.shotsPerScene,
    durationPerScene: DEFAULT_STORYBOARD_SETTINGS.durationPerScene,
    aspectRatio: DEFAULT_STORYBOARD_SETTINGS.aspectRatio,
    audioMode: DEFAULT_STORYBOARD_SETTINGS.audioMode,
    language: DEFAULT_STORYBOARD_SETTINGS.language,
    visualStyle: DEFAULT_STORYBOARD_SETTINGS.visualStyle,
    // V5.0 (Isu #2): overlay opt-in flag — false by default.
    visualStyleExplicitOverlay: DEFAULT_STORYBOARD_SETTINGS.visualStyleExplicitOverlay,
    customStyle: "",
    animationStyle: 'Auto Director Animation',
    animationCustomStyle: "",
    animationGenre: 'Auto Director Detection',
    characterReference: [],
    productReference: [],
    productLock: { name: "", brand: "", size: "", material: "", color: "", texture: "", keyDetails: "" },
    locationReference: [],
    episodeCount: DEFAULT_STORYBOARD_SETTINGS.episodeCount,
    currentEpisode: 1,
    episodeBible: null,
    seriesPlan: null,
    episodePlate: null,
    episodeSeries: [],
    directorData: null,
    storyboardSessions: {},
    imageGen: {
        activeTool: null,
        foto: {
            subject: "",
            style: "Professional",
            lighting: "Studio Softbox",
            mood: "Confident",
            aspectRatio: "9:16",
            variations: 1,
            negativePrompt: ""
        },
        thumbnail: {
            title: "",
            headline: "",
            platform: "YouTube",
            style: "Viral",
            mood: "Excited",
            aspectRatio: "16:9",
            variations: 1
        },
        infographic: {
            title: "",
            content: "",
            type: "Informational",
            style: "Modern",
            colorTheme: "Auto",
            aspectRatio: "9:16",
            variations: 1
        },
        productAds: {
            productName: "",
            productDescription: "",
            mode: "Product Photo",
            scene: "Studio",
            ugcType: "Creator Review",
            gender: "",
            ageRange: "",
            appearance: "",
            pose: "",
            wardrobe: "",
            environment: "",
            style: "Professional",
            mood: "Confident",
            aspectRatio: "9:16",
            variations: 1,
            negativePrompt: ""
        },
        character: {
            count: 1,
            characters: [
                { name: "", description: "", refs: [] },
                { name: "", description: "", refs: [] },
                { name: "", description: "", refs: [] },
                { name: "", description: "", refs: [] },
                { name: "", description: "", refs: [] }
            ]
        },
        poster: {
            mainMessage: "",
            designType: "Social Media Post",
            platform: "Instagram Post",
            style: "Modern",
            aspectRatio: "9:16",
            variations: 1,
            details: ""
        },
        voiceOver: {
            script: "",
            language: "Indonesian",
            voice: "Female Warm",
            style: "Natural",
            tempo: "1.0x",
            duration: "10s",
            customDuration: 30
        },
        autoAds: {
            productName: "",
            benefits: "",
            audience: "",
            platform: "TikTok",
            duration: "30s",
            hook: "",
            body: "",
            cta: ""
        },
        videoMerge: {
            clips: [],
            voiceFile: null,
            originalVolume: 35,
            outputUrl: "",
            outputDataUrl: "",
            outputName: ""
        },
        isGenerating: false,
        lastResult: null
    },
    videoMerge: {
        clips: [],
        voiceFile: null,
        originalVolume: 35,
        outputUrl: "",
        outputDataUrl: "",
        outputName: ""
    },
    fotoReference: [],
    thumbnailSubjectReference: [],
    thumbnailProductReference: [],
    thumbnailStyleReference: [],
    infoReference: [],
    productAdsProductReference: [],
    productAdsModelReference: [],
    productAdsStyleReference: [],
    characterReference: [],
    posterReference: [],
    posterStyleReference: [],
    characterSheetReference: []
};

let storyboardGenerating = false;
let storyboardGenerationMode = null;
let storyboardCancelled = false;
let storyboardAbortCtrl = null;
let sceneGenerationActive = false;
let sceneGenerationIndex = -1;
let currentStoryboardHistoryId = null;

function throwIfStoryboardCancelled() {
    if (!storyboardCancelled) return;
    const e = new Error('CANCELLED');
    e.code = 'CANCELLED';
    throw e;
}

function cancelStoryboardGeneration() {
    if (!storyboardGenerating) return;
    storyboardCancelled = true;
    try { if (storyboardAbortCtrl) storyboardAbortCtrl.abort(); } catch (e) { /* ignore */ }
}

/* ----------------------------------------------------------------- */
/* INDEXEDDB HISTORY ENGINE (LOCAL)                                  */
/* ----------------------------------------------------------------- */