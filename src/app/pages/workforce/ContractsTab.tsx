import { useState, useEffect } from "react";
import { fetchApi } from "@/app/api/client";
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";

interface Contract {
    id: string;
    employee: {
        id: string;
        name: string;
        employeeId: string;
    };
    type: string;
    startDate: string;
    endDate: string;
    salary: number;
    currency: string;
    status: string;
}

export function ContractsTab() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = async () => {
        try {
            const res = await fetchApi<Contract[]>('/contracts');
            setContracts(res || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="text-center p-4">Loading contracts...</div>;

    return (
        <ScrollReveal>
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Employee Contracts</h5>
                    <button className="btn btn-sm text-white" style={{ background: '#16a085', borderRadius: '8px' }}>
                        <Plus size={14} className="me-1" /> Add Contract
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="text-muted small text-uppercase">
                                <th className="ps-4">Employee</th>
                                <th>Contract Type</th>
                                <th>Duration</th>
                                <th>Salary</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map(contract => (
                                <tr key={contract.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{contract.employee?.name}</div>
                                        <div className="small text-muted">{contract.employee?.employeeId}</div>
                                    </td>
                                    <td>
                                        <span className="badge bg-blue-50 text-blue-600 text-capitalize">{contract.type}</span>
                                    </td>
                                    <td>
                                        <div className="small">Start: {contract.startDate}</div>
                                        <div className="small text-muted">End: {contract.endDate || 'Indefinite'}</div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark">{contract.salary} {contract.currency}</div>
                                    </td>
                                    <td>
                                        <span className={`badge px-2 py-1 ${contract.status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} text-capitalize`}>
                                            {contract.status === 'active' ? <CheckCircle size={12} className="me-1" /> : <XCircle size={12} className="me-1" />}
                                            {contract.status}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-icon text-muted p-0 me-2"><Edit2 size={14} /></button>
                                        <button className="btn btn-icon text-danger p-0"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                            {contracts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-muted">No contracts found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ScrollReveal>
    );
}
