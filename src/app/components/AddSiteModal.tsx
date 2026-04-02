import { useState, useEffect } from "react";
import { Modal } from "@/app/components/Modal";
import { fetchApi } from '../api/client';
import { toast } from "sonner";

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export function AddSiteModal({ isOpen, onClose, onSuccess, initialData }: AddSiteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    status: "active",
    managerId: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        location: initialData.location || "",
        status: initialData.status || "active",
        managerId: initialData.managerId || "",
      });
    } else {
      setFormData({
        name: "",
        code: "",
        location: "",
        status: "active",
        managerId: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = initialData ? `/sites/${initialData.id}` : '/sites';
      const method = initialData ? 'PUT' : 'POST';

      await fetchApi(url, {
        method,
        body: JSON.stringify(formData),
      });
      toast.success(`Site ${initialData ? 'updated' : 'created'} successfully`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(`Failed to ${initialData ? 'update' : 'create'} site`, error);
      toast.error(`Failed to ${initialData ? 'update' : 'create'} site`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Site" : "Add New Site"} size="md" draggable={true}>
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1">
              Site Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-control"
              placeholder="e.g., Kigali Heights Site"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1">
              Site Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="form-control"
              placeholder="e.g., SITE-001"
            />
          </div>

          <div className="col-12">
            <label className="form-label small fw-bold mb-1">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="form-control"
              placeholder="e.g., Kigali, Gasabo, KG 15 Ave"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1">Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1">Manager (Optional)</label>
            <input
              type="text"
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              className="form-control"
              placeholder="Manager name or ID"
            />
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top mt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline-secondary px-4 fw-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary px-4 fw-bold"
          >
            {isSubmitting ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Site" : "Create Site")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
