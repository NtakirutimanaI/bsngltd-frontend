import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
    DollarSign,
    Search,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownLeft,
    Download,
    CreditCard,
    MapPin,
    ChevronRight,
    PlusCircle
} from "lucide-react";
import { AddPaymentModal } from "@/app/components/AddPaymentModal";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { PaginationSelector } from "@/app/components/ui/pagination-selector";
import { fetchApi } from '../api/client';
import { useAuth } from "@/app/context/AuthContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { toast } from "sonner";
import { ExportReportModal } from "@/app/components/ExportReportModal";
import { useSite } from "@/app/context/SiteContext";
import { Badge } from "@/app/components/ui/badge";

// Types
interface Transaction {
    id: string;
    code: string;
    amount: number;
    type: string;
    status: string;
    method: string;
    date: string;
    description: string;
    payer?: string;
    payee?: string;
}

interface SalaryHistoryRecord {
    id: string;
    employeeId: string;
    employee?: { name: string; employeeId: string };
    amount: number;
    paymentMethod: string;
    transactionId: string;
    status: string;
    salaryMonth: number;
    salaryYear: number;
    createdAt: string;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function Finance() {
    const { user } = useAuth();
    const { currency } = useCurrency();
    const { selectedSite } = useSite();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase().replace(/\s+/g, '_');
    const isAdminOrManager = ['super_admin', 'admin', 'manager', 'site_manager'].includes(roleName);
    const activeCategory = (searchParams.get('category') as 'expenses' | 'incomes' | 'payroll') || (isAdminOrManager ? 'expenses' : 'incomes');

    const setActiveCategory = (category: any) => {
        setSearchParams({ category });
        setCurrentPage(1);
    };

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryRecord[]>([]);

    useEffect(() => {
        if (activeCategory === 'payroll') {
            loadSalaryHistory();
        } else {
            loadTransactions();
        }
    }, [activeCategory, selectedMonth, selectedYear, currentPage, pageSize, selectedSite]);

    const loadTransactions = async () => {
        setIsLoading(true);
        try {
            let filterType = '';
            if (activeCategory === 'incomes') filterType = 'client_payment';
            if (activeCategory === 'expenses') filterType = 'expense,supplier,contractor,salary';

            const queryParams: any = {
                search: searchTerm,
                type: filterType,
                siteId: selectedSite?.id || '',
                page: currentPage.toString(),
                limit: pageSize.toString()
            };

            if (!isAdminOrManager) {
                queryParams.search = user?.email || user?.phone; 
            }

            const query = new URLSearchParams(queryParams).toString();
            const res = await fetchApi<any>(`/payments?${query}`);
            setTransactions(res.data || []);
            setTotalPages(res.lastPage || 1);
            setTotalItems(res.total || 0);
        } catch (err) {
            toast.error("Failed to load transactions");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSalaryHistory = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                month: selectedMonth.toString(),
                year: selectedYear.toString(),
                siteId: selectedSite?.id || '',
                page: currentPage.toString(),
                limit: pageSize.toString()
            }).toString();
            const res = await fetchApi<any>(`/employees/salary/history?${query}`);
            setSalaryHistory(res.data || []);
            setTotalPages(res.lastPage || 1);
            setTotalItems(res.total || 0);
        } catch (err) {
            toast.error("Failed to load salary history");
        } finally {
            setIsLoading(false);
        }
    };

    const formatAmount = (amount: number) => {
        let finalAmount = amount;
        let label = 'RWF';
        if (currency === 'USD') {
            finalAmount = amount / 1300;
            label = 'USD';
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: label }).format(finalAmount);
    };

    const categories = [
        ...(isAdminOrManager ? [
            { id: 'expenses', name: 'Operational Expenses', icon: TrendingDown, color: 'text-danger', description: 'Costs, supplies & bills' },
        ] : []),
        { id: 'incomes', name: isAdminOrManager ? 'Company Incomes' : 'Payment History', icon: TrendingUp, color: 'text-success', description: isAdminOrManager ? 'Client payments & revenue' : 'My billing records' },
        ...(isAdminOrManager ? [
            { id: 'payroll', name: 'Workforce Payroll', icon: CreditCard, color: 'text-primary', description: 'Salary disbursement logs' }
        ] : [])
    ];

    return (
        <div className="container-fluid py-0 min-vh-100" style={{ background: 'transparent' }}>
            <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={(format) => { toast.success(`Downloading ${format.toUpperCase()} report...`); }} />
            
            <div className="row g-1 pt-1">
                {/* Category sub-sidebar */}
                <div className="col-lg-3 px-lg-4 border-end border-gray-100">
                    <div className="glass-card p-2 rounded-xl mb-3 border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                        <div className="d-flex align-items-center gap-2 mb-0 pb-2 border-bottom border-gray-100">
                            <div className="bg-primary rounded-lg p-2 text-white shadow-sm">
                                <DollarSign size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <h2 className="fw-bold mb-0 text-truncate" style={{ fontSize: '13px' }}>{isAdminOrManager ? "Finance Center" : "Payment History"}</h2>
                                <p className="smaller text-muted mb-0" style={{ fontSize: '11px' }}>Streamlined financial auditing</p>
                            </div>
                        </div>
                    </div>

                    <div className="directory-scroll-container">
                        {categories.map((cat) => (
                            <div 
                                key={cat.id} 
                                onClick={() => setActiveCategory(cat.id)}
                                className={`site-row p-1 mb-1.5 rounded-xl transition-all border cursor-pointer ${activeCategory === cat.id ? 'active-site shadow-md' : 'bg-white text-dark border-gray-100 hover:bg-light'}`}
                                style={activeCategory === cat.id ? { 
                                    background: '#009CFF',
                                    borderColor: '#009CFF',
                                    color: 'white'
                                } : {}}
                            >
                                <div className="px-3 py-2 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3 overflow-hidden flex-grow-1">
                                        <div className={`rounded-lg p-2 d-flex align-items-center justify-content-center ${activeCategory === cat.id ? 'bg-white/20' : 'bg-blue-50'}`} style={{ width: '34px', height: '34px' }}>
                                            <cat.icon size={16} className={activeCategory === cat.id ? 'text-white' : cat.color} />
                                        </div>
                                        <div className="overflow-hidden text-start">
                                            <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '11px' }}>{cat.name}</h6>
                                            <div className={`smaller ${activeCategory === cat.id ? 'text-white/80' : 'text-muted'}`} style={{ fontSize: '9px' }}>{cat.description}</div>
                                        </div>
                                    </div>
                                    {activeCategory === cat.id && <ChevronRight size={14} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="col-lg-9 px-lg-4">
                    <ScrollReveal>
                        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2 py-1 px-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="py-1">
                                <h1 className="h6 fw-bold text-dark mb-0 leading-tight">
                                    {categories.find(c => c.id === activeCategory)?.name || 'Finance Ledger'}
                                </h1>
                                <p className="text-muted mb-0" style={{ fontSize: '10px' }}>{isAdminOrManager ? "Site-aware transactional tracking" : "Summary of your settled payments"}</p>
                            </div>
                            
                            <div className="d-flex gap-2">
                                {isAdminOrManager && activeCategory !== 'payroll' && (
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="btn btn-sm d-flex align-items-center gap-2 text-white shadow-none border-0"
                                        style={{ background: '#009CFF', borderRadius: '8px', fontSize: '11px', fontWeight: 600, padding: '8px 16px', height: '32px' }}
                                    >
                                        <PlusCircle size={14} /> New Record
                                    </button>
                                )}
                                <button className="btn btn-light bg-light p-1 rounded-xl d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }} onClick={() => setIsExportModalOpen(true)}>
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>

                        {!isLoading && totalItems > 0 && (
                            <div className="row g-2 mb-2">
                                <div className="col-md-6 col-lg-4">
                                    <div className="bg-white rounded-xl p-2 px-3 border border-gray-100 shadow-xs d-flex align-items-center gap-2 h-100">
                                        <div className={`rounded-xl d-flex align-items-center justify-content-center ${activeCategory === 'incomes' ? 'bg-success/10 text-success' : activeCategory === 'expenses' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`} style={{ width: '36px', height: '36px', minWidth: '36px' }}>
                                            <DollarSign size={18} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="smaller text-muted mb-0 uppercase fw-bold" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Total {activeCategory.replace('_', ' ')} Value</p>
                                            <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.25rem' }}>
                                                {formatAmount((activeCategory === 'payroll' ? salaryHistory : transactions).reduce((sum: number, t: any) => sum + (t.amount || 0), 0))}
                                            </h4>
                                            <div className="d-flex align-items-center gap-1">
                                                <div className="h-1 w-1 rounded-circle bg-success" />
                                                <span className="smaller text-success fw-bold" style={{ fontSize: '9px' }}>AUDITED TOTAL</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <div className="bg-white rounded-xl p-2 px-3 border border-gray-100 shadow-xs h-100 d-flex flex-column justify-content-center">
                                        <p className="smaller text-muted mb-0 uppercase fw-bold" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Registry Volume</p>
                                        <div className="d-flex align-items-baseline gap-1">
                                            <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.25rem' }}>{totalItems}</h4>
                                            <span className="text-muted smaller">Records Found</span>
                                        </div>
                                        <p className="mb-0 text-muted" style={{ fontSize: '9px' }}>Current Filter Period applied</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ScrollReveal>

                    {!isLoading && totalItems === 0 && !isAdminOrManager ? (
                        <div className="d-flex flex-column align-items-center justify-content-center py-5 mt-5">
                             <div className="bg-gray-50 p-4 rounded-circle mb-3">
                                <DollarSign size={48} className="text-gray-300" />
                             </div>
                             <h4 className="fw-bold text-dark">No Payment Ledger Entries</h4>
                             <p className="text-muted small">We couldn't track any transactions associated with your account yet.</p>
                        </div>
                    ) : ( 
                        <div className="marking-content mt-1">
                        <ScrollReveal className="fade-in">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-2 px-3 border-b border-gray-100 d-flex align-items-center justify-content-between bg-light/50">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="overflow-hidden">
                                            <h3 className="fw-bold mb-0" style={{ fontSize: '12px' }}>{isAdminOrManager ? "Operational Ledger" : "Your Transaction Summary"}</h3>
                                            <p className="smaller text-muted mb-0 uppercase fw-bold" style={{ fontSize: '8px', letterSpacing: '0.5px' }}>Verified Transactional Flow</p>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <div className="position-relative">
                                            <Search className="position-absolute ms-2 top-50 translate-middle-y text-muted" size={12} />
                                            <input 
                                                type="text" 
                                                className="form-control form-control-sm ps-4 border-gray-100 bg-light/30" 
                                                placeholder="Tracking ID..." 
                                                style={{ fontSize: '10px', height: '28px', borderRadius: '6px' }}
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && loadTransactions()}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-gray-50/80">
                                            <tr className="smaller text-muted text-uppercase fw-bold" style={{ fontSize: '9px' }}>
                                                <th className="ps-4 py-2">Reference / ID</th>
                                                <th className="py-2">{activeCategory === 'payroll' ? 'Site Staff' : 'Entity Description'}</th>
                                                <th className="py-2">Site / Project</th>
                                                <th className="text-center py-2">{activeCategory === 'payroll' ? 'Review Month' : 'Classification'}</th>
                                                <th className="text-end py-2">Record Amount</th>
                                                <th className="pe-4 text-end py-2">Audit Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr><td colSpan={6} className="text-center py-5 text-muted small">Synchronizing ledger...</td></tr>
                                            ) : (activeCategory === 'payroll' ? salaryHistory : transactions).length === 0 ? (
                                                <tr><td colSpan={6} className="text-center py-5 text-muted small italic">No payment history found in this category.</td></tr>
                                            ) : (
                                                (activeCategory === 'payroll' ? salaryHistory : transactions).map((item: any) => (
                                                    <tr key={item.id} className="border-t border-gray-100 transition-all hover:bg-blue-50/30">
                                                        <td className="ps-4 py-1.5">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className={`rounded-lg d-flex align-items-center justify-content-center shadow-xs ${activeCategory === 'incomes' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`} style={{ width: '24px', height: '24px' }}>
                                                                    {activeCategory === 'incomes' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                                </div>
                                                                <div>
                                                                    <div className="fw-bold text-dark" style={{ fontSize: '11px' }}>{item.code || item.transactionId || 'REF-N/A'}</div>
                                                                    <div className="smaller text-muted" style={{ fontSize: '9px' }}>{new Date(item.date || item.createdAt).toLocaleDateString()}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-1.5">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="fw-medium text-dark" style={{ fontSize: '11px' }}>
                                                                    {activeCategory === 'payroll' ? (item.employee?.name || 'N/A') : (item.payer || item.payee || 'Platform Service')}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-1.5">
                                                            <div className="d-flex align-items-center gap-1">
                                                                <MapPin size={10} className="text-muted" />
                                                                <span className="text-muted" style={{ fontSize: '11px' }}>{item.description || 'General Site'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-center py-1.5">
                                                            <span className="badge bg-light text-dark border border-gray-100 fw-bold" style={{ fontSize: '9px', padding: '4px 8px' }}>
                                                                {activeCategory === 'payroll' ? `${MONTHS[item.salaryMonth-1]} ${item.salaryYear}` : item.method?.toUpperCase() || 'E-WALLET'}
                                                            </span>
                                                        </td>
                                                        <td className="text-end py-1.5">
                                                            <div className={`fw-bold ${activeCategory === 'incomes' ? 'text-success' : 'text-danger'}`} style={{ fontSize: '11px' }}>
                                                                {activeCategory === 'incomes' ? '+' : '-'}{formatAmount(item.amount)}
                                                            </div>
                                                        </td>
                                                        <td className="pe-4 text-end py-1.5">
                                                            <span className={`badge ${item.status === 'completed' || item.status === 'paid' ? 'bg-success/10 text-success' : 'bg-amber-100 text-amber-700'} border-0 uppercase`} style={{ fontSize: '8px' }}>
                                                                {item.status || 'AUDITED'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {!isLoading && totalPages > 1 && (
                                    <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                                        <PaginationSelector 
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            pageSize={pageSize}
                                            totalItems={totalItems}
                                            onPageChange={setCurrentPage}
                                            onPageSizeChange={(newSize) => {
                                                setPageSize(newSize);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </ScrollReveal>
                        </div>
                    )}
                </div>
            </div>

            <AddPaymentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => loadTransactions()}
            />

            <style>{`
                .active-site { border-color: #009CFF !important; }
                .fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .smaller { font-size: 11px; }
                .site-row:hover { border-color: #009CFF !important; background-color: #f8fbff !important; }
                .directory-scroll-container::-webkit-scrollbar { width: 4px; }
                .directory-scroll-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            `}</style>
        </div>
    );
}
