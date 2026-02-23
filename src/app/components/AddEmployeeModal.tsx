import { useState, useEffect } from "react";
import { Modal } from "@/app/components/Modal";
import { useCurrency } from "@/app/context/CurrencyContext";
import { Coins } from "lucide-react";
import { fetchApi } from '../api/client';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export function AddEmployeeModal({ isOpen, onClose, onSuccess, initialData }: AddEmployeeModalProps) {
  const { currency, setCurrency } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    phone: "",
    department: "Engineering",
    position: "",
    hireDate: "",
    salaryType: "monthly",
    baseSalary: "",
    bankAccount: "",
    momoNumber: "",
    paymentPreference: "bank",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.name || "",
        employeeId: initialData.employeeId || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        department: initialData.department || "Engineering",
        position: initialData.position || "",
        hireDate: initialData.hireDate ? initialData.hireDate.split('T')[0] : "",
        salaryType: initialData.salaryType || "monthly",
        baseSalary: initialData.baseSalary?.toString() || "",
        bankAccount: initialData.bankAccount || "",
        momoNumber: initialData.momoNumber || "",
        paymentPreference: initialData.paymentPreference || "bank",
      });
    } else {
      setFormData({
        fullName: "",
        employeeId: "",
        email: "",
        phone: "",
        department: "Engineering",
        position: "",
        hireDate: "",
        salaryType: "monthly",
        baseSalary: "",
        bankAccount: "",
        momoNumber: "",
        paymentPreference: "bank",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = initialData ? `/employees/${initialData.id}` : '/employees';
      const method = initialData ? 'PUT' : 'POST';

      await fetchApi(url, {
        method,
        body: JSON.stringify({
          name: formData.fullName,
          employeeId: formData.employeeId,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          position: formData.position,
          hireDate: formData.hireDate,
          salaryType: formData.salaryType,
          baseSalary: Number(formData.baseSalary),
          status: initialData ? initialData.status : 'active',
          attendance: initialData ? initialData.attendance : 0,
        }),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(`Failed to ${initialData ? 'update' : 'create'} employee`, error);
      alert(`Failed to ${initialData ? 'update' : 'create'} employee`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Employee" : "Add New Employee"} size="md" draggable={true}>
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., Jean Mugisha"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Employee ID *
            </label>
            <input
              type="text"
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., EMP-001"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., jean@bsng.rw"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="form-control form-control-sm"
              placeholder="+250 788..."
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="form-select form-select-sm"
            >
              <option value="Engineering">Engineering</option>
              <option value="Management">Management</option>
              <option value="Operations">Operations</option>
              <option value="Finance">Finance</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Procurement">Procurement</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Position *
            </label>
            <input
              type="text"
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., Senior Engineer"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Hire Date *
            </label>
            <input
              type="date"
              required
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              className="form-control form-control-sm"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Salary Type *
            </label>
            <select
              value={formData.salaryType}
              onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
              className="form-select form-select-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>

          <div className="col-md-6">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <label className="form-label small fw-medium mb-0">
                Base Salary ({currency}) *
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
              value={formData.baseSalary}
              onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., 1200000"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Payment Preference *
            </label>
            <select
              value={formData.paymentPreference}
              onChange={(e) =>
                setFormData({ ...formData, paymentPreference: e.target.value })
              }
              className="form-select form-select-sm"
            >
              <option value="bank">Bank Transfer</option>
              <option value="momo">Mobile Money</option>
            </select>
          </div>

          {formData.paymentPreference === "bank" && (
            <div className="col-md-6">
              <label className="form-label small fw-medium mb-1">
                Bank Account
              </label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="form-control form-control-sm"
                placeholder="Account number"
              />
            </div>
          )}

          {formData.paymentPreference === "momo" && (
            <div className="col-md-6">
              <label className="form-label small fw-medium mb-1">
                Momo Number
              </label>
              <input
                type="tel"
                value={formData.momoNumber}
                onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
                className="form-control form-control-sm"
                placeholder="+250 788..."
              />
            </div>
          )}
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
            {isSubmitting ? (initialData ? "Updating..." : "Adding...") : (initialData ? "Update Employee" : "Add Employee")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
