import { useState, useEffect } from "react";
import { Modal } from "@/app/components/Modal";
import { useCurrency } from "@/app/context/CurrencyContext";
import { Coins, Globe } from "lucide-react";

import { fetchApi } from '../api/client';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

const languages = [
  { id: 'en', name: 'English' },
  { id: 'rw', name: 'Kinyarwanda' },
  { id: 'sw', name: 'Swahili' },
  { id: 'fr', name: 'French' },
];

export function AddPropertyModal({ isOpen, onClose, onSuccess, initialData }: AddPropertyModalProps) {
  const { currency, setCurrency } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLang, setActiveLang] = useState('en');

  // Localized fields state
  const [localizedData, setLocalizedData] = useState<Record<string, Record<string, string>>>({
    title: { en: "", rw: "", sw: "", fr: "" },
    location: { en: "", rw: "", sw: "", fr: "" },
    description: { en: "", rw: "", sw: "", fr: "" },
  });

  const [formData, setFormData] = useState({
    code: "",
    type: "house",
    status: "available",
    size: "",
    price: "",
    monthlyRent: "",
    isForSale: true,
    isForRent: false,
    bedrooms: "",
    bathrooms: "",
    upi: "",
  });

  const parseLocalized = (val: any) => {
    if (!val) return { en: "", rw: "", sw: "", fr: "" };
    if (typeof val === 'object') return { en: "", rw: "", sw: "", fr: "", ...val };
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return { en: "", rw: "", sw: "", fr: "", ...parsed };
      } catch (e) {
        return { en: val, rw: "", sw: "", fr: "" };
      }
    }
    return { en: "", rw: "", sw: "", fr: "" };
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || "",
        type: initialData.type || "house",
        status: initialData.status || "available",
        size: initialData.size?.toString() || "",
        price: initialData.price?.toString() || "",
        monthlyRent: initialData.monthlyRent?.toString() || "",
        isForSale: initialData.isForSale ?? true,
        isForRent: initialData.isForRent ?? false,
        bedrooms: initialData.bedrooms?.toString() || "",
        bathrooms: initialData.bathrooms?.toString() || "",
        upi: initialData.upi || "",
      });
      setLocalizedData({
        title: parseLocalized(initialData.title),
        location: parseLocalized(initialData.location),
        description: parseLocalized(initialData.description),
      });
    } else {
      setFormData({
        code: "",
        type: "house",
        status: "available",
        size: "",
        price: "",
        monthlyRent: "",
        isForSale: true,
        isForRent: false,
        bedrooms: "",
        bathrooms: "",
        upi: "",
      });
      setLocalizedData({
        title: { en: "", rw: "", sw: "", fr: "" },
        location: { en: "", rw: "", sw: "", fr: "" },
        description: { en: "", rw: "", sw: "", fr: "" },
      });
    }
  }, [initialData, isOpen]);

  const handleLocalizedChange = (field: string, val: string) => {
    setLocalizedData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [activeLang]: val
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = initialData ? `/properties/${initialData.id}` : '/properties';
      const method = initialData ? 'PUT' : 'POST';

      await fetchApi(url, {
        method,
        body: JSON.stringify({
          ...formData,
          title: JSON.stringify(localizedData.title),
          location: JSON.stringify(localizedData.location),
          description: JSON.stringify(localizedData.description),
          size: Number(formData.size),
          price: Number(formData.price),
          monthlyRent: formData.monthlyRent ? Number(formData.monthlyRent) : null,
          bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        }),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(`Failed to ${initialData ? 'update' : 'create'} property`, error);
      alert(`Failed to ${initialData ? 'update' : 'create'} property`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Property" : "Add New Property"} size="md" draggable={true}>
      <div className="mb-4 bg-light p-2 rounded d-flex gap-2">
        {languages.map(lang => (
          <button
            key={lang.id}
            onClick={() => setActiveLang(lang.id)}
            className={`btn text-xs h-6 d-flex align-items-center gap-1 px-2 py-1 rounded-pill transition-all ${activeLang === lang.id
              ? 'btn-primary shadow-sm'
              : 'btn-light hover-bg-gray-200 text-muted'
              }`}
          >
            <Globe size={14} />
            <span className="fw-bold small text-uppercase">{lang.id}</span>
          </button>
        ))}
        <div className="ms-auto d-flex align-items-center px-3">
          <span className="text-xs text-muted fw-bold text-uppercase">Editing: {languages.find(l => l.id === activeLang)?.name}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
        <div className="row g-2">
          <div className="col-md-6 text-primary">
            <label className="form-label small fw-bold mb-1 d-flex align-items-center gap-1">
              Property Title ({activeLang.toUpperCase()}) *
            </label>
            <input
              type="text"
              required={activeLang === 'en'}
              value={localizedData.title[activeLang]}
              onChange={(e) => handleLocalizedChange('title', e.target.value)}
              className="form-control form-control-sm border-primary border-opacity-25"
              placeholder={`Title in ${languages.find(l => l.id === activeLang)?.name}`}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Property Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., PROP-001"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Property Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="form-select form-select-sm"
            >
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="form-select form-select-sm"
            >
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="sold">Sold</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="col-md-6 text-primary">
            <label className="form-label small fw-bold mb-1">
              Location ({activeLang.toUpperCase()}) *
            </label>
            <input
              type="text"
              required={activeLang === 'en'}
              value={localizedData.location[activeLang]}
              onChange={(e) => handleLocalizedChange('location', e.target.value)}
              className="form-control form-control-sm border-primary border-opacity-25"
              placeholder={`Location in ${languages.find(l => l.id === activeLang)?.name}`}
            />
          </div>

          {formData.type === "plot" && (
            <div className="col-md-6">
              <label className="form-label small fw-medium mb-1">
                UPI
              </label>
              <input
                type="text"
                value={formData.upi}
                onChange={(e) => setFormData({ ...formData, upi: e.target.value })}
                className="form-control form-control-sm"
                placeholder="e.g., 1/03/..."
              />
            </div>
          )}

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Size (sqft) *
            </label>
            <input
              type="number"
              required
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., 450"
            />
          </div>

          <div className="col-md-6">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <label className="form-label small fw-medium mb-0">
                Price ({currency}) *
              </label>
              <button
                type="button"
                onClick={() => setCurrency(currency === 'USD' ? 'RWF' : 'USD')}
                className="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1"
                style={{ fontSize: '10px' }}
              >
                <Coins className="w-3 h-3" />
                {currency === 'USD' ? 'FRW' : 'USD'}
              </button>
            </div>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., 250000000"
            />
          </div>

          {formData.type !== "plot" && (
            <>
              <div className="col-md-6">
                <label className="form-label small fw-medium mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="form-control form-control-sm"
                  placeholder="e.g., 5"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-medium mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="form-control form-control-sm"
                  placeholder="e.g., 4"
                />
              </div>
            </>
          )}

          <div className="col-md-6">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <label className="form-label small fw-medium mb-0">
                Monthly Rent ({currency})
              </label>
              <button
                type="button"
                onClick={() => setCurrency(currency === 'USD' ? 'RWF' : 'USD')}
                className="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1"
                style={{ fontSize: '10px' }}
              >
                <Coins className="w-3 h-3" />
                Switch
              </button>
            </div>
            <input
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., 2000000"
            />
          </div>
        </div>

        <div className="d-flex gap-3 border-top pt-2 border-bottom pb-2">
          <div className="form-check">
            <input
              type="checkbox"
              id="isForSale"
              checked={formData.isForSale}
              onChange={(e) => setFormData({ ...formData, isForSale: e.target.checked })}
              className="form-check-input"
            />
            <label htmlFor="isForSale" className="form-check-label text-muted small fw-medium">
              For Sale
            </label>
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              id="isForRent"
              checked={formData.isForRent}
              onChange={(e) => setFormData({ ...formData, isForRent: e.target.checked })}
              className="form-check-input"
            />
            <label htmlFor="isForRent" className="form-check-label text-muted small fw-medium">
              For Rent
            </label>
          </div>
        </div>

        <div className="text-primary">
          <label className="form-label small fw-bold mb-1">Description ({activeLang.toUpperCase()})</label>
          <textarea
            value={localizedData.description[activeLang]}
            onChange={(e) => handleLocalizedChange('description', e.target.value)}
            rows={2}
            className="form-control form-control-sm border-primary border-opacity-25"
            placeholder={`Description in ${languages.find(l => l.id === activeLang)?.name}`}
            style={{ resize: 'none' }}
          />
        </div>

        <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top mt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn d-flex align-items-center justify-content-center"
            style={{
              background: 'transparent',
              border: '2px solid #6c757d',
              color: '#6c757d',
              fontWeight: 600,
              fontSize: '12px',
              height: '32px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              padding: '0 20px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#6c757d';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6c757d';
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn d-flex align-items-center justify-content-center"
            style={{
              background: '#16a085',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: '12px',
              height: '32px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              padding: '0 20px',
              opacity: isSubmitting ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.background = '#1a9b7d';
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) e.currentTarget.style.background = '#16a085';
            }}
          >
            {isSubmitting ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Property" : "Add Property")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
