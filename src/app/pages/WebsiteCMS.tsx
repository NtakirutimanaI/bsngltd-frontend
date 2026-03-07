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
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Switch } from "@/app/components/ui/switch";
import { useLanguage } from "@/app/context/LanguageContext";

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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Image preview */}
            <div className="relative w-full h-32 sm:h-40 bg-gray-100 dark:bg-gray-900 overflow-hidden group">
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
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 rounded-full p-3 shadow-lg hover:bg-emerald-50 transition-colors"
                        disabled={uploading}
                    >
                        {uploading ? <RefreshCcw className="animate-spin" size={20} /> : <Camera size={20} />}
                    </button>
                </div>
                {/* Status badge */}
                {currentValue && currentValue !== imgDef.fallback && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Custom
                    </div>
                )}
            </div>
            {/* Info */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                    <h6 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-0">{imgDef.label}</h6>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 leading-tight">{imgDef.description}</p>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all"
                    style={{
                        background: uploading ? '#e5e7eb' : 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
                        color: uploading ? '#9ca3af' : '#fff',
                        border: 'none',
                        cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {uploading ? (
                        <><RefreshCcw className="animate-spin" size={12} /> Uploading...</>
                    ) : (
                        <><Upload size={12} /> Replace Image</>
                    )}
                </button>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative w-full h-32 sm:h-40 bg-gray-100 dark:bg-gray-900 overflow-hidden group">
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
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-gray-800 rounded-full p-3 shadow-lg hover:bg-emerald-50 transition-colors"
                        disabled={uploading}
                    >
                        {uploading ? <RefreshCcw className="animate-spin" size={20} /> : <Camera size={20} />}
                    </button>
                </div>
                {currentImage && currentImage.includes('/uploads/') && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Custom
                    </div>
                )}
                {/* Field badge */}
                <div className="absolute top-2 left-2 bg-gray-900/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {label}
                </div>
            </div>
            <div className="p-3">
                <h6 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-0 truncate">{displayTitle}</h6>
                {record.code && <p className="text-[10px] text-gray-400 mb-1">{record.code}</p>}
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 leading-tight">
                    {label} — {type === 'properties' ? 'Property gallery' : 'Post image'}
                </p>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all"
                    style={{
                        background: uploading ? '#e5e7eb' : 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
                        color: uploading ? '#9ca3af' : '#fff',
                        border: 'none',
                        cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {uploading ? (
                        <><RefreshCcw className="animate-spin" size={12} /> Uploading...</>
                    ) : (
                        <><Upload size={12} /> Replace Image</>
                    )}
                </button>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
    const { } = useLanguage();
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

    // Load records for properties/updates when those pages are selected
    useEffect(() => {
        if (activePage === 'properties' || activePage === 'updates') {
            setRecordsLoading(true);
            fetchApi<any>(`/${activePage}?limit=100`)
                .then((res) => {
                    setRecords(res.data || []);
                })
                .catch(err => console.error('Failed to load records', err))
                .finally(() => setRecordsLoading(false));
        }
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
                <RefreshCcw className="animate-spin text-emerald-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ScrollReveal>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="h3 fw-bold text-gray-900 dark:text-white">Website CMS</h1>
                        <p className="text-muted small mt-1">Manage public website content, images, and section visibility</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {activeView === 'text' && (
                            <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 flex mr-4">
                                {languages.map(lang => (
                                    <button
                                        key={lang.id}
                                        onClick={() => setActiveLang(lang.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeLang === lang.id ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        {lang.id.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                        <Button
                            onClick={saveSettings}
                            disabled={isSaving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-4 py-2 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 text-sm h-10"
                        >
                            {isSaving ? <RefreshCcw className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                            Publish Changes
                        </Button>
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 h-fit sticky top-24">
                        {pages.map((page) => (
                            <button
                                key={page.id}
                                onClick={() => setActivePage(page.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activePage === page.id
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                    : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                    }`}
                            >
                                <page.icon size={20} />
                                <span className="font-medium">{page.name}</span>
                                {PAGE_IMAGES[page.id] && (
                                    <span className="ms-auto bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                        {PAGE_IMAGES[page.id].length} img
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollReveal>

                {/* Content Editor */}
                <div className="lg:col-span-3 space-y-6">
                    {/* View Toggle */}
                    <ScrollReveal delay={0.15}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 flex gap-2">
                            <button
                                onClick={() => setActiveView('images')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeView === 'images'
                                    ? 'text-white shadow-lg'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                style={{
                                    background: activeView === 'images' ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' : 'transparent'
                                }}
                            >
                                <ImageIcon size={16} /> Image Management ({currentPageImages.length})
                            </button>
                            <button
                                onClick={() => setActiveView('text')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeView === 'text'
                                    ? 'text-white shadow-lg'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                style={{
                                    background: activeView === 'text' ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent'
                                }}
                            >
                                <Type size={16} /> Text Content ({textSettings.length})
                            </button>
                        </div>
                    </ScrollReveal>

                    {/* IMAGE VIEW */}
                    {activeView === 'images' && (
                        <ScrollReveal delay={0.2}>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-900/50 dark:to-gray-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                            <ImageIcon className="text-purple-600" size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                                                {activePage.replace('_', ' ')} — Images
                                            </h3>
                                            <p className="text-[11px] text-gray-500">Click any image or the "Replace Image" button to upload a new image from your device</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {currentPageImages.length > 0 ? (
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
                                    ) : (activePage === 'properties' || activePage === 'updates') ? (
                                        recordsLoading ? (
                                            <div className="text-center py-12">
                                                <RefreshCcw className="animate-spin mx-auto text-emerald-600 mb-3" size={28} />
                                                <p className="text-gray-500">Loading {activePage}...</p>
                                            </div>
                                        ) : records.length > 0 ? (
                                            <div>
                                                {activePage === 'properties' ? (
                                                    records.map((record) => (
                                                        <div key={record.id} className="mb-6">
                                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                                                                <Building2 className="text-emerald-600" size={16} />
                                                                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                                                    {(() => { try { if (record.title?.startsWith('{')) { const o = JSON.parse(record.title); return o.en || o.rw || Object.values(o)[0]; } } catch { } return record.title; })() || 'Untitled'}
                                                                </span>
                                                                {record.code && <span className="text-[10px] text-gray-400">({record.code})</span>}
                                                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">3 images</span>
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
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-md font-semibold text-gray-900 dark:text-white capitalize">
                                            {activePage.replace('_', ' ')} Content
                                        </h3>
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                                            <Globe size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{languages.find(l => l.id === activeLang)?.name}</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded">
                                        {textSettings.length} Items
                                    </span>
                                </div>

                                <div className="p-4 space-y-6">
                                    {textSettings.map((setting) => (
                                        <div key={setting.key} className="space-y-3 group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {setting.key.includes('title') || setting.key.includes('subtitle') ? <Type size={16} className="text-emerald-600" /> :
                                                        setting.key.includes('phone') ? <Phone size={16} className="text-blue-600" /> :
                                                            setting.key.includes('email') ? <Mail size={16} className="text-red-600" /> :
                                                                setting.key.includes('address') ? <MapPin size={16} className="text-green-600" /> :
                                                                    setting.key.includes('facebook') ? <FacebookIcon size={16} className="text-blue-700" /> :
                                                                        setting.key.includes('twitter') ? <TwitterIcon size={16} className="text-sky-500" /> :
                                                                            setting.key.includes('instagram') ? <InstagramIcon size={16} className="text-pink-600" /> :
                                                                                setting.key.includes('linkedin') ? <LinkedinIcon size={16} className="text-blue-800" /> :
                                                                                    setting.key.includes('youtube') ? <YoutubeIcon size={16} className="text-red-600" /> :
                                                                                        <Layout size={16} className="text-gray-600" />}
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        {setting.key.split('_').slice(1).join(' ')}
                                                    </label>
                                                </div>

                                                {setting.key.includes('visible') ? (
                                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Section Visibility</span>
                                                        <Switch
                                                            checked={setting.value === 'true'}
                                                            onCheckedChange={(checked) => handleUpdateSetting(setting.key, checked)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 group-hover:opacity-100 opacity-50 transition-opacity">
                                                        {setting.isPublic ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-gray-400" />}
                                                        <span className="text-[10px] font-bold uppercase text-gray-500">Publicly Visible</span>
                                                    </div>
                                                )}
                                            </div>

                                            {!setting.key.includes('visible') && (
                                                setting.value.length > 100 || setting.key.includes('history') || setting.key.includes('desc') || setting.key.includes('vision') ? (
                                                    <Textarea
                                                        value={getLocalizedValue(setting.value, activeLang)}
                                                        onChange={(e) => handleUpdateSetting(setting.key, e.target.value, activeLang)}
                                                        rows={3}
                                                        className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-emerald-500 rounded-lg resize-none text-sm p-2"
                                                        placeholder={`${setting.description} (${activeLang})`}
                                                    />
                                                ) : (
                                                    <Input
                                                        value={getLocalizedValue(setting.value, activeLang)}
                                                        onChange={(e) => handleUpdateSetting(setting.key, e.target.value, activeLang)}
                                                        className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-emerald-500 rounded-lg h-9 text-sm px-3"
                                                        placeholder={`${setting.description} (${activeLang})`}
                                                    />
                                                )
                                            )}
                                            <p className="text-xs text-gray-400 dark:text-gray-500 italic pl-1">
                                                {setting.description}
                                            </p>
                                        </div>
                                    ))}

                                    {textSettings.length === 0 && (
                                        <div className="text-center py-12">
                                            <Layout className="mx-auto text-gray-300 mb-4" size={48} />
                                            <p className="text-gray-500">No manageable text content found for this page.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>
                    )}

                    <ScrollReveal delay={0.3} className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center shrink-0">
                                <SettingsIcon className="text-emerald-600" size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-sm uppercase">How Image Upload Works</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Switch to the <strong>"Image Management"</strong> tab to see all images on the selected page.
                                    Click <strong>"Replace Image"</strong> or click directly on the image to upload a replacement from your device.
                                    Images are saved instantly — no need to click "Publish Changes" for images. Text changes still require publishing.
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    );
}
