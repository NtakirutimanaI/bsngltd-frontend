import { useState, useEffect } from "react";
import { MapPin, Home, Building, LandPlot, Store, RefreshCcw, CreditCard, Receipt, Clock, CheckCircle2, MoreVertical, Building2 } from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";

interface Property {
    id: string;
    code: string;
    title: string;
    type: string;
    status: string;
    location: string;
    size: number;
    price: number;
    monthlyRent?: number;
    isForSale: boolean;
    isForRent: boolean;
}

interface PaymentRecord {
    id: string;
    propertyId: string;
    propertyName: string;
    amount: number;
    date: string;
    status: "success" | "pending" | "failed";
    type: "rent" | "purchase" | "deposit";
}

export function RentBuy() {
    const { user } = useAuth();
    const { currency } = useCurrency();
    const { dt } = useLanguage();
    const [properties, setProperties] = useState<Property[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [activeTab, setActiveTab] = useState<'my_units' | 'payments'>('my_units');

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            const propertiesData = await fetchApi<any[]>(`/properties?limit=50`);
            const paymentsData = await fetchApi<any[]>(`/payments?limit=50`);

            setProperties(propertiesData.filter(p => p.status === 'rented' || p.status === 'sold')); 
            
            setPayments(paymentsData.map(p => ({
                id: p.id,
                propertyId: p.propertyId || 'N/A',
                propertyName: p.propertyName || 'Property Payment',
                amount: p.amount,
                date: p.date,
                status: p.status === 'validated' ? 'success' : 'pending',
                type: p.category?.toLowerCase() === 'rent' ? 'rent' : 'purchase'
            })));
        } catch (error) {
            console.error("Failed to load Rent/Buy data:", error);
        }
    };

    const formatPrice = (priceRWF: number) => {
        if (currency === 'RWF') {
            return new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(priceRWF);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(priceRWF / 1300);
    };

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "house": return <Home size={14} />;
            case "apartment": return <Building size={14} />;
            case "plot": return <LandPlot size={14} />;
            case "commercial": return <Store size={14} />;
            default: return <Building2 size={14} />;
        }
    };

    return (
        <div className="rent-buy-hub container-fluid px-0 max-w-[1280px]">
            {/* Ultra High Density Header */}
            <div className="glass-card p-2.5 rounded-xl mb-3 border border-white shadow-sm d-flex align-items-center justify-content-between bg-white/60 backdrop-blur-md">
                <div className="d-flex align-items-center gap-2.5">
                    <div className="bg-primary rounded-lg p-2 text-white shadow-sm d-flex align-items-center justify-content-center">
                        <Building2 size={16} />
                    </div>
                    <div>
                        <h2 className="fw-bold mb-0" style={{ fontSize: '13px' }}>Rent / Buy Ledger</h2>
                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Personal property holdings & payments</p>
                    </div>
                </div>
                <button onClick={loadData} className="btn btn-sm d-flex align-items-center gap-1.5 text-white px-2.5 py-1" style={{ background: '#009CFF', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                    <RefreshCcw size={12} /> Refresh
                </button>
            </div>

            {/* Compact Stats Grid */}
            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="glass-card p-2.5 rounded-xl border border-white shadow-sm bg-white/40 d-flex align-items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Building size={16} /></div>
                        <div>
                            <div className="text-muted fw-bold text-[9px] uppercase opacity-60 leading-none mb-1">Units</div>
                            <h4 className="fw-bold mb-0 text-sm leading-tight">{properties.length}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="glass-card p-2.5 rounded-xl border border-white shadow-sm bg-white/40 d-flex align-items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CreditCard size={16} /></div>
                        <div>
                            <div className="text-muted fw-bold text-[9px] uppercase opacity-60 leading-none mb-1">Invested</div>
                            <h4 className="fw-bold mb-0 text-sm leading-tight">{formatPrice(payments.reduce((sum, p) => sum + p.amount, 0))}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="glass-card p-2.5 rounded-xl border border-white shadow-sm bg-white/40 d-flex align-items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Receipt size={16} /></div>
                        <div>
                            <div className="text-muted fw-bold text-[9px] uppercase opacity-60 leading-none mb-1">Latest</div>
                            <h4 className="fw-bold mb-0 text-sm leading-tight">{payments.length > 0 ? formatPrice(payments[0].amount) : '--'}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Streamlined Tab Toggle */}
            <div className="bg-white/40 p-1 rounded-xl d-inline-flex gap-1 mb-3 border border-white/60 shadow-sm">
                <button 
                    onClick={() => setActiveTab('my_units')}
                    className={`btn btn-sm px-3 py-1.5 fw-bold transition-all ${activeTab === 'my_units' ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-muted hover:bg-white'}`}
                    style={{ borderRadius: '8px', fontSize: '11px' }}
                >
                    Property Units
                </button>
                <button 
                    onClick={() => setActiveTab('payments')}
                    className={`btn btn-sm px-3 py-1.5 fw-bold transition-all ${activeTab === 'payments' ? 'bg-primary text-white shadow-sm' : 'bg-transparent text-muted hover:bg-white'}`}
                    style={{ borderRadius: '8px', fontSize: '11px' }}
                >
                    Statements
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'my_units' ? (
                <div className="row g-2">
                    {properties.length === 0 ? (
                        <div className="col-12 text-center py-5 opacity-40">
                            <Building size={32} className="mb-2 text-muted mx-auto" />
                            <h6 className="fw-bold text-xs">No active properties</h6>
                        </div>
                    ) : (
                        properties.map((property) => (
                            <div key={property.id} className="col-lg-3 col-md-6">
                                <ScrollReveal className="glass-card p-2.5 rounded-xl border border-white shadow-sm h-100 bg-white/60">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                            {getTypeIcon(property.type)}
                                        </div>
                                        <span className={`badge rounded-md border-0 px-1.5 py-0.5 text-[8px] fw-bold uppercase ${property.status === 'sold' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {property.status === 'sold' ? 'Owned' : 'Rented'}
                                        </span>
                                    </div>
                                    <h6 className="fw-bold mb-1 text-dark text-truncate" style={{ fontSize: '12px' }}>{dt(property.title)}</h6>
                                    <div className="d-flex align-items-center gap-1 text-muted mb-2" style={{ fontSize: '10px' }}>
                                        <MapPin size={10} /> {dt(property.location)}
                                    </div>
                                    <div className="row g-1 mb-2">
                                        <div className="col-6">
                                            <div className="bg-gray-50/50 p-1.5 rounded-lg border border-gray-100/50">
                                                <div className="text-muted text-[8px] uppercase fw-bold opacity-60 mb-0">Size</div>
                                                <div className="fw-bold text-dark text-[10px]">{property.size} sqft</div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="bg-gray-50/50 p-1.5 rounded-lg border border-gray-100/50">
                                                <div className="text-muted text-[8px] uppercase fw-bold opacity-60 mb-0">Code</div>
                                                <div className="fw-bold text-dark text-[10px]">{property.code}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-top d-flex justify-content-between align-items-center">
                                        <div className="fw-bold text-primary" style={{ fontSize: '11px' }}>
                                            {property.status === 'sold' ? formatPrice(property.price) : `${formatPrice(property.monthlyRent || 0)}/mo`}
                                        </div>
                                        <button className="btn btn-icon p-0 border-0 hover:bg-gray-100 rounded-md"><MoreVertical size={12} className="text-muted" /></button>
                                    </div>
                                </ScrollReveal>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="glass-card rounded-xl border border-white shadow-sm overflow-hidden bg-white/40">
                    <div className="table-responsive">
                        <table className="table table-borderless align-middle mb-0">
                            <thead className="bg-gray-50/50 border-bottom border-gray-100">
                                <tr>
                                    <th className="px-3 py-2 text-muted fw-bold uppercase text-[9px] opacity-60">Payment Details</th>
                                    <th className="py-2 text-muted fw-bold uppercase text-[9px] opacity-60">Property</th>
                                    <th className="py-2 text-muted fw-bold uppercase text-[9px] opacity-60 text-center">Category</th>
                                    <th className="py-2 text-muted fw-bold uppercase text-[9px] opacity-60">Amount</th>
                                    <th className="py-2 text-muted fw-bold uppercase text-[9px] opacity-60 text-center">Status</th>
                                    <th className="px-3 py-2 text-muted fw-bold uppercase text-[9px] opacity-60 text-end">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 opacity-40 text-xs">No records</td>
                                    </tr>
                                ) : (
                                    payments.map((record) => (
                                        <tr key={record.id} className="border-bottom border-gray-50/50 hover:bg-white/40 transition-colors">
                                            <td className="px-3 py-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${record.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        <CreditCard size={12} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark text-[11px]">TRX-{record.id.slice(-4).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2">
                                                <div className="fw-semibold text-dark text-[11px] text-truncate max-w-[150px]">{record.propertyName}</div>
                                            </td>
                                            <td className="py-2 text-center">
                                                <span className="badge rounded-md bg-gray-100 text-gray-700 px-1.5 py-0.5 border-0 font-medium text-[8px]">
                                                    {record.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-2 fw-bold text-dark text-[11px]">{formatPrice(record.amount)}</td>
                                            <td className="py-2 text-center">
                                                <span className={`${record.status === 'success' ? 'text-emerald-600' : 'text-amber-600'} fw-bold text-[10px]`}>
                                                    {record.status === 'success' ? 'Validated' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-end text-muted text-[10px]">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`
                .rent-buy-hub { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .text-sm { font-size: 0.875rem; }
                .text-xs { font-size: 0.75rem; }
                .leading-tight { line-height: 1.25; }
            `}</style>
        </div>
    );
}
