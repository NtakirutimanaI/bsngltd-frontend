import { useState, useEffect } from "react";
import { fetchApi } from "@/app/api/client";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";

interface Assignment {
    id: string;
    employee: {
        id: string;
        name: string;
        employeeId: string;
    };
    site: {
        id: string;
        name: string;
        location: string;
    };
    role: string;
    startDate: string;
    endDate: string;
    status: string;
}

export function AssignmentsTab() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        try {
            const res = await fetchApi<Assignment[]>('/assignments');
            setAssignments(res || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="text-center p-4">Loading assignments...</div>;

    return (
        <ScrollReveal>
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Site Assignments</h5>
                    <button className="btn btn-sm text-white" style={{ background: '#16a085', borderRadius: '8px' }}>
                        <Plus size={14} className="me-1" /> Assign Work
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="text-muted small text-uppercase">
                                <th className="ps-4">Employee</th>
                                <th>Site Assigned</th>
                                <th>Role</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map(assg => (
                                <tr key={assg.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{assg.employee?.name}</div>
                                        <div className="small text-muted">{assg.employee?.employeeId}</div>
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark">{assg.site?.name}</div>
                                        <div className="d-flex align-items-center text-muted small"><MapPin size={12} className="me-1" /> {assg.site?.location}</div>
                                    </td>
                                    <td>
                                        <span className="badge bg-purple-50 text-purple-600 text-capitalize">{assg.role}</span>
                                    </td>
                                    <td>
                                        <div className="small">Start: {assg.startDate}</div>
                                        <div className="small text-muted">End: {assg.endDate || 'Ongoing'}</div>
                                    </td>
                                    <td>
                                        <span className={`badge px-2 py-1 ${assg.status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} text-capitalize`}>
                                            {assg.status}
                                        </span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-icon text-muted p-0 me-2"><Edit2 size={14} /></button>
                                        <button className="btn btn-icon text-danger p-0"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                            {assignments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-muted">No assignments found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ScrollReveal>
    );
}
