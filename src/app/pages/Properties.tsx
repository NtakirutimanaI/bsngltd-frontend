import { useState, useEffect } from "react";
import { Home, MapPin, Maximize2, Plus, Search, Eye, Edit2, Building, LandPlot, Store } from "lucide-react";
import { AddPropertyModal } from "@/app/components/AddPropertyModal";
import { useCurrency } from "@/app/context/CurrencyContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { PaginationSelector } from "@/app/components/ui/pagination-selector";
import { Modal } from '@/app/components/Modal';
import { useDebounce } from "@/app/hooks/useDebounce";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

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
  bedrooms?: number;
  bathrooms?: number;
  image: string;
}

import { fetchApi } from '../api/client';

export function Properties({ hideHeader = false }: { hideHeader?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { currency } = useCurrency();
  const { dt } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const query = new URLSearchParams({
      page: currentPage.toString(),
      limit: pageSize.toString(),
      search: debouncedSearchTerm,
      type: filterType,
      status: filterStatus,
      t: refreshKey.toString()
    }).toString();

    fetchApi<PaginatedResponse<Property>>(`/properties?${query}`)
      .then(res => {
        setProperties(res.data || []);
        setTotalPages(res.lastPage || 1);
        setTotalItems(res.total || 0);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch properties", err);
        setIsLoading(false);
      });
  }, [currentPage, pageSize, debouncedSearchTerm, filterType, filterStatus, refreshKey]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-success text-white";
      case "rented":
        return "bg-primary text-white";
      case "sold":
        return "bg-secondary text-white";
      case "maintenance":
        return "bg-warning text-dark";
      default:
        return "bg-light text-dark";
    }
  };

  const getTypeIcon = (type: string, size: number = 24) => {
    switch (type) {
      case "house": return <Home size={size} className="text-primary" />;
      case "apartment": return <Building size={size} className="text-info" />;
      case "plot": return <LandPlot size={size} className="text-warning" />;
      case "commercial": return <Store size={size} className="text-danger" />;
      default: return <Home size={size} className="text-muted" />;
    }
  };

  const formatPrice = (priceRWF: number) => {
    if (currency === 'RWF') {
      return new Intl.NumberFormat('rw-RW', {
        style: 'currency',
        currency: 'RWF',
        maximumFractionDigits: 0
      }).format(priceRWF);
    } else {
      const priceUSD = priceRWF / 1300;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(priceUSD);
    }
  };


  return (
    <div className="container-fluid bg-white min-vh-100 px-2 px-md-4 pt-4 pb-4">
      {/* Header */}
      {!hideHeader && (
        <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="h4 fw-bold text-dark mb-1">Properties</h1>
            <p className="text-muted small mb-0">Browse and manage available properties for sale and rent</p>
          </div>
          <button
            onClick={() => {
              setEditingProperty(null);
              setIsAddModalOpen(true);
            }}
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2.5 fw-bold shadow-sm"
            style={{ borderRadius: '10px' }}
          >
            <Plus size={18} />
            Add Property
          </button>
        </ScrollReveal>
      )}

      {/* Filters */}
      <ScrollReveal delay={0.1} className="bg-light rounded p-4 mb-4 shadow-sm">
        <div className="p-0">
          <div className="row g-3 align-items-center">
            <div className="col-lg-7 position-relative">
              <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={18} />
              <input
                type="text"
                placeholder="Find properties by title, code or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control ps-5 bg-light border-0 focus:bg-white transition-all shadow-none"
                style={{ height: '45px', borderRadius: '10px', fontSize: '14px' }}
              />
            </div>
            <div className="col-lg-5 d-flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="form-select bg-light border-0 shadow-none fw-semibold"
                style={{ height: '45px', borderRadius: '10px', fontSize: '13px' }}
              >
                <option value="all">All Types</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select bg-light border-0 shadow-none fw-semibold"
                style={{ height: '45px', borderRadius: '10px', fontSize: '13px' }}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="sold">Sold</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Properties Grid */}
      <div className="row g-4">
        {properties.map((property, index) => (
          <div key={property.id} className="col-md-6 col-lg-4">
            <ScrollReveal
              delay={index * 0.1}
              className="bg-light rounded p-4 shadow-sm h-100 transition-all border-0 shadow-sm"
            >
              <div className="position-relative d-flex align-items-center justify-content-center bg-gray-50 dark:bg-gray-800 border-bottom border-gray-100 dark:border-gray-700" style={{ height: '150px' }}>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                  {getTypeIcon(property.type, 32)}
                </div>
                <div className="position-absolute top-0 end-0 m-3">
                  <span
                    className={`badge ${getStatusColor(
                      property.status
                    )}`}
                  >
                    {property.status.toUpperCase()}
                  </span>
                </div>
                <div className="position-absolute top-0 start-0 m-3 d-flex gap-2">
                  {property.isForSale && (
                    <span className="badge bg-white text-primary shadow-sm">
                      FOR SALE
                    </span>
                  )}
                  {property.isForRent && (
                    <span className="badge bg-white text-info shadow-sm">
                      FOR RENT
                    </span>
                  )}
                </div>
              </div>

              <div className="p-0">
                <h5 className="card-title fw-bold text-dark mb-1">{dt(property.title)}</h5>
                <small className="text-muted d-block mb-3">{property.code}</small>

                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <MapPin className="w-4 h-4" />
                    <span>{dt(property.location)}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <Maximize2 className="w-4 h-4" />
                    <span>{property.size} sqft</span>
                  </div>
                  {(property.bedrooms || property.bathrooms) && (
                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <Home className="w-4 h-4" />
                      <span>
                        {property.bedrooms && `${property.bedrooms} beds`}
                        {property.bedrooms && property.bathrooms && " • "}
                        {property.bathrooms && `${property.bathrooms} baths`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-top pt-3">
                  {property.isForSale && (
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted small">Sale:</span>
                      <span className="fw-bold text-dark">
                        {formatPrice(property.price)}
                      </span>
                    </div>
                  )}
                  {property.isForRent && property.monthlyRent && (
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Rent:</span>
                      <span className="fw-semibold text-primary small">
                        {formatPrice(property.monthlyRent)}/mo
                      </span>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2 mt-2">
                  <button
                    onClick={() => setSelectedProperty(property)}
                    className="btn btn-light flex-grow-1 border shadow-sm py-2 fw-bold text-primary d-flex align-items-center justify-content-center gap-2"
                    style={{ borderRadius: '10px', fontSize: '13px' }}
                  >
                    <Eye size={16} />
                    Details
                  </button>
                  <button
                    onClick={() => {
                      setEditingProperty(property);
                      setIsAddModalOpen(true);
                    }}
                    className="btn btn-primary shadow-sm p-2 d-flex align-items-center justify-content-center"
                    style={{ borderRadius: '10px', width: '40px', height: '40px' }}
                    title="Edit Property"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        ))}
      </div>

      {properties.length === 0 && !isLoading && (
        <ScrollReveal delay={0.2} className="text-center py-5">
          <Home className="text-muted w-12 h-12 mx-auto mb-3" size={48} />
          <p className="text-muted">No properties found matching your criteria.</p>
        </ScrollReveal>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <ScrollReveal delay={0.3} className="py-4">
          <PaginationSelector
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1); // Reset to first page when changing page size
            }}
          />
        </ScrollReveal>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProperty(null);
        }}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
        initialData={editingProperty}
      />

      {/* Property Details Modal */}
      <Modal isOpen={!!selectedProperty} onClose={() => setSelectedProperty(null)} title="Property Details" size="md" draggable={true}>
        {selectedProperty && (
          <div className="flex flex-col gap-2">
            <div className="position-relative d-flex align-items-center justify-content-center bg-gray-900 rounded overflow-hidden" style={{ height: '120px', background: '#009CFF' }}>
              <div className="bg-white/20 p-3 rounded-xl shadow-sm">
                {getTypeIcon(selectedProperty.type, 36)}
              </div>
              <div className="position-absolute bottom-0 start-0 m-3 text-white">
                <span className={`badge ${getStatusColor(selectedProperty.status)} mb-1`} style={{ fontSize: '0.7rem' }}>
                  {selectedProperty.status.toUpperCase()}
                </span>
                <h4 className="fw-bold mb-0 text-white">{dt(selectedProperty.title)}</h4>
                <p className="opacity-75 mb-0 small text-white">{selectedProperty.code}</p>
              </div>
            </div>

            <div className="row g-2">
              <div className="col-md-7">
                <h5 className="fw-bold mb-2 dark:text-gray-100 text-xs">Property Overview</h5>
                <div className="row g-2">
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                      <MapPin className="w-4 h-4" /> Location
                    </div>
                    <div className="fw-medium font-bold text-lg dark:text-gray-200">{dt(selectedProperty.location)}</div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                      <Maximize2 className="w-4 h-4" /> Unit Size
                    </div>
                    <div className="fw-medium font-bold text-lg dark:text-gray-200">{selectedProperty.size} sqft</div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                      <Home className="w-4 h-4" /> Type
                    </div>
                    <div className="fw-medium font-bold text-lg text-capitalize dark:text-gray-200">{selectedProperty.type}</div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                      <Home className="w-4 h-4" /> Capacity
                    </div>
                    <div className="fw-medium font-bold text-lg dark:text-gray-200">
                      {selectedProperty.bedrooms ? `${selectedProperty.bedrooms} Beds ` : ''}
                      {selectedProperty.bathrooms ? `| ${selectedProperty.bathrooms} Baths` : ''}
                      {!selectedProperty.bedrooms && !selectedProperty.bathrooms && 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-5">
                <div className="bg-light dark:bg-gray-800 rounded-4 p-4 h-100">
                  <h5 className="fw-bold mb-3 dark:text-gray-100">Financial Overview</h5>
                  {selectedProperty.isForSale && (
                    <div className="mb-4">
                      <label className="text-muted small d-block mb-1">Selling Price</label>
                      <div className="h3 fw-bold text-primary mb-0">{formatPrice(selectedProperty.price)}</div>
                    </div>
                  )}
                  {selectedProperty.isForRent && selectedProperty.monthlyRent && (
                    <div className="mb-0">
                      <label className="text-muted small d-block mb-1">Monthly Rental</label>
                      <div className="h3 fw-bold text-dark dark:text-gray-200 mb-0">{formatPrice(selectedProperty.monthlyRent)}<span className="small opacity-50">/mo</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-3 pt-4 border-top mt-4">
              <button
                type="button"
                className="btn btn-light px-4 py-2 border fw-bold text-muted shadow-sm"
                style={{ borderRadius: '10px' }}
                onClick={() => setSelectedProperty(null)}
              >
                Close
              </button>
              <button
                className="btn btn-primary px-5 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 disabled"
              >
                Message Manager
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


