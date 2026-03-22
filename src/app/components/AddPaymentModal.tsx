import { useState } from "react";
import { Modal } from "@/app/components/Modal";
import { useCurrency } from "@/app/context/CurrencyContext";
import { Coins, Plus, RotateCcw } from "lucide-react";
import { fetchApi } from '../api/client';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddPaymentModal({ isOpen, onClose, onSuccess }: AddPaymentModalProps) {
  const { currency, setCurrency } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    amount: "",
    type: "client_payment",
    method: "bank_transfer",
    payer: "",
    payee: "",
    project: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchApi('/payments', {
        method: 'POST',
        body: JSON.stringify({
          code: formData.code,
          amount: Number(formData.amount),
          type: formData.type,
          status: 'pending',
          method: formData.method,
          date: new Date().toISOString().split('T')[0],
          description: formData.description,
          payer: formData.payer,
          payee: formData.payee,
        }),
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create payment", error);
      alert("Failed to create payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record New Payment" size="md" draggable={true}>
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Payment Code *
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., PAY-001"
            />
          </div>

          <div className="col-md-6">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <label className="form-label small fw-medium mb-0">
                Amount ({currency}) *
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
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., 15000000"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Payment Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="form-select form-select-sm"
            >
              <option value="client_payment">Client Payment</option>
              <option value="salary">Salary</option>
              <option value="contractor">Contractor Payment</option>
              <option value="supplier">Supplier Payment</option>
              <option value="expense">General Expense</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">
              Payment Method *
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="form-select form-select-sm"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="momo">Mobile Money</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">Payer *</label>
            <input
              type="text"
              required
              value={formData.payer}
              onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., Gov. of Rwanda"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-medium mb-1">Payee *</label>
            <input
              type="text"
              required
              value={formData.payee}
              onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., BSNG Ltd"
            />
          </div>

          <div className="col-12">
            <label className="form-label small fw-medium mb-1">
              Related Project
            </label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="form-control form-control-sm"
              placeholder="e.g., PRJ-001"
            />
          </div>
        </div>

        <div>
          <label className="form-label small fw-medium mb-1">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="form-control form-control-sm"
            placeholder="Payment description..."
            style={{ resize: 'none' }}
          />
        </div>

        <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Record Payment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
