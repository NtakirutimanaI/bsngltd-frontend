import { useState, useEffect, useRef } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Layout,
    RefreshCcw,
    Info,
    Camera
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi, getImageUrl } from '../api/client';
import { Modal } from '@/app/components/Modal';
import { PaginationSelector } from "@/app/components/ui/pagination-selector";

interface Service {
    id: string;
    name: string;
    title: string;
    description: string;
    image: string;
    icon: string;
    isActive: boolean;
    order: number;
    delay: string;
    isDark: boolean;
}

export function ManageServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const fetchServices = async () => {
        setIsLoading(true);
        try {
            const data = await fetchApi<Service[]>('/services');
            setServices(data || []);
        } catch (err) {
            console.error("Failed to fetch services", err);
        } finally {
            setIsLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleUploadImage = async (file: File, serviceId: string) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetchApi<{ url: string }>(`/services/${serviceId}/upload-image`, {
                method: 'POST',
                body: formData,
            });
            if (res?.url) {
                showMessage('success', 'Image changed successfully!');
                fetchServices();
                // Update the editing service in state to show new image in modal
                if (editingService && editingService.id === serviceId) {
                    setEditingService({ ...editingService, image: res.url });
                }
            }
        } catch (err) {
            console.error("Upload failed", err);
            showMessage('error', 'Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleToggleActive = async (service: Service) => {
        try {
            await fetchApi(`/services/${service.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: !service.isActive }),
            });
            fetchServices();
        } catch (err) {
            console.error("Failed to toggle service status", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
            await fetchApi(`/services/${id}`, { method: 'DELETE' });
            fetchServices();
        } catch (err) {
            console.error("Failed to delete service", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Convert boolean values
        const payload = {
            ...data,
            isActive: data.isActive === 'on',
            isDark: data.isDark === 'on',
            order: Number(data.order),
        };

        try {
            if (editingService) {
                await fetchApi(`/services/${editingService.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                });
            } else {
                await fetchApi('/services', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            }
            setIsModalOpen(false);
            setEditingService(null);
            fetchServices();
            showMessage('success', 'Texts changed successfully!');
        } catch (err) {
            console.error("Failed to save service", err);
            showMessage('error', 'Failed to save service changes.');
        }
    };

    const filteredServices = services.filter(s =>
        (s.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredServices.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const paginatedServices = filteredServices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Reset to page 1 on search
    const handleSearch = (val: string) => {
        setSearchTerm(val);
        setCurrentPage(1);
    };

    return (
        <div className="container-fluid bg-light min-vh-100 px-2 pt-2 pb-2">
            {/* Success/Error Message */}
            {message && (
                <ScrollReveal className={`fixed top-4 right-4 z-50 p-0 rounded-xl shadow-lg border ${message.type === 'success' ? 'bg-white text-dark border-primary' : 'bg-danger text-white border-danger'
                    }`}>
                    <div className="p-3 flex items-center gap-2" style={{ minWidth: '260px' }}>
                        {message.type === 'success' ? (
                            <div className="bg-primary text-white p-2 rounded-lg">
                                <RefreshCcw className={uploading ? 'animate-spin' : ''} size={18} />
                            </div>
                        ) : (
                            <div className="bg-white text-danger p-2 rounded-lg">
                                <Info size={18} />
                            </div>
                        )}
                        <div>
                            <div className="fw-bold small uppercase tracking-wider">{message.type === 'success' ? 'Success' : 'Error'}</div>
                            <div className="small opacity-80">{message.text}</div>
                        </div>
                    </div>
                </ScrollReveal>
            )}
            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2">
                <div>
                    <h1 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <Layout size={18} className="text-primary" />
                        Manage Services
                    </h1>
                    <p className="text-muted small mb-0">
                        Configure public services and their order of appearance
                    </p>
                </div>
                <button
                    onClick={() => { setEditingService(null); setIsModalOpen(true); }}
                    className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 fw-bold shadow-sm"
                    style={{ borderRadius: '8px', height: '32px', fontSize: '11px' }}
                >
                    <Plus size={14} />
                    Add New Service
                </button>
            </ScrollReveal>

            {/* Filters & Actions */}
            <ScrollReveal delay={0.1} className="mb-2">
                <div className="d-flex flex-column flex-md-row gap-2 align-items-center">
                    <div className="position-relative" style={{ maxWidth: '300px', width: '100%' }}>
                        <Search className="position-absolute top-50 translate-middle-y text-muted opacity-50" size={14} style={{ left: '12px' }} />
                        <input
                            type="text"
                            placeholder="Search services by title or keyword..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="form-control form-control-sm ps-5 bg-white border-0 shadow-sm rounded-xl py-2 search-input"
                        />
                    </div>
                    <button
                        onClick={() => fetchApi('/services/seed', { method: 'POST' }).then(fetchServices)}
                        className="btn btn-light btn-sm border d-flex align-items-center gap-1.5 px-3 fw-bold text-muted whitespace-nowrap ms-auto"
                        style={{ height: '34px', borderRadius: '6px', fontSize: '11px' }}
                    >
                        <RefreshCcw size={12} />
                        Reset Defaults
                    </button>
                </div>
            </ScrollReveal>

            {/* Services Table */}
            <ScrollReveal delay={0.2} className="card shadow-sm border-0 rounded-4 mb-2 bg-white overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-3 py-2 border-0 text-dark small text-uppercase fw-bold">Service</th>
                                <th className="py-2 border-0 text-dark small text-uppercase fw-bold">Description</th>
                                <th className="py-2 border-0 text-dark small text-uppercase fw-bold">Order</th>
                                <th className="py-2 border-0 text-dark small text-uppercase fw-bold">Status</th>
                                <th className="pe-3 py-2 border-0 text-dark small text-uppercase fw-bold text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="border-0">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-muted">Loading services...</td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-muted">No services found.</td>
                                </tr>
                            ) : (
                                paginatedServices.map((service) => (
                                    <tr key={service.id} className="border-bottom border-light/50">
                                        <td className="ps-3 py-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className={`p-1.5 rounded ${service.isDark ? 'bg-primary text-white shadow-sm' : 'bg-light text-primary border'}`}>
                                                    <Layout size={14} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark text-sm mb-0">{service.title || service.name}</div>
                                                    <div className="text-muted" style={{ fontSize: '11px' }}>Key: {service.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2">
                                            <div className="text-muted text-truncate" style={{ fontSize: '11px', maxWidth: '220px' }}>{service.description}</div>
                                        </td>
                                        <td className="py-2">
                                            <span className="badge bg-light text-dark border px-2 py-1 rounded" style={{ fontSize: '11px' }}>{service.order}</span>
                                        </td>
                                        <td className="py-2">
                                            <div className="form-check form-switch cursor-pointer mb-0">
                                                <input
                                                    className="form-check-input cursor-pointer shadow-none"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={service.isActive}
                                                    onChange={() => handleToggleActive(service)}
                                                />
                                                <span className={`fw-bold ms-1 ${service.isActive ? 'text-success' : 'text-muted'}`} style={{ fontSize: '10px' }}>
                                                    {service.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="pe-3 py-2 text-end">
                                            <div className="d-flex justify-content-end gap-1.5">
                                                <button
                                                    onClick={() => { setEditingService(service); setIsModalOpen(true); }}
                                                    className="btn btn-light btn-sm border shadow-sm p-1.5 text-primary hover:bg-primary hover:text-white transition-all"
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <Edit size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="btn btn-light btn-sm border shadow-sm p-1.5 text-danger hover:bg-danger hover:text-white transition-all"
                                                    style={{ borderRadius: '6px' }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <div className="px-3 py-2 border-t border-gray-100">
                            <PaginationSelector
                                currentPage={currentPage}
                                totalPages={totalPages}
                                pageSize={pageSize}
                                totalItems={totalItems}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    )}
                </div>
            </ScrollReveal>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingService(null); }} title={editingService ? 'Edit Service' : 'Add New Service'} size="md" draggable={true}>
                <div className="space-y-3 p-3">
                    {/* Image Section (Only for existing services) */}
                    {editingService && (
                        <div className="bg-light p-3 rounded-xl border border-dashed border-gray-300">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Service Image</label>
                            <div className="d-flex align-items-center gap-3">
                                <div className="w-16 h-16 rounded overflow-hidden border-2 border-white shadow-sm bg-white flex-shrink-0">
                                    <img
                                        src={getImageUrl(editingService.image) || '/img/service-1.jpg'}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/img/service-1.jpg'; }}
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="text-sm fw-bold text-dark mb-0.5">Visual Content</h4>
                                    <p className="text-[10px] text-muted mb-2 leading-tight">Recommended: 800x600px (JPG/PNG)</p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-2 py-1 fw-bold"
                                        style={{ height: '28px', fontSize: '10px' }}
                                    >
                                        {uploading ? (
                                            <><RefreshCcw className="animate-spin" size={12} /> Uploading...</>
                                        ) : (
                                            <><Camera size={12} /> Replace Image</>
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleUploadImage(e.target.files[0], editingService.id);
                                            e.target.value = '';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Internal Name (Key)</label>
                                <input
                                    name="name"
                                    defaultValue={editingService?.name}
                                    required
                                    placeholder="e.g. brokerage"
                                    className="w-full px-2 py-1.5 text-[12px] bg-transparent border border-gray-200 dark:border-gray-600 rounded outline-none focus:ring-1 focus:ring-blue-500 dark:text-white h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Public Title</label>
                                <input
                                    name="title"
                                    defaultValue={editingService?.title}
                                    required
                                    placeholder="Brokerage Services"
                                    className="w-full px-2 py-1.5 text-[12px] bg-transparent border border-gray-200 dark:border-gray-600 rounded outline-none focus:ring-1 focus:ring-blue-500 dark:text-white h-8"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Description</label>
                            <textarea
                                name="description"
                                defaultValue={editingService?.description}
                                required
                                rows={2}
                                className="w-full px-2 py-1.5 text-[12px] bg-transparent border border-gray-200 dark:border-gray-600 rounded outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Display Order</label>
                                <input
                                    type="number"
                                    name="order"
                                    defaultValue={editingService?.order || 0}
                                    required
                                    className="w-full px-2 py-1.5 text-[12px] bg-transparent border border-gray-200 dark:border-gray-600 rounded outline-none focus:ring-1 focus:ring-blue-500 dark:text-white h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Animation Delay (s)</label>
                                <input
                                    name="delay"
                                    defaultValue={editingService?.delay || '0.1s'}
                                    required
                                    className="w-full px-2 py-1.5 text-[12px] bg-transparent border border-gray-200 dark:border-gray-600 rounded outline-none focus:ring-1 focus:ring-blue-500 dark:text-white h-8"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    defaultChecked={editingService ? editingService.isActive : true}
                                    className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">Active Service</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="isDark"
                                    defaultChecked={editingService?.isDark}
                                    className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">Dark Theme</span>
                            </label>
                        </div>

                        <div className="d-flex gap-2 pt-3 border-top mt-2">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="btn btn-light btn-sm flex-grow-1 fw-bold text-muted border shadow-sm"
                                style={{ borderRadius: '6px', height: '34px', fontSize: '12px' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm flex-grow-1 fw-bold shadow-sm d-flex align-items-center justify-center gap-1.5"
                                style={{ borderRadius: '6px', height: '34px', fontSize: '12px' }}
                            >
                                {editingService ? <RefreshCcw size={14} /> : <Plus size={14} />}
                                {editingService ? "Update Texts" : "Create Service"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <style>{`
                .search-input { padding-left: 35px !important; }
                .search-input::placeholder { text-indent: 5px; }
            `}</style>
        </div>
    );
}
