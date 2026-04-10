import { Globe, ChevronDown } from "lucide-react";
import { useLanguage, type Language } from "@/app/context/LanguageContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const languages: { code: Language; name: string; flag: string }[] = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
        { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
    ];

    const currentLang = languages.find((l) => l.code === language) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                    style={{ border: 'none', background: 'transparent' }}
                >
                    <Globe className="h-5 w-5 text-[#009CFF]" />
                    <span className="text-sm font-bold">{currentLang.flag}</span>
                    <ChevronDown className="h-3 w-3 opacity-50 d-none d-sm-inline" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1 shadow-xl border-none border-b-2 border-[#009CFF]">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`flex items-center gap-3 p-2.5 cursor-pointer rounded-lg transition-colors ${lang.code === language
                            ? "bg-[#009CFF]/10 text-[#009CFF] font-bold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm">{lang.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
