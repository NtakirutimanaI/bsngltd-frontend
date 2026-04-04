import { useState, useEffect } from "react";
import { Modal } from "@/app/components/Modal";
import { useCurrency } from "@/app/context/CurrencyContext";
import { Coins } from "lucide-react";
import { fetchApi } from '../api/client';
import { toast } from "sonner";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
  sites?: any[]; // Allow passing sites list if already fetched
}

export function AddProjectModal({ isOpen, onClose, onSuccess, initialData, sites: externalSites }: AddProjectModalProps) {
  const { currency, setCurrency } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sites, setSites] = useState<any[]>(externalSites || []);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "construction",
    status: "planning",
    location: "",
    startDate: "",
    endDate: "",
    budget: "",
    manager: "",
    client: "",
    description: "",
    siteId: "",
    imageUrl: "",
    gallery: [] as string[],
  });

  useEffect(() => {
    if (isOpen && (!externalSites || externalSites.length === 0)) {
      fetchApi<any>('/sites?limit=100')
        .then(res => {
          const data = Array.isArray(res) ? res : (res.data || []);
          setSites(data);
        })
        .catch(err => console.error(err));
    }
  }, [isOpen, externalSites]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        type: initialData.type || "construction",
        status: initialData.status || "planning",
        location: initialData.location || "",
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : "",
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : "",
        budget: initialData.budget?.toString().replace(/[^0-9]/g, '') || "",
        manager: initialData.manager || "",
        client: initialData.client || "",
        description: initialData.description || "",
        siteId: initialData.siteId || "",
        imageUrl: initialData.imageUrl || "",
        gallery: initialData.gallery || [],
      });
    } else {
      setFormData({
        name: "",
        code: "",
        type: "construction",
        status: "planning",
        location: "",
        startDate: "",
        endDate: "",
        budget: "",
        manager: "",
        client: "",
        description: "",
        siteId: "",
        imageUrl: "",
        gallery: [],
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isEdit = initialData && initialData.id;
      const url = isEdit ? `/projects/${initialData.id}` : '/projects';
      const method = isEdit ? 'PATCH' : 'POST';

      // Sanitize body for backend (PostgreSQL UUID/Int constraints)
      const sanitizedBody = {
          ...formData,
          siteId: formData.siteId || null,
          progress: isEdit ? (initialData.progress ?? 0) : 0,
          actualCost: isEdit ? (initialData.actualCost ?? '0') : '0',
          gallery: (formData.gallery || []).filter(url => url && url.trim() !== ''),
      };

      await fetchApi(url, {
        method,
        body: JSON.stringify(sanitizedBody),
      });
      if (onSuccess) onSuccess();
      toast.success(`Project ${isEdit ? 'updated' : 'created'} successfully`);
      onClose();
    } catch (error: any) {
      const isEdit = initialData && initialData.id;
      console.error(`Failed to ${isEdit ? 'update' : 'create'} project`, error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} project: ${error.message || 'Check all fields'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData && initialData.id ? "Edit Project" : "Add New Project"} size="md" draggable={true}>
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
        <div className="row g-2">
          <div className="col-md-12 text-start">
            <label className="form-label small fw-medium mb-1">
              Associated Site *
            </label>
            <select
              required
              value={formData.siteId}
              onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              className="form-select form-select-sm"
            >
              <option value="">Select a Site</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., Kigali Tower"
            />
          </div>

          <div className="col-md-6 text-start">
            <label className="form-label small fw-medium mb-1">
              Project Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., PRJ-001"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Project Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="form-select form-select-sm"
            >
              <option value="construction">Construction</option>
              <option value="renovation">Renovation</option>
              <option value="plot_sale">Plot Sale</option>
              <option value="rental">Rental</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="form-select form-select-sm"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., Kigali, Rwanda"
            />
          </div>

          <div className="col-md-6">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <label className="form-label small fw-medium mb-0">
                Budget ({currency}) *
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
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., 500000000"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="form-control form-control-sm"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">End Date *</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="form-control form-control-sm"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Project Manager *
            </label>
            <input
              type="text"
              required
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., Jean Baptiste"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">Client Name *</label>
            <input
              type="text"
              required
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., Gov. of Rwanda"
            />
          </div>
        </div>

        <div>
          <label className="form-label small fw-medium mb-1">
            Project Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="form-control form-control-sm"
            placeholder="Project description..."
            style={{ resize: 'none' }}
          />
        </div>

        <div className="border-top pt-2 mt-2">
          <label className="form-label small fw-bold text-primary mb-1 d-block" style={{ fontSize: '10px' }}>MEDIA & IMAGERY (OPTIONAL)</label>
          <div className="row g-2">
            <div className="col-12">
              <label className="form-label smaller fw-medium mb-1">Primary Project Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="form-control form-control-sm"
                placeholder="https://example.com/main-image.jpg"
              />
            </div>
            <div className="col-12">
              <label className="form-label smaller fw-medium mb-1">Project Gallery (Other Images)</label>
              {formData.gallery.map((img, index) => (
                <div key={index} className="d-flex gap-2 mb-1">
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => {
                      const newGallery = [...formData.gallery];
                      newGallery[index] = e.target.value;
                      setFormData({ ...formData, gallery: newGallery });
                    }}
                    className="form-control form-control-sm"
                    placeholder="https://example.com/gallery-image.jpg"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const newGallery = formData.gallery.filter((_, i) => i !== index);
                      setFormData({ ...formData, gallery: newGallery });
                    }}
                    className="btn btn-sm btn-outline-danger px-2 py-0"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, gallery: [...formData.gallery, ""] })}
                className="btn btn-sm btn-outline-primary text-xs py-0 mt-1"
              >
                + Add Another Image
              </button>
            </div>
          </div>
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
              background: '#009CFF',
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
              if (!isSubmitting) e.currentTarget.style.background = '#009CFF';
            }}
          >
            {isSubmitting ? (initialData && initialData.id ? "Updating..." : "Creating...") : (initialData && initialData.id ? "Update Project" : "Create Project")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
