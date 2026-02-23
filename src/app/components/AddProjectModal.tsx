import { useState, useEffect } from "react";
import { Modal } from "@/app/components/Modal";
import { useCurrency } from "@/app/context/CurrencyContext";
import { Coins } from "lucide-react";
import { fetchApi } from '../api/client';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export function AddProjectModal({ isOpen, onClose, onSuccess, initialData }: AddProjectModalProps) {
  const { currency, setCurrency } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  });

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
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = initialData ? `/projects/${initialData.id}` : '/projects';
      const method = initialData ? 'PUT' : 'POST';

      await fetchApi(url, {
        method,
        body: JSON.stringify({
          ...formData,
          progress: initialData ? initialData.progress : 0,
          actualCost: initialData ? initialData.actualCost : '0',
        }),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(`Failed to ${initialData ? 'update' : 'create'} project`, error);
      alert(`Failed to ${initialData ? 'update' : 'create'} project`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Project" : "Add New Project"} size="md" draggable={true}>
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
        <div className="row g-2">
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

          <div className="col-md-6">
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

        <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline-secondary text-xs h-6 px-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary text-xs h-6 px-2"
          >
            {isSubmitting ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Project" : "Create Project")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
