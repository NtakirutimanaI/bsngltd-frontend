import { useState, useEffect } from "react";
import { Modal } from "@/app/components/Modal";
import { fetchApi } from '../api/client';
import { ShieldCheck } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export function AddUserModal({ isOpen, onClose, onSuccess, initialData }: AddUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    userRole: "general_user",
    password: "",
    isActive: true,
    siteId: "",
  });

  const [sites, setSites] = useState<any[]>([]);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const res = await fetchApi<any>('/sites?limit=100');
        const data = Array.isArray(res) ? res : (res.data || []);
        setSites(data);
      } catch (err) {
        console.error("Failed to load sites", err);
      }
    };
    loadSites();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        username: initialData.username || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        userRole: initialData.userRole || "general_user",
        password: "", // Handled separately
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        siteId: initialData.siteId || "",
      });
    } else {
      setFormData({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        userRole: "general_user",
        password: "",
        isActive: true,
        siteId: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = initialData ? `/users/${initialData.id}` : '/users';
      const method = initialData ? 'PATCH' : 'POST';

      const operationalRoles = ['super_admin', 'admin', 'manager', 'site_manager', 'hr', 'accountant', 'auditor', 'employee', 'contractor'];
      const isOperational = operationalRoles.includes(formData.userRole);

      if (isOperational && !formData.siteId) {
        alert("A project site must be assigned to this staff member/administrator for attendance tracking.");
        setIsSubmitting(false);
        return;
      }

      const payload: any = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        userRole: formData.userRole,
        isActive: formData.isActive,
        siteId: formData.siteId || null,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await fetchApi(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(`Failed to ${initialData ? 'update' : 'create'} user`, error);
      alert(`Failed to ${initialData ? 'update' : 'create'} user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit User Permissions" : "Add New User Account"} size="md" draggable={true}>
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 p-2 text-start">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1 text-dark">FULL NAME</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="form-control form-control-sm rounded-lg"
              placeholder="e.g., Innocent Ntakirutimana"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1 text-dark">USERNAME</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="form-control form-control-sm rounded-lg"
              placeholder="e.g., innocent_nt"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1 text-dark">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-control form-control-sm rounded-lg"
              placeholder="e.g., mail@example.com"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1 text-dark">PHONE NUMBER</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="form-control form-control-sm rounded-lg"
              placeholder="+250 788 000 000"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1 text-dark">SYSTEM ROLE</label>
            {/* Protected Role Display for Admins */}
            {(formData.userRole === 'super_admin' || formData.userRole === 'admin') ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 d-flex align-items-center gap-2 mb-1 shadow-sm">
                <div className="bg-primary text-white rounded-lg p-1.5 shadow-sm">
                    <ShieldCheck size={14} />
                </div>
                <div>
                   <div className="smaller text-primary fw-bold" style={{ fontSize: '9px' }}>PROTECTED SYSTEM ROLE</div>
                   <div className="fw-bold text-dark small">{formData.userRole.replace('_', ' ').toUpperCase()}</div>
                </div>
              </div>
            ) : (
              <select
                value={formData.userRole}
                onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                className="form-select form-select-sm rounded-lg shadow-sm border-gray-200"
              >
                <optgroup label="Management">
                  <option value="manager">General Manager</option>
                  <option value="site_manager">Site Manager</option>
                  <option value="hr">HR Manager</option>
                  <option value="accountant">Senior Accountant</option>
                </optgroup>
                <optgroup label="Monitoring">
                  <option value="auditor">System Auditor</option>
                  <option value="consultant">Project Consultant</option>
                </optgroup>
                <optgroup label="Content">
                  <option value="editor">Editor</option>
                  <option value="content_editor">Content Editor</option>
                </optgroup>
                <optgroup label="Staff & Workforce">
                  <option value="employee">Staff Member</option>
                  <option value="contractor">External Contractor</option>
                  <option value="volunteer">Volunteer</option>
                </optgroup>
                <optgroup label="External Stakeholders">
                  <option value="client">Valued Client</option>
                  <option value="donor">Sponsor (Donor)</option>
                  <option value="partner">Organization Partner</option>
                  <option value="investor">Investor</option>
                </optgroup>
                <optgroup label="Others">
                  <option value="general_user">General User</option>
                  <option value="guest">Guest</option>
                </optgroup>
              </select>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1 text-dark">ASSIGNED SITE</label>
            <select
              value={formData.siteId}
              onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
              className="form-select form-select-sm rounded-lg"
            >
              <option value="">No Site Assigned</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name} ({site.code})</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold mb-1 text-dark">
              {initialData ? "RESET PASSWORD (OPTIONAL)" : "PASSWORD"}
            </label>
            <input
              type="password"
              required={!initialData}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-control form-control-sm rounded-lg"
              placeholder="••••••••"
            />
          </div>

          <div className="col-12 mt-2">
            <div className="form-check form-switch bg-light p-2 rounded-lg border">
              <input 
                className="form-check-input ms-0" 
                type="checkbox" 
                role="switch" 
                id="isActiveSwitch"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              <label className="form-check-label ms-2 small fw-bold text-dark" htmlFor="isActiveSwitch">
                 {formData.isActive ? "ACCOUNT IS ACTIVE" : "ACCOUNT IS SUSPENDED"}
              </label>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top mt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-light px-4 py-1.5 fw-bold text-muted shadow-sm rounded-lg text-xs border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary px-4 py-1.5 fw-bold shadow-sm rounded-lg text-xs border-0"
            style={{ background: '#009CFF' }}
          >
            {isSubmitting ? "Processing..." : (initialData ? "Save Permissions" : "Create User")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
