import { X, ExternalLink, Mail, Phone, MapPin, Award, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

interface MISModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MISModal({ isOpen, onClose }: MISModalProps) {
    const [animationClass, setAnimationClass] = useState("");

    useEffect(() => {
        if (isOpen) {
            const animations = ["animate-slide-top", "animate-slide-bottom", "animate-slide-left", "animate-slide-right", "animate-zoom-diverse", "animate-rotate-diverse"];
            const randomAnim = animations[Math.floor(Math.random() * animations.length)];
            setAnimationClass(randomAnim);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-backdrop transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 ${animationClass}`}>
                {/* Header */}
                <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            M
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">MAKE IT SOLUTIONS Ltd</h3>
                            <p className="text-xs text-orange-600 font-medium tracking-wider uppercase">Official Partner</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Intro */}
                    <section>
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                                <Award className="text-orange-600" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Company Registration</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    MAKE IT SOLUTIONS Ltd is a domestic company limited by shares, officially registered under the laws governing companies in Rwanda (Law N° 007/2021).
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Registration Date</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">30 July 2022</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Company Code</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">120507912</span>
                            </div>
                        </div>
                    </section>

                    {/* Business Activities */}
                    <section>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-orange-600 rounded-full"></span>
                            Core Business Activities
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Software Publishing & Development",
                                "Computer Programming Activities",
                                "IT Consultancy & Management",
                                "Data Processing & Web Portals",
                                "Wired & Wireless Telecommunications",
                                "Technical Testing and Analysis",
                                "Management Consultancy"
                            ].map((activity, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-50 dark:border-gray-700 shadow-sm">
                                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                    <span>{activity}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Contact & Management */}
                    <section className="bg-orange-600 rounded-2xl p-6 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <ExternalLink size={120} />
                        </div>
                        <h4 className="font-bold text-xl mb-6">Connect with MIS</h4>

                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-white/70">Email Address</p>
                                    <p className="font-medium">innocentntakir@gmail.com</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-white/70">Phone Number</p>
                                    <p className="font-medium">+250 787 832 490</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-white/70">Registered Office</p>
                                    <p className="font-medium">Muhima, Nyarugenge, Kigali, Rwanda</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/20">
                            <p className="text-[10px] text-white/60 mb-3 uppercase tracking-widest font-bold">Tax & Legal Compliance</p>
                            <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                    <span>Profit Income Tax</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                    <span>Certified VAT</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                    <span>PAYE Compliant</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                    <span>RSSB Registered</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-xs text-white/70 uppercase font-bold tracking-widest mb-1">Managing Director</p>
                                <p className="font-bold text-lg">Innocent Ntakirutimana</p>
                            </div>
                            <a
                                href="http://www.rdb.rw/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-xl font-bold text-sm shadow-xl hover:bg-gray-50 transition-colors self-start sm:self-auto"
                            >
                                Verify on RDB
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 text-center border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} MAKE IT SOLUTIONS Ltd. All information is based on the official RDB registration certificate serial no. 827926.
                    </p>
                </div>
            </div>
        </div>
    );
}
