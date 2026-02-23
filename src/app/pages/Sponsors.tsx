import { useState, useEffect } from "react";
import {
  HandCoins,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from '../api/client';
import { Modal } from '@/app/components/Modal';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
import { useDebounce } from "@/app/hooks/useDebounce";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

interface Sponsor {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  investmentAmount: number;
  investmentDate: string;
  status: string;
  projects: number;
}


export function Sponsors() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterType, setFilterType] = useState("all");
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const query = new URLSearchParams({
      page: currentPage.toString(),
      limit: '6',
      search: debouncedSearchTerm,
      type: filterType
    }).toString();

    fetchApi<PaginatedResponse<Sponsor>>(`/sponsors?${query}`)
      .then(res => {
        setSponsors(res.data || []);
        setTotalPages(res.lastPage || 1);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch sponsors", err);
        setIsLoading(false);
      });
  }, [currentPage, debouncedSearchTerm, filterType]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "government":
        return "bg-blue-100 text-blue-800";
      case "company":
        return "bg-purple-100 text-purple-800";
      case "individual":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "government":
        return "🏛️";
      case "company":
        return "🏢";
      case "individual":
        return "👤";
      default:
        return "💼";
    }
  };

  const formatAmount = (amount: number) => {
    return `RWF ${(amount / 1000000).toFixed(1)}M`;
  };

  const totalInvestment = sponsors.reduce((sum, s) => sum + s.investmentAmount, 0);
  const totalProjects = sponsors.reduce((sum, s) => sum + s.projects, 0);


  return (
    <div className="space-y-6">
      {/* Header */}
      <ScrollReveal className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sponsors & Investors</h1>
          <p className="text-gray-600 mt-1">
            Manage relationships with project sponsors and investors
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-sm">
          <Plus className="h-4 w-4" />
          Add Sponsor
        </button>
      </ScrollReveal>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ScrollReveal delay={0.1} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sponsors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{sponsors.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <HandCoins className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Investment</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatAmount(totalInvestment)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sponsored Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalProjects}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Investment</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatAmount(totalInvestment / (sponsors.length || 1))}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Filters */}
      <ScrollReveal delay={0.5} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sponsors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-transparent border-0 border-b-2 border-gray-400 rounded-none focus:outline-none focus:ring-0 focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Types</option>
              <option value="government">Government</option>
              <option value="company">Company</option>
              <option value="individual">Individual</option>
            </select>
          </div>
        </div>
      </ScrollReveal>

      {/* Sponsors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map((sponsor, index) => (
          <ScrollReveal
            key={sponsor.id}
            delay={index * 0.1}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{getTypeIcon(sponsor.type)}</div>
                <div>
                  <h3 className="font-semibold text-gray-900">{sponsor.name}</h3>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTypeColor(
                      sponsor.type
                    )}`}
                  >
                    {sponsor.type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{sponsor.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span className="truncate">{sponsor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{sponsor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Since {sponsor.investmentDate}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Total Investment:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatAmount(sponsor.investmentAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sponsored Projects:</span>
                <span className="text-base font-semibold text-orange-600">
                  {sponsor.projects}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedSponsor(sponsor)}
              className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Details
            </button>
          </ScrollReveal>
        ))}
      </div>

      {sponsors.length === 0 && !isLoading && (
        <ScrollReveal className="text-center py-12">
          <HandCoins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No sponsors found matching your criteria.</p>
        </ScrollReveal>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <ScrollReveal delay={0.6} className="pt-4 pb-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </ScrollReveal>
      )}
      {/* Sponsor Details Modal */}
      <Modal isOpen={!!selectedSponsor} onClose={() => setSelectedSponsor(null)} title="Sponsor Details" size="sm" draggable={true}>
        {selectedSponsor && (
          <div className="flex flex-col gap-4">
            <div className="bg-orange-600 p-4 rounded-xl text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="text-2xl bg-white/20 p-2 rounded-xl">
                  {getTypeIcon(selectedSponsor.type)}
                </div>
                <div>
                  <h2 className="text-lg font-bold mb-0 text-white">{selectedSponsor.name}</h2>
                  <p className="text-orange-100 uppercase text-[10px] font-bold tracking-wider mb-0 text-white">
                    {selectedSponsor.type} Investor
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Contact Information</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><Users className="h-4 w-4 text-gray-500" /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0">Contact Person</p>
                    <p className="font-semibold text-sm mb-0 dark:text-gray-200">{selectedSponsor.contactPerson}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><Mail className="h-4 w-4 text-gray-500" /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0">Email Address</p>
                    <p className="font-semibold text-sm mb-0 truncate dark:text-gray-200">{selectedSponsor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"><Phone className="h-4 w-4 text-gray-500" /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0">Phone Number</p>
                    <p className="font-semibold text-sm mb-0 dark:text-gray-200">{selectedSponsor.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Investment Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-[10px] text-green-600 font-bold uppercase">Investment</span>
                    </div>
                    <p className="font-bold text-green-700 dark:text-green-400 mb-0">{formatAmount(selectedSponsor.investmentAmount)}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-[10px] text-blue-600 font-bold uppercase">Projects</span>
                    </div>
                    <p className="font-bold text-blue-700 dark:text-blue-400 mb-0">{selectedSponsor.projects}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 dark:border-orange-900/30">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-[10px] text-orange-500 mb-0">Sponsor Since</p>
                    <p className="font-semibold text-sm mb-0 dark:text-gray-200">{selectedSponsor.investmentDate}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setSelectedSponsor(null)}
                className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-1.5 bg-gray-900 dark:bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-black dark:hover:bg-orange-700 transition-colors">
                Send Message
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div >
  );
}
