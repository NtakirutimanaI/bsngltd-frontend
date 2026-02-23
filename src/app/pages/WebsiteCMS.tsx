import { useState, useEffect } from "react";
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
    Newspaper
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from "@/app/api/client";
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

export function WebsiteCMS() {
    const { dt } = useLanguage();
    const [settings, setSettings] = useState<Setting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activePage, setActivePage] = useState("home");
    const [activeLang, setActiveLang] = useState<string>("en");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

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

            setMessage({ type: 'success', text: 'All changes published successfully!' });
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCcw className="animate-spin text-orange-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ScrollReveal>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Website CMS</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage public website content and section visibility</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 flex mr-4">
                            {languages.map(lang => (
                                <button
                                    key={lang.id}
                                    onClick={() => setActiveLang(lang.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeLang === lang.id ? 'bg-orange-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {lang.id.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <Button
                            onClick={saveSettings}
                            disabled={isSaving}
                            className="bg-orange-600 hover:bg-orange-700 text-white gap-2 px-8 py-6 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                        >
                            {isSaving ? <RefreshCcw className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
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
                                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                                    : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                    }`}
                            >
                                <page.icon size={20} />
                                <span className="font-medium">{page.name}</span>
                            </button>
                        ))}
                    </div>
                </ScrollReveal>

                {/* CMS Editor */}
                <div className="lg:col-span-3 space-y-6">
                    <ScrollReveal delay={0.2}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                        {activePage.replace('_', ' ')} Content
                                    </h3>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full border border-orange-100 dark:border-orange-900/30">
                                        <Globe size={14} />
                                        <span className="text-xs font-bold uppercase tracking-wider">{languages.find(l => l.id === activeLang)?.name}</span>
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded">
                                    {currentPageSettings.length} Manageable Items
                                </span>
                            </div>

                            <div className="p-6 space-y-8">
                                {currentPageSettings.map((setting) => (
                                    <div key={setting.key} className="space-y-3 group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {setting.key.includes('title') || setting.key.includes('subtitle') ? <Type size={16} className="text-orange-600" /> :
                                                    setting.key.includes('phone') ? <Phone size={16} className="text-blue-600" /> :
                                                        setting.key.includes('email') ? <Mail size={16} className="text-red-600" /> :
                                                            setting.key.includes('address') ? <MapPin size={16} className="text-green-600" /> :
                                                                setting.key.includes('image') ? <ImageIcon size={16} className="text-purple-600" /> :
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
                                                    rows={4}
                                                    className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-orange-500 rounded-xl resize-none"
                                                    placeholder={`${setting.description} (${activeLang})`}
                                                />
                                            ) : (
                                                <Input
                                                    value={getLocalizedValue(setting.value, activeLang)}
                                                    onChange={(e) => handleUpdateSetting(setting.key, e.target.value, activeLang)}
                                                    className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-orange-500 rounded-xl h-12"
                                                    placeholder={`${setting.description} (${activeLang})`}
                                                />
                                            )
                                        )}
                                        <p className="text-xs text-gray-400 dark:text-gray-500 italic pl-1">
                                            {setting.description}
                                        </p>
                                    </div>
                                ))}

                                {currentPageSettings.length === 0 && (
                                    <div className="text-center py-12">
                                        <Layout className="mx-auto text-gray-300 mb-4" size={48} />
                                        <p className="text-gray-500">No manageable content found for this page.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.3} className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl p-6">
                        <div className="flex gap-4">
                            <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                                <SettingsIcon className="text-orange-600" size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-sm uppercase">Multi-Language Support</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Use the language switcher at the top right of the editor to provide translations for English, Kinyarwanda, French, and Swahili.
                                    Visible toggles apply to all languages.
                                </p>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    );
}
