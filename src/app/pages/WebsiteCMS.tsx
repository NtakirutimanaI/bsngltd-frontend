import { useState, useEffect, useRef } from "react";
import {
    Save,
    Layout,
    Info,
    Settings as SettingsIcon,
    Eye,
    EyeOff,
    Image as ImageIcon,
    Type,
    Phone,
    Mail,
    MapPin,
    RefreshCcw,
    CheckCircle2,
    Globe,
    Share2,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    Instagram as InstagramIcon,
    Linkedin as LinkedinIcon,
    Youtube as YoutubeIcon,
    Building2,
    Newspaper,
    Upload,
    Camera,
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi, getImageUrl } from "@/app/api/client";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Switch } from "@/app/components/ui/switch";

interface Setting {
    key: string;
    value: string;
    group: string;
    description: string;
    isPublic: boolean;
}

// Define every image on the public website mapped to its settings key
const PAGE_IMAGES: Record<string, { key: string; label: string; fallback: string; description: string }[]> = {
    home: [
        { key: 'home_hero_bg', label: 'Hero Background', fallback: '/img/hero-bg.jpg', description: 'Main hero section background image' },
        { key: 'home_carousel_1', label: 'Hero Carousel 1', fallback: '/img/hero-slider-1.jpg', description: 'First hero slider image' },
        { key: 'home_carousel_2', label: 'Hero Carousel 2', fallback: '/img/hero-slider-2.jpg', description: 'Second hero slider image' },
        { key: 'home_carousel_3', label: 'Hero Carousel 3', fallback: '/img/hero-slider-3.jpg', description: 'Third hero slider image' },
        { key: 'about_image_1', label: 'About Image 1', fallback: '/img/about-1.jpg', description: 'About section - left image' },
        { key: 'about_image_2', label: 'About Image 2', fallback: '/img/about-2.jpg', description: 'About section - right image' },
        { key: 'service_image_1', label: 'Service Image 1', fallback: '/img/service-1.jpg', description: 'Residential construction image' },
        { key: 'service_image_2', label: 'Service Image 2', fallback: '/img/service-2.jpg', description: 'Commercial construction image' },
        { key: 'home_project_card_1', label: 'Project Card 1', fallback: '/img/project-1.jpg', description: 'Project category card 1' },
        { key: 'home_project_card_2', label: 'Project Card 2', fallback: '/img/project-2.jpg', description: 'Project category card 2' },
        { key: 'home_project_card_3', label: 'Project Card 3', fallback: '/img/project-3.jpg', description: 'Project category card 3' },
        { key: 'home_project_card_4', label: 'Project Card 4', fallback: '/img/project-4.jpg', description: 'Project category card 4' },
        { key: 'home_project_card_5', label: 'Project Card 5', fallback: '/img/project-5.jpg', description: 'Project category card 5' },
        { key: 'home_project_card_6', label: 'Project Card 6', fallback: '/img/project-6.jpg', description: 'Project category card 6' },
        { key: 'global_newsletter_bg', label: 'Newsletter Background', fallback: '/img/newsletter.jpg', description: 'Newsletter CTA section background' },
    ],
    about: [
        { key: 'about_image_1', label: 'About Image 1', fallback: '/img/about-1.jpg', description: 'About page left image' },
        { key: 'about_image_2', label: 'About Image 2', fallback: '/img/about-2.jpg', description: 'About page right image' },
        { key: 'about_team_1', label: 'Team Member 1', fallback: '/img/team-1.jpg', description: 'Managing Director photo' },
        { key: 'about_team_2', label: 'Team Member 2', fallback: '/img/team-2.jpg', description: 'Senior Architect photo' },
        { key: 'about_team_3', label: 'Team Member 3', fallback: '/img/team-3.jpg', description: 'Project Manager photo' },
        { key: 'about_team_4', label: 'Team Member 4', fallback: '/img/team-4.jpg', description: 'Site Engineer photo' },
    ],
    services: [
        { key: 'service_image_1', label: 'Service Image 1', fallback: '/img/service-1.jpg', description: 'Residential construction service' },
        { key: 'service_image_2', label: 'Service Image 2', fallback: '/img/service-2.jpg', description: 'Commercial construction service' },
        { key: 'service_image_3', label: 'Service Image 3', fallback: '/img/service-3.jpg', description: 'Property development service' },
        { key: 'service_image_4', label: 'Service Image 4', fallback: '/img/service-4.jpg', description: 'Renovation & remodeling service' },
        { key: 'global_newsletter_bg', label: 'Newsletter Background', fallback: '/img/newsletter.jpg', description: 'Newsletter CTA section background' },
    ],
    global: [
        { key: 'global_newsletter_bg', label: 'Newsletter Background', fallback: '/img/newsletter.jpg', description: 'Shared newsletter section background' },
    ],
};

function ImageUploadCard({ imgDef, settings, onUploaded }: {
    imgDef: { key: string; label: string; fallback: string; description: string };
    settings: Record<string, string>;
    onUploaded: (key: string, url: string) => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const currentValue = settings[imgDef.key];
    const displaySrc = currentValue
        ? getImageUrl(currentValue)
        : imgDef.fallback;

    const handleUpload = async (file: File) => {
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('key', imgDef.key);
            // @ts-ignore
            const res = await fetchApi<{ url: string; key: string }>('/settings/upload-image', {
                method: 'POST',
                body: formData,
            });
            if (res && res.url) {
                onUploaded(imgDef.key, res.url);
            }
        } catch (err) {
            console.error('Upload failed', err);
            setError('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-light rounded overflow-hidden border shadow-sm h-100">
            {/* Image preview */}
            <div className="relative w-full h-32 sm:h-40 bg-white overflow-hidden group">
                <img
                    src={displaySrc}
                    alt={imgDef.label}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = imgDef.fallback;
                    }}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-content-center">
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="btn btn-light rounded-circle p-3 shadow-lg"
                        disabled={uploading}
                    >
                        {uploading ? <RefreshCcw className="animate-spin" size={20} /> : <Camera size={20} />}
                    </button>
                </div>
                {/* Status badge */}
                {currentValue && currentValue !== imgDef.fallback && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Custom
                    </div>
                )}
            </div>
            {/* Info */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                    <h6 className="font-bold text-sm mb-0">{imgDef.label}</h6>
                </div>
                <p className="text-[11px] text-muted mb-2 leading-tight">{imgDef.description}</p>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-center gap-1.5 py-1.5"
                    style={{ fontSize: '11px', fontWeight: 'bold' }}
                >
                    {uploading ? (
                        <><RefreshCcw className="animate-spin" size={12} /> Uploading...</>
                    ) : (
                        <><Upload size={12} /> Replace Image</>
                    )}
                </button>
                {error && <p className="text-danger small mt-1 mb-0" style={{ fontSize: '10px' }}>{error}</p>}
            </div>
            {/* Hidden file input */}
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                style={{ display: 'none' }}
                onChange={(e) => {
                    if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                    e.target.value = '';
                }}
            />
        </div>
    );
}

// Component for uploading images for database records (properties, updates)
function RecordImageCard({ record, type, field, label, onUploaded }: {
    record: { id: string; title: string; image: string; image2?: string; image3?: string; code?: string };
    type: 'properties' | 'updates';
    field: 'image' | 'image2' | 'image3';
    label: string;
    onUploaded: (id: string, url: string, field: string) => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const displayTitle = (() => {
        try {
            if (record.title?.startsWith('{')) {
                const obj = JSON.parse(record.title);
                return obj.en || obj.rw || obj.fr || Object.values(obj)[0] || 'Untitled';
            }
        } catch { }
        return record.title || 'Untitled';
    })();

    const currentImage = field === 'image2' ? record.image2 : field === 'image3' ? record.image3 : record.image;
    const displaySrc = currentImage
        ? getImageUrl(currentImage)
        : '/img/project-1.jpg';

    const handleUpload = async (file: File) => {
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('field', field);
            // @ts-ignore
            const res = await fetchApi<{ url: string; id: string }>(`/${type}/${record.id}/upload-image`, {
                method: 'POST',
                body: formData,
            });
            if (res && res.url) {
                onUploaded(record.id, res.url, field);
            }
        } catch (err) {
            console.error('Upload failed', err);
            setError('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-light rounded overflow-hidden border shadow-sm h-100">
            <div className="relative w-full h-32 sm:h-40 bg-white overflow-hidden group">
                <img
                    src={displaySrc}
                    alt={displayTitle}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/img/project-1.jpg';
                    }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-content-center">
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="btn btn-light rounded-circle p-3 shadow-lg"
                        disabled={uploading}
                    >
                        {uploading ? <RefreshCcw className="animate-spin" size={20} /> : <Camera size={20} />}
                    </button>
                </div>
                {currentImage && currentImage.includes('/uploads/') && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Custom
                    </div>
                )}
                {/* Field badge */}
                <div className="absolute top-2 left-2 bg-dark/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {label}
                </div>
            </div>
            <div className="p-3">
                <h6 className="font-bold text-sm mb-0 truncate">{displayTitle}</h6>
                {record.code && <p className="text-[10px] text-muted mb-1">{record.code}</p>}
                <p className="text-[11px] text-muted mb-2 leading-tight">
                    {label} — {type === 'properties' ? 'Property gallery' : 'Post image'}
                </p>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-center gap-1.5 py-1.5"
                    style={{ fontSize: '11px', fontWeight: 'bold' }}
                >
                    {uploading ? (
                        <><RefreshCcw className="animate-spin" size={12} /> Uploading...</>
                    ) : (
                        <><Upload size={12} /> Replace Image</>
                    )}
                </button>
                {error && <p className="text-danger small mt-1 mb-0" style={{ fontSize: '10px' }}>{error}</p>}
            </div>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                style={{ display: 'none' }}
                onChange={(e) => {
                    if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                    e.target.value = '';
                }}
            />
        </div>
    );
}

export function WebsiteCMS() {
    // const { } = useLanguage();
    const [settings, setSettings] = useState<Setting[]>([]);
    const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activePage, setActivePage] = useState("home");
    const [activeLang, setActiveLang] = useState<string>("en");
    const [activeView, setActiveView] = useState<'images' | 'text'>('images');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [recordsLoading, setRecordsLoading] = useState(false);

    const languages = [
        { id: "en", name: "English" },
        { id: "rw", name: "Kinyarwanda" },
        { id: "fr", name: "French" },
        { id: "sw", name: "Swahili" }
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const data = await fetchApi<Setting[]>("/settings");
            setSettings(data);
            const map: Record<string, string> = {};
            data.forEach(s => { map[s.key] = s.value; });
            setSettingsMap(map);
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load records for properties/updates/services when those pages are selected
    const isRecordPage = activePage === 'properties' || activePage === 'updates' || activePage === 'services';

    const loadRecords = async () => {
        if (!isRecordPage) return;

        setRecordsLoading(true);
        setRecords([]); // Clear old records
        try {
            console.log(`CMS: Fetching records for ${activePage}...`);
            const res: any = await fetchApi(`/${activePage}?limit=100`);
            console.log(`CMS: Received response for ${activePage}:`, res);

            // Handle various paginated/array structures
            let data = [];
            if (Array.isArray(res)) {
                data = res;
            } else if (res.data) {
                data = Array.isArray(res.data) ? res.data : (res.data.data && Array.isArray(res.data.data) ? res.data.data : []);
            } else if (res.items) {
                data = Array.isArray(res.items) ? res.items : [];
            }

            setRecords(data);
        } catch (err) {
            console.error('CMS: Failed to load records', err);
            setRecords([]);
        } finally {
            setRecordsLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, [activePage]);

    const getLocalizedValue = (val: string, lang: string) => {
        try {
            if (val.startsWith('{')) {
                const obj = JSON.parse(val);
                return obj[lang] || "";
            }
        } catch (e) { }
        return lang === 'en' ? val : "";
    };

    const handleUpdateSetting = (key: string, newValue: string | boolean, lang?: string) => {
        setSettings(prev => prev.map(s => {
            if (s.key !== key) return s;

            if (typeof newValue === 'boolean') {
                return { ...s, value: newValue.toString() };
            }

            // If it's a localized field
            if (lang) {
                let currentObj: any = {};
                try {
                    if (s.value.startsWith('{')) {
                        currentObj = JSON.parse(s.value);
                    } else {
                        currentObj = { en: s.value };
                    }
                } catch (e) {
                    currentObj = { en: s.value };
                }
                currentObj[lang] = newValue;
                return { ...s, value: JSON.stringify(currentObj) };
            }

            return { ...s, value: newValue };
        }));

        // Also update the map
        setSettingsMap(prev => ({ ...prev, [key]: typeof newValue === 'boolean' ? newValue.toString() : newValue }));
    };

    const handleImageUploaded = async (key: string, url: string) => {
        // Update both settings array and map immediately
        handleUpdateSetting(key, url);
        try { await fetchApi('/settings/sync-github', { method: 'POST' }); } catch(err){}
        setMessage({ type: 'success', text: `Image "${key}" uploaded & saved! It will appear on the website immediately.` });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleRecordImageUploaded = async (id: string, url: string, field: string) => {
        setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: url } : r));
        try { await fetchApi('/settings/sync-github', { method: 'POST' }); } catch(err){}
        setMessage({ type: 'success', text: 'Image uploaded & saved successfully!' });
        setTimeout(() => setMessage(null), 4000);
    };

    const saveSettings = async () => {
        try {
            setIsSaving(true);
            const pageSettings = settings.filter(s => s.group === activePage);
            
            // Crucial: Only save TEXT settings! Exclude all media to prevent stale local image state 
            // from mistakenly overwriting a newly uploaded image URL on "Publish".
            const textSettingsOnly = pageSettings.filter(s =>
                !s.key.includes('image') && !s.key.includes('bg') && !s.key.includes('img') &&
                !s.key.includes('logo') && !s.key.includes('favicon') && !s.key.includes('carousel') &&
                !s.key.includes('project_card') && !s.key.includes('team_')
            );

            for (const setting of textSettingsOnly) {
                await fetchApi(`/settings/${setting.key}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        value: setting.value,
                        isPublic: setting.isPublic
                    })
                });
            }

            // Sync all changes above to Github to fulfill the user requirement
            try { await fetchApi('/settings/sync-github', { method: 'POST' }); } catch(err){}

            setMessage({ type: 'success', text: 'Texts and content changed successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Failed to save settings:", error);
            setMessage({ type: 'error', text: 'Failed to save some settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    const pages = [
        { id: "home", name: "Home Page", icon: Layout },
        { id: "about", name: "About Page", icon: Info },
        { id: "services", name: "Services Page", icon: SettingsIcon },
        { id: "properties", name: "Properties Page", icon: Building2 },
        { id: "updates", name: "Updates Page", icon: Newspaper },
        { id: "contact", name: "Contact Page", icon: Mail },
        { id: "global", name: "Global Settings", icon: Share2 },
    ];

    const currentPageSettings = settings.filter(s => s.group === activePage);
    const currentPageImages = PAGE_IMAGES[activePage] || [];
    // Text settings are non-image settings
    const textSettings = currentPageSettings.filter(s =>
        !s.key.includes('image') && !s.key.includes('bg') && !s.key.includes('img') &&
        !s.key.includes('logo') && !s.key.includes('favicon') && !s.key.includes('carousel') &&
        !s.key.includes('project_card') && !s.key.includes('team_')
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCcw className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="container-fluid py-0" style={{ background: 'transparent' }}>

            {/* Message toast */}
            {message && (
                <div className={`d-flex align-items-center gap-2 px-3 py-2 mb-2 rounded-xl border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`} style={{ fontSize: '12px' }}>
                    <CheckCircle2 size={14} />
                    <span className="fw-bold">{message.text}</span>
                </div>
            )}

            <div className="row g-0" style={{ minHeight: '70vh' }}>
                {/* ===== LEFT SIDEBAR — Finance Center style ===== */}
                <div className="col-lg-3 border-end border-gray-100 pe-0">

                    {/* Sidebar Header Card */}
                    <div className="glass-card p-2 rounded-xl mb-2 border border-white shadow-sm mx-2" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
                        <div className="d-flex align-items-center gap-2 pb-2 border-bottom border-gray-100">
                            <div className="bg-primary rounded-lg p-2 text-white shadow-sm">
                                <Globe size={14} />
                            </div>
                            <div className="overflow-hidden">
                                <h2 className="fw-bold mb-0 text-truncate" style={{ fontSize: '13px' }}>Website CMS</h2>
                                <p className="smaller text-muted mb-0" style={{ fontSize: '10px' }}>Website content editor</p>
                            </div>
                        </div>
                    </div>

                    {/* Page Navigation Items */}
                    <div className="directory-scroll-container px-2">
                        {pages.map((page) => {
                            const isRecordPageItem = page.id === 'properties' || page.id === 'updates';
                            let countStr = "";
                            if (isRecordPageItem) {
                                if (activePage === page.id) countStr = `${records.length}`;
                            } else if (PAGE_IMAGES[page.id]) {
                                countStr = `${PAGE_IMAGES[page.id].length}`;
                            }
                            const isActive = activePage === page.id;

                            return (
                                <div
                                    key={page.id}
                                    onClick={() => setActivePage(page.id)}
                                    className={`site-row p-1 mb-1 rounded-xl transition-all border cursor-pointer ${isActive ? 'active-site shadow-md' : 'bg-white text-dark border-gray-100 hover:bg-light'}`}
                                    style={isActive ? { background: '#009CFF', borderColor: '#009CFF', color: 'white' } : {}}
                                >
                                    <div className="px-2 py-1.5 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2 overflow-hidden flex-grow-1">
                                            <div className={`rounded-lg p-1.5 d-flex align-items-center justify-content-center ${isActive ? 'bg-white/20' : 'bg-blue-50'}`} style={{ width: '30px', height: '30px', minWidth: '30px' }}>
                                                <page.icon size={14} className={isActive ? 'text-white' : 'text-primary'} />
                                            </div>
                                            <div className="overflow-hidden text-start">
                                                <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '11px' }}>{page.name}</h6>
                                                <div className={`smaller ${isActive ? 'text-white/80' : 'text-muted'}`} style={{ fontSize: '9px' }}>
                                                    {isRecordPageItem ? 'Database entries' : `${PAGE_IMAGES[page.id]?.length || 0} images`}
                                                </div>
                                            </div>
                                        </div>
                                        {countStr && (
                                            <span className={`text-[9px] fw-bold px-1.5 py-0.5 rounded-pill ${isActive ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary'}`}>
                                                {countStr}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ===== MAIN CONTENT AREA ===== */}
                <div className="col-lg-9 ps-0">

                    {/* Content Header Bar — Finance style */}
                    <ScrollReveal>
                        <div className="d-flex align-items-center justify-content-between gap-2 mb-2 py-2 px-3 bg-white rounded-xl border border-gray-100 shadow-sm mx-2">
                            <div>
                                <h1 className="h6 fw-bold text-dark mb-0 leading-tight capitalize">
                                    {pages.find(p => p.id === activePage)?.name || 'Page Editor'}
                                </h1>
                                <p className="text-muted mb-0" style={{ fontSize: '10px' }}>
                                    {isRecordPage ? 'Database record editor' : 'Media & text content manager'}
                                </p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                {/* Language switcher — only when text view */}
                                {activeView === 'text' && (
                                    <div className="bg-light p-1 rounded-lg border d-flex gap-1">
                                        {languages.map(lang => (
                                            <button
                                                key={lang.id}
                                                onClick={() => setActiveLang(lang.id)}
                                                className={`px-2 py-0.5 rounded text-[10px] fw-bold border-0 transition-all ${activeLang === lang.id ? 'bg-primary text-white shadow-sm' : 'text-muted bg-transparent hover:bg-white'}`}
                                            >
                                                {lang.id.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {/* Refresh */}
                                <button
                                    onClick={() => { if (isRecordPage) loadRecords(); else loadSettings(); }}
                                    className="btn btn-light btn-sm border d-flex align-items-center gap-1 px-2"
                                    style={{ height: '30px', fontSize: '11px', borderRadius: '8px' }}
                                    title="Refresh"
                                >
                                    <RefreshCcw size={12} className={isLoading || recordsLoading ? 'animate-spin' : ''} />
                                </button>
                                {/* Publish */}
                                {!isRecordPage && (
                                    <button
                                        onClick={saveSettings}
                                        disabled={isSaving}
                                        className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-3 fw-bold shadow-sm"
                                        style={{ height: '30px', fontSize: '11px', borderRadius: '8px' }}
                                    >
                                        {isSaving ? <RefreshCcw className="animate-spin" size={12} /> : <Save size={12} />}
                                        Publish
                                    </button>
                                )}
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* View Toggle — Images vs Text */}
                    <ScrollReveal delay={0.1}>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-1 d-flex gap-1 mb-2 mx-2">
                            <button
                                onClick={() => setActiveView('images')}
                                className={`flex-1 d-flex align-items-center justify-content-center gap-1.5 py-1.5 rounded-lg fw-bold border-0 transition-all ${activeView === 'images' ? 'bg-primary text-white shadow-sm' : 'text-muted bg-transparent hover:bg-light'}`}
                                style={{ fontSize: '11px' }}
                            >
                                <ImageIcon size={12} />
                                Image Management
                                <span className={`px-1.5 py-0 rounded-pill ${activeView === 'images' ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary'}`} style={{ fontSize: '9px', fontWeight: 800 }}>
                                    {isRecordPage ? records.length : currentPageImages.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveView('text')}
                                className={`flex-1 d-flex align-items-center justify-content-center gap-1.5 py-1.5 rounded-lg fw-bold border-0 transition-all ${activeView === 'text' ? 'bg-primary text-white shadow-sm' : 'text-muted bg-transparent hover:bg-light'}`}
                                style={{ fontSize: '11px' }}
                            >
                                <Type size={12} />
                                Text Content
                                <span className={`px-1.5 py-0 rounded-pill ${activeView === 'text' ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary'}`} style={{ fontSize: '9px', fontWeight: 800 }}>
                                    {isRecordPage ? records.length : textSettings.length}
                                </span>
                            </button>
                        </div>
                    </ScrollReveal>

                    {/* IMAGE VIEW */}
                    {activeView === 'images' && (
                        <ScrollReveal delay={0.2} className="mx-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-light/50 px-3 py-2 border-b d-flex align-items-center justify-content-between gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="bg-primary/10 rounded p-1.5 d-flex align-items-center justify-content-center">
                                            <ImageIcon className="text-primary" size={12} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm fw-bold text-dark mb-0 capitalize">
                                                {activePage.replace('_', ' ')} — Images
                                            </h3>
                                            <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Hover an image and click the camera icon to replace it</p>
                                        </div>
                                    </div>
                                    <span className="fw-bold px-2 py-0.5 bg-primary/10 text-primary rounded-pill" style={{ fontSize: '9px' }}>
                                        {isRecordPage ? records.length : currentPageImages.length} images
                                    </span>
                                </div>

                                <div className="p-3">
                                    {currentPageImages.length > 0 && !isRecordPage ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                            {currentPageImages.map((imgDef) => (
                                                <ImageUploadCard
                                                    key={imgDef.key + activePage}
                                                    imgDef={imgDef}
                                                    settings={settingsMap}
                                                    onUploaded={handleImageUploaded}
                                                />
                                            ))}
                                        </div>
                                    ) : isRecordPage ? (
                                        recordsLoading ? (
                                            <div className="text-center py-12">
                                                <RefreshCcw className="animate-spin mx-auto text-blue-600 mb-3" size={28} />
                                                <p className="text-gray-500">Loading {activePage}...</p>
                                            </div>
                                        ) : records.length > 0 ? (
                                            <div>
                                                {activePage === 'properties' ? (
                                                    records.map((record) => (
                                                        <div key={record.id} className="mb-4">
                                                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                                                                <Building2 className="text-blue-600" size={14} />
                                                                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                                                    {(() => { try { if (record.title?.startsWith('{')) { const o = JSON.parse(record.title); return o.en || o.rw || Object.values(o)[0]; } } catch { } return record.title; })() || 'Untitled'}
                                                                </span>
                                                                {record.code && <span className="text-[10px] text-gray-400">({record.code})</span>}
                                                                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">3 images</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                                                <RecordImageCard
                                                                    record={record}
                                                                    type="properties"
                                                                    field="image"
                                                                    label="Main Image"
                                                                    onUploaded={handleRecordImageUploaded}
                                                                />
                                                                <RecordImageCard
                                                                    record={record}
                                                                    type="properties"
                                                                    field="image2"
                                                                    label="Gallery Image 2"
                                                                    onUploaded={handleRecordImageUploaded}
                                                                />
                                                                <RecordImageCard
                                                                    record={record}
                                                                    type="properties"
                                                                    field="image3"
                                                                    label="Gallery Image 3"
                                                                    onUploaded={handleRecordImageUploaded}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                                        {records.map((record) => (
                                                            <RecordImageCard
                                                                key={record.id}
                                                                record={record}
                                                                type="updates"
                                                                field="image"
                                                                label="Post Image"
                                                                onUploaded={handleRecordImageUploaded}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
                                                <p className="text-gray-500">No {activePage} records found.</p>
                                                <p className="text-gray-400 text-sm">Add some {activePage} first from the {activePage === 'properties' ? 'Projects' : 'Content'} page.</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-12">
                                            <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
                                            <p className="text-gray-500">No manageable images for this page.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>
                    )}

                    {/* TEXT VIEW */}
                    {activeView === 'text' && (
                        <ScrollReveal delay={0.2} className="mx-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-light/50 px-3 py-2 border-b d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="bg-primary/10 rounded p-1.5 d-flex align-items-center justify-content-center">
                                            <Type size={12} className="text-primary" />
                                        </div>
                                        <h3 className="text-sm fw-bold text-dark mb-0 capitalize">
                                            {activePage.replace('_', ' ')} Content
                                        </h3>
                                        <div className="d-flex align-items-center gap-1 px-2 py-0.5 bg-white text-primary rounded-pill border" style={{ fontSize: '10px' }}>
                                            <Globe size={10} />
                                            <span className="fw-bold uppercase">{languages.find(l => l.id === activeLang)?.name}</span>
                                        </div>
                                    </div>
                                    <span className="fw-bold px-2 py-0.5 bg-primary text-white rounded-pill" style={{ fontSize: '9px' }}>
                                        {isRecordPage ? records.length : textSettings.length} Items
                                    </span>
                                </div>

                                <div className="p-3">
                                    {isRecordPage && (
                                        <div className="space-y-4">
                                            {recordsLoading ? (
                                                <div className="text-center py-12">
                                                    <RefreshCcw className="animate-spin mx-auto text-primary mb-3" size={28} />
                                                    <p className="text-muted">Loading {activePage}...</p>
                                                </div>
                                            ) : records.length > 0 ? (
                                                records.map((record: any) => (
                                                    <div key={record.id} className="p-3 border rounded bg-white shadow-sm space-y-3">
                                                        <div className="d-flex align-items-center justify-content-between border-bottom pb-2">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="w-8 h-8 rounded bg-light d-flex align-items-center justify-center">
                                                                    {activePage === 'properties' ? <Building2 size={14} className="text-primary" /> : <Newspaper size={14} className="text-primary" />}
                                                                </div>
                                                                <span className="fw-bold text-sm text-dark">
                                                                    {record.code ? `[${record.code}]` : ''} Editing Entry
                                                                </span>
                                                            </div>
                                                            <button
                                                                className="btn btn-primary btn-sm px-2 py-1 fw-bold"
                                                                style={{ fontSize: '10px' }}
                                                                onClick={async () => {
                                                                    try {
                                                                        const upRecord = records.find(r => r.id === record.id);
                                                                        const payload = { ...upRecord };

                                                                        // Ensure numeric fields are numbers for properties
                                                                        if (activePage === 'properties') {
                                                                            if (payload.price) payload.price = Number(payload.price);
                                                                            if (payload.size) payload.size = Number(payload.size);
                                                                            if (payload.bedrooms) payload.bedrooms = Number(payload.bedrooms);
                                                                            if (payload.bathrooms) payload.bathrooms = Number(payload.bathrooms);
                                                                        }

                                                                        await fetchApi(`/${activePage}/${record.id}`, {
                                                                            method: 'PATCH',
                                                                            body: JSON.stringify(payload)
                                                                        });
                                                                        try { await fetchApi('/settings/sync-github', { method: 'POST' }); } catch(err){}
                                                                        setMessage({ type: 'success', text: 'Entry saved successfully!' });
                                                                        setTimeout(() => setMessage(null), 3000);
                                                                    } catch (e) {
                                                                        setMessage({ type: 'error', text: 'Failed to save entry' });
                                                                    }
                                                                }}
                                                            >
                                                                Save This Entry
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Title ({activeLang.toUpperCase()})</label>
                                                                <Input
                                                                    value={getLocalizedValue(record.title || '', activeLang)}
                                                                    onChange={(e) => {
                                                                        const newVal = e.target.value;
                                                                        setRecords(prev => prev.map(r => {
                                                                            if (r.id !== record.id) return r;
                                                                            let obj: any = {};
                                                                            try { if (r.title?.startsWith('{')) obj = JSON.parse(r.title); else obj = { en: r.title }; } catch { obj = { en: r.title }; }
                                                                            obj[activeLang] = newVal;
                                                                            return { ...r, title: JSON.stringify(obj) };
                                                                        }));
                                                                    }}
                                                                    className="bg-light border-0 focus:bg-white text-sm h-8"
                                                                    placeholder="Enter title..."
                                                                />
                                                            </div>

                                                            {activePage === 'properties' ? (
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Location ({activeLang.toUpperCase()})</label>
                                                                    <Input
                                                                        value={getLocalizedValue(record.location || '', activeLang)}
                                                                        onChange={(e) => {
                                                                            const newVal = e.target.value;
                                                                            setRecords(prev => prev.map(r => {
                                                                                if (r.id !== record.id) return r;
                                                                                let obj: any = {};
                                                                                try { if (r.location?.startsWith('{')) obj = JSON.parse(r.location); else obj = { en: r.location }; } catch { obj = { en: r.location }; }
                                                                                obj[activeLang] = newVal;
                                                                                return { ...r, location: JSON.stringify(obj) };
                                                                            }));
                                                                        }}
                                                                        className="bg-light border-0 focus:bg-white text-sm h-8"
                                                                        placeholder="Enter location..."
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Excerpt ({activeLang.toUpperCase()})</label>
                                                                    <Input
                                                                        value={getLocalizedValue(record.excerpt || '', activeLang)}
                                                                        onChange={(e) => {
                                                                            const newVal = e.target.value;
                                                                            setRecords(prev => prev.map(r => {
                                                                                if (r.id !== record.id) return r;
                                                                                let obj: any = {};
                                                                                try { if (r.excerpt?.startsWith('{')) obj = JSON.parse(r.excerpt); else obj = { en: r.excerpt }; } catch { obj = { en: r.excerpt }; }
                                                                                obj[activeLang] = newVal;
                                                                                return { ...r, excerpt: JSON.stringify(obj) };
                                                                            }));
                                                                        }}
                                                                        className="bg-light border-0 focus:bg-white text-sm h-8"
                                                                        placeholder="Brief summary..."
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {activePage === 'properties' && (
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Price (RWF)</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={record.price || ''}
                                                                        onChange={(e) => {
                                                                            const newVal = e.target.value;
                                                                            setRecords(prev => prev.map(r => r.id === record.id ? { ...r, price: newVal } : r));
                                                                        }}
                                                                        className="bg-light border-0 focus:bg-white text-sm h-8"
                                                                        placeholder="e.g. 85000000"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Size (sqft)</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={record.size || ''}
                                                                        onChange={(e) => {
                                                                            const newVal = e.target.value;
                                                                            setRecords(prev => prev.map(r => r.id === record.id ? { ...r, size: newVal } : r));
                                                                        }}
                                                                        className="bg-light border-0 focus:bg-white text-sm h-8"
                                                                        placeholder="e.g. 120"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Beds</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={record.bedrooms || ''}
                                                                        onChange={(e) => {
                                                                            const newVal = e.target.value;
                                                                            setRecords(prev => prev.map(r => r.id === record.id ? { ...r, bedrooms: newVal } : r));
                                                                        }}
                                                                        className="bg-light border-0 focus:bg-white text-sm h-8"
                                                                        placeholder="3"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Baths</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={record.bathrooms || ''}
                                                                        onChange={(e) => {
                                                                            const newVal = e.target.value;
                                                                            setRecords(prev => prev.map(r => r.id === record.id ? { ...r, bathrooms: newVal } : r));
                                                                        }}
                                                                        className="bg-light border-0 focus:bg-white text-sm h-8"
                                                                        placeholder="2"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-1 pt-2">
                                                            <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">
                                                                {activePage === 'properties' ? 'Description' : 'Content'} ({activeLang.toUpperCase()})
                                                            </label>
                                                            <Textarea
                                                                value={getLocalizedValue(activePage === 'properties' ? record.description || "" : record.content || "", activeLang)}
                                                                onChange={(e) => {
                                                                    const newVal = e.target.value;
                                                                    const field = activePage === 'properties' ? 'description' : 'content';
                                                                    setRecords(prev => prev.map(r => {
                                                                        if (r.id !== record.id) return r;
                                                                        let obj: any = {};
                                                                        const currentVal = r[field];
                                                                        try { if (currentVal?.startsWith('{')) obj = JSON.parse(currentVal); else obj = { en: currentVal }; } catch { obj = { en: currentVal }; }
                                                                        obj[activeLang] = newVal;
                                                                        return { ...r, [field]: JSON.stringify(obj) };
                                                                    }));
                                                                }}
                                                                className="bg-light border-0 focus:bg-white text-sm min-h-[90px]"
                                                                placeholder={activePage === 'properties' ? "Detailed property description..." : "Full content body..."}
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-12">
                                                    <p className="text-muted">No {activePage} found to edit text content.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Handle Settings (General) */}
                                    {!isRecordPage && textSettings.map((setting) => (
                                        <div key={setting.key} className="px-3 py-2 border rounded-lg bg-white shadow-sm mb-2">
                                            <div className="d-flex align-items-center justify-content-between mb-1">
                                                <div className="d-flex align-items-center gap-1.5">
                                                    {setting.key.includes('title') || setting.key.includes('subtitle') ? <Type size={12} className="text-primary" /> :
                                                        setting.key.includes('phone') ? <Phone size={12} className="text-dark" /> :
                                                            setting.key.includes('email') ? <Mail size={12} className="text-dark" /> :
                                                                setting.key.includes('address') ? <MapPin size={12} className="text-dark" /> :
                                                                    setting.key.includes('facebook') ? <FacebookIcon size={12} className="text-primary" /> :
                                                                        setting.key.includes('twitter') ? <TwitterIcon size={12} className="text-primary" /> :
                                                                            setting.key.includes('instagram') ? <InstagramIcon size={12} className="text-primary" /> :
                                                                                setting.key.includes('linkedin') ? <LinkedinIcon size={12} className="text-primary" /> :
                                                                                    setting.key.includes('youtube') ? <YoutubeIcon size={12} className="text-danger" /> :
                                                                                        <Layout size={12} className="text-muted" />}
                                                    <label className="fw-bold text-dark uppercase mb-0" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                                                        {setting.key.split('_').slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                    </label>
                                                </div>

                                                {setting.key.includes('visible') ? (
                                                    <div className="d-flex align-items-center gap-1.5 bg-light px-2 py-0.5 rounded-pill border">
                                                        <span className="fw-bold text-muted uppercase" style={{ fontSize: '9px' }}>Visibility</span>
                                                        <Switch
                                                            checked={setting.value === 'true'}
                                                            onCheckedChange={(checked) => handleUpdateSetting(setting.key, checked)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="d-flex align-items-center gap-1">
                                                        {setting.isPublic ? <Eye size={11} className="text-success" /> : <EyeOff size={11} className="text-muted" />}
                                                        <span className="fw-bold uppercase text-muted" style={{ fontSize: '9px' }}>Publicly Visible</span>
                                                    </div>
                                                )}
                                            </div>

                                            {!setting.key.includes('visible') && (
                                                setting.value.length > 100 || setting.key.includes('history') || setting.key.includes('desc') || setting.key.includes('vision') ? (
                                                    <Textarea
                                                        value={getLocalizedValue(setting.value, activeLang)}
                                                        onChange={(e) => handleUpdateSetting(setting.key, e.target.value, activeLang)}
                                                        rows={2}
                                                        className="w-full bg-light border-0 focus:bg-white rounded px-2 py-1"
                                                        style={{ fontSize: '12px' }}
                                                        placeholder={`${setting.description} (${activeLang})`}
                                                    />
                                                ) : (
                                                    <Input
                                                        value={getLocalizedValue(setting.value, activeLang)}
                                                        onChange={(e) => handleUpdateSetting(setting.key, e.target.value, activeLang)}
                                                        className="w-full bg-light border-0 focus:bg-white rounded h-8 px-2"
                                                        style={{ fontSize: '12px' }}
                                                        placeholder={`${setting.description} (${activeLang})`}
                                                    />
                                                )
                                            )}
                                        </div>
                                    ))}

                                    {/* Empty state for non-record pages */}
                                    {!isRecordPage && textSettings.length === 0 && !isLoading && (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-white rounded-circle d-flex align-items-center justify-center mx-auto mb-4 border">
                                                <Layout className="text-muted" size={32} />
                                            </div>
                                            <p className="text-muted fw-bold">No manageable text content found for this page.</p>
                                            <p className="text-sm text-muted mt-1">Visit Global Settings or other pages to see editable fields.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>
                    )}


                    <ScrollReveal delay={0.3} className="mx-2">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 d-flex gap-3 align-items-start">
                            <div className="bg-primary/10 rounded-lg p-2 d-flex align-items-center justify-content-center flex-shrink-0">
                                <SettingsIcon className="text-primary" size={16} />
                            </div>
                            <div>
                                <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '12px' }}>How Website CMS Works</h4>
                                <p className="text-muted mb-0 leading-relaxed" style={{ fontSize: '11px' }}>
                                    Use <strong>"Image Management"</strong> to browse and replace visuals on specific pages — images update instantly across the site when uploaded.
                                    Use <strong>"Text Content"</strong> to localise headlines and descriptions in all supported languages. Click <strong>"Publish"</strong> to push text updates live.
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    );
}
