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
                    className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-center gap-2"
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
                    className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-center gap-2"
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

    const handleImageUploaded = (key: string, url: string) => {
        // Update both settings array and map immediately
        handleUpdateSetting(key, url);
        setMessage({ type: 'success', text: `Image "${key}" uploaded & saved! It will appear on the website immediately.` });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleRecordImageUploaded = (id: string, url: string, field: string) => {
        setRecords(prev => prev.map(r => r.id === id ? { ...r, [field]: url } : r));
        setMessage({ type: 'success', text: 'Image uploaded & saved! It will appear on the website immediately.' });
        setTimeout(() => setMessage(null), 4000);
    };

    const saveSettings = async () => {
        try {
            setIsSaving(true);
            const pageSettings = settings.filter(s => s.group === activePage);

            for (const setting of pageSettings) {
                await fetchApi(`/settings/${setting.key}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        value: setting.value,
                        isPublic: setting.isPublic
                    })
                });
            }

            setMessage({ type: 'success', text: 'All text changes published successfully!' });
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
        <div className="space-y-6">
            <ScrollReveal>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="h4 fw-bold text-dark">Website CMS</h1>
                        <p className="text-muted small mt-1">Manage public website content, images, and section visibility</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (isRecordPage) loadRecords();
                                else loadSettings();
                            }}
                            className="btn btn-light btn-sm d-flex align-items-center gap-2 border px-3"
                            style={{ height: '38px', borderRadius: '5px' }}
                        >
                            <RefreshCcw size={14} className={isLoading || recordsLoading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        {activeView === 'text' && (
                            <div className="bg-light p-1 rounded border d-flex mr-4">
                                {languages.map(lang => (
                                    <button
                                        key={lang.id}
                                        onClick={() => setActiveLang(lang.id)}
                                        className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all border-0 ${activeLang === lang.id ? 'bg-primary text-white' : 'text-muted bg-transparent hover:bg-white'}`}
                                    >
                                        {lang.id.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={saveSettings}
                            disabled={isSaving}
                            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded shadow-sm text-sm font-bold"
                            style={{ height: '38px' }}
                        >
                            {isSaving ? <RefreshCcw className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                            Publish Changes
                        </button>
                    </div>
                </div>
            </ScrollReveal>

            {message && (
                <ScrollReveal>
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                        <CheckCircle2 size={20} />
                        <span className="font-medium">{message.text}</span>
                    </div>
                </ScrollReveal>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Page Selector Sidebar */}
                <ScrollReveal delay={0.1} className="lg:col-span-1">
                    <div className="bg-light rounded p-2 shadow-sm border h-fit sticky top-24">
                        {pages.map((page) => {
                            const isRecordPage = page.id === 'properties' || page.id === 'updates';
                            let countStr = "";
                            if (isRecordPage) {
                                if (activePage === page.id) countStr = `${records.length} items`;
                            } else if (PAGE_IMAGES[page.id]) {
                                countStr = `${PAGE_IMAGES[page.id].length} img`;
                            }

                            return (
                                <button
                                    key={page.id}
                                    onClick={() => setActivePage(page.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded text-start transition-all border-0 mb-1 ${activePage === page.id
                                        ? "bg-white text-primary fw-bold border-start border-primary"
                                        : "text-muted hover:bg-white"
                                        }`}
                                >
                                    <page.icon size={18} />
                                    <span className="text-sm">{page.name}</span>
                                    {countStr && (
                                        <span className={`ms-auto text-[9px] font-bold px-2 py-0.5 rounded-pill ${activePage === page.id ? 'bg-primary text-white' : 'bg-secondary text-white opacity-50'}`}>
                                            {countStr}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </ScrollReveal>

                {/* Content Editor */}
                <div className="lg:col-span-3 space-y-6">
                    {/* View Toggle */}
                    <ScrollReveal delay={0.15}>
                        <div className="bg-light rounded p-2 shadow-sm border flex gap-2">
                            <button
                                onClick={() => setActiveView('images')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-bold transition-all border-0 ${activeView === 'images'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-muted hover:bg-white'
                                    }`}
                            >
                                <ImageIcon size={16} /> Image Management ({(activePage === 'properties' || activePage === 'updates') ? records.length : currentPageImages.length})
                            </button>
                            <button
                                onClick={() => setActiveView('text')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-sm font-bold transition-all border-0 ${activeView === 'text'
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-muted hover:bg-white'
                                    }`}
                            >
                                <Type size={16} /> Text Content ({(activePage === 'properties' || activePage === 'updates') ? records.length : textSettings.length})
                            </button>
                        </div>
                    </ScrollReveal>

                    {/* IMAGE VIEW */}
                    {activeView === 'images' && (
                        <ScrollReveal delay={0.2}>
                            <div className="bg-light rounded shadow-sm border overflow-hidden">
                                <div className="bg-white px-4 py-3 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-light rounded flex items-center justify-center">
                                            <ImageIcon className="text-primary" size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-dark mb-0 capitalize">
                                                {activePage.replace('_', ' ')} — Images
                                            </h3>
                                            <p className="text-[11px] text-muted mb-0">Click any image icon or "Replace Image" to upload a new version</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {currentPageImages.length > 0 && !isRecordPage ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                                                        <div key={record.id} className="mb-6">
                                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                                                <Building2 className="text-blue-600" size={16} />
                                                                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                                                    {(() => { try { if (record.title?.startsWith('{')) { const o = JSON.parse(record.title); return o.en || o.rw || Object.values(o)[0]; } } catch { } return record.title; })() || 'Untitled'}
                                                                </span>
                                                                {record.code && <span className="text-[10px] text-gray-400">({record.code})</span>}
                                                                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">3 images</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                                                <p className="text-gray-400 text-sm">Add some {activePage} first from the {activePage === 'properties' ? 'Portfolio' : 'Content'} page.</p>
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
                        <ScrollReveal delay={0.2}>
                            <div className="bg-light rounded shadow-sm border overflow-hidden">
                                <div className="bg-white px-4 py-3 border-b d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-4">
                                        <h3 className="text-sm font-bold text-dark mb-0 capitalize">
                                            {activePage.replace('_', ' ')} Content
                                        </h3>
                                        <div className="d-flex align-items-center gap-1.5 px-3 py-1 bg-light text-primary rounded-pill border">
                                            <Globe size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{languages.find(l => l.id === activeLang)?.name}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-white rounded">
                                        {isRecordPage ? records.length : textSettings.length} Items
                                    </span>
                                </div>

                                <div className="p-4">
                                    {isRecordPage && (
                                        <div className="space-y-6">
                                            {recordsLoading ? (
                                                <div className="text-center py-12">
                                                    <RefreshCcw className="animate-spin mx-auto text-primary mb-3" size={28} />
                                                    <p className="text-muted">Loading {activePage}...</p>
                                                </div>
                                            ) : records.length > 0 ? (
                                                records.map((record: any) => (
                                                    <div key={record.id} className="p-4 border rounded bg-white shadow-sm space-y-4">
                                                        <div className="d-flex align-items-center justify-content-between border-bottom pb-3">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="w-8 h-8 rounded bg-light d-flex align-items-center justify-center">
                                                                    {activePage === 'properties' ? <Building2 size={14} className="text-primary" /> : <Newspaper size={14} className="text-primary" />}
                                                                </div>
                                                                <span className="fw-bold text-sm text-dark">
                                                                    {record.code ? `[${record.code}]` : ''} Editing Entry
                                                                </span>
                                                            </div>
                                                            <button
                                                                className="btn btn-primary btn-sm px-3 fw-bold"
                                                                style={{ fontSize: '11px' }}
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

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
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
                                                                    className="bg-light border-0 focus:bg-white text-sm h-10"
                                                                    placeholder="Enter title..."
                                                                />
                                                            </div>

                                                            {activePage === 'properties' ? (
                                                                <div className="space-y-1.5">
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
                                                                        className="bg-light border-0 focus:bg-white text-sm h-10"
                                                                        placeholder="Enter location..."
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-1.5">
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
                                                                        className="bg-light border-0 focus:bg-white text-sm h-10"
                                                                        placeholder="Brief summary..."
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {activePage === 'properties' && (
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Price (RWF)</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={record.price || ''}
                                                                        onChange={(e) => {
                                                                            const newVal = e.target.value;
                                                                            setRecords(prev => prev.map(r => r.id === record.id ? { ...r, price: newVal } : r));
                                                                        }}
                                                                        className="bg-light border-0 focus:bg-white text-sm h-10"
                                                                        placeholder="e.g. 85000000"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Size (sqft)</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={record.size || ''}
                                                                        onChange={(e) => {
                                                                            const newVal = e.target.value;
                                                                            setRecords(prev => prev.map(r => r.id === record.id ? { ...r, size: newVal } : r));
                                                                        }}
                                                                        className="bg-light border-0 focus:bg-white text-sm h-10"
                                                                        placeholder="e.g. 120"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Beds</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={record.bedrooms || ''}
                                                                        onChange={(e) => {
                                                                            const newVal = e.target.value;
                                                                            setRecords(prev => prev.map(r => r.id === record.id ? { ...r, bedrooms: newVal } : r));
                                                                        }}
                                                                        className="bg-light border-0 focus:bg-white text-sm h-10"
                                                                        placeholder="3"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest pl-1">Baths</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={record.bathrooms || ''}
                                                                        onChange={(e) => {
                                                                            const newVal = e.target.value;
                                                                            setRecords(prev => prev.map(r => r.id === record.id ? { ...r, bathrooms: newVal } : r));
                                                                        }}
                                                                        className="bg-light border-0 focus:bg-white text-sm h-10"
                                                                        placeholder="2"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-1.5 pt-2">
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
                                                                className="bg-light border-0 focus:bg-white text-sm min-h-[120px]"
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
                                        <div key={setting.key} className="p-4 border rounded bg-white shadow-sm space-y-4 mb-4">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center gap-2">
                                                    {setting.key.includes('title') || setting.key.includes('subtitle') ? <Type size={16} className="text-primary" /> :
                                                        setting.key.includes('phone') ? <Phone size={16} className="text-dark" /> :
                                                            setting.key.includes('email') ? <Mail size={16} className="text-dark" /> :
                                                                setting.key.includes('address') ? <MapPin size={16} className="text-dark" /> :
                                                                    setting.key.includes('facebook') ? <FacebookIcon size={16} className="text-primary" /> :
                                                                        setting.key.includes('twitter') ? <TwitterIcon size={16} className="text-primary" /> :
                                                                            setting.key.includes('instagram') ? <InstagramIcon size={16} className="text-primary" /> :
                                                                                setting.key.includes('linkedin') ? <LinkedinIcon size={16} className="text-primary" /> :
                                                                                    setting.key.includes('youtube') ? <YoutubeIcon size={16} className="text-danger" /> :
                                                                                        <Layout size={16} className="text-muted" />}
                                                    <label className="text-sm fw-bold text-dark uppercase tracking-wider mb-0">
                                                        {setting.key.split('_').slice(1).join(' ')}
                                                    </label>
                                                </div>

                                                {setting.key.includes('visible') ? (
                                                    <div className="d-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border">
                                                        <span className="text-[10px] fw-bold text-muted uppercase">Section Visibility</span>
                                                        <Switch
                                                            checked={setting.value === 'true'}
                                                            onCheckedChange={(checked) => handleUpdateSetting(setting.key, checked)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="d-flex align-items-center gap-2">
                                                        {setting.isPublic ? <Eye size={14} className="text-success" /> : <EyeOff size={14} className="text-muted" />}
                                                        <span className="text-[10px] fw-bold uppercase text-muted">Publicly Visible</span>
                                                    </div>
                                                )}
                                            </div>

                                            {!setting.key.includes('visible') && (
                                                setting.value.length > 100 || setting.key.includes('history') || setting.key.includes('desc') || setting.key.includes('vision') ? (
                                                    <Textarea
                                                        value={getLocalizedValue(setting.value, activeLang)}
                                                        onChange={(e) => handleUpdateSetting(setting.key, e.target.value, activeLang)}
                                                        rows={3}
                                                        className="w-full bg-light border-0 focus:bg-white rounded p-3 text-sm"
                                                        placeholder={`${setting.description} (${activeLang})`}
                                                    />
                                                ) : (
                                                    <Input
                                                        value={getLocalizedValue(setting.value, activeLang)}
                                                        onChange={(e) => handleUpdateSetting(setting.key, e.target.value, activeLang)}
                                                        className="w-full bg-light border-0 focus:bg-white rounded h-10 text-sm px-3"
                                                        placeholder={`${setting.description} (${activeLang})`}
                                                    />
                                                )
                                            )}
                                            <p className="text-[11px] text-muted italic pl-1 mb-0">
                                                {setting.description}
                                            </p>
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


                    <ScrollReveal delay={0.3} className="bg-light border rounded p-4">
                        <div className="d-flex gap-4">
                            <div className="h-10 w-10 bg-white border rounded-circle d-flex align-items-center justify-center shrink-0">
                                <SettingsIcon className="text-primary" size={20} />
                            </div>
                            <div>
                                <h4 className="fw-bold text-dark mb-1 text-sm uppercase">How Website CMS Works</h4>
                                <p className="text-xs text-muted leading-relaxed mb-0">
                                    Use the <strong>"Image Management"</strong> tab to browse and replace visuals on specific pages. Images are updated instantly across the site when uploaded.
                                    The <strong>"Text Content"</strong> tab allows you to localize headlines and descriptions for all supported languages. Remember to click <strong>"Publish Changes"</strong> or <strong>"Save This Entry"</strong> to make your text updates public.
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    );
}
