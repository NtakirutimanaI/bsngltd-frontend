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

    return (
        <div className="container-fluid bg-light min-vh-100 px-2 px-md-4 pt-4 pb-4">
            {/* Success/Error Message */}
            {message && (
                <ScrollReveal className={`fixed top-4 right-4 z-50 p-0 rounded-xl shadow-lg border ${message.type === 'success' ? 'bg-white text-dark border-primary' : 'bg-danger text-white border-danger'
                    }`}>
                    <div className="p-4 flex items-center gap-3" style={{ minWidth: '300px' }}>
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
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                <div>
                    <h1 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <Layout size={20} className="text-primary" />
                        Manage Services
                    </h1>
                    <p className="text-muted small mb-0">
                        Configure public services and their order of appearance
                    </p>
                </div>
                <button
                    onClick={() => { setEditingService(null); setIsModalOpen(true); }}
                    className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2.5 fw-bold shadow-sm"
                    style={{ borderRadius: '10px' }}
                >
                    <Plus size={18} />
                    Add New Service
                </button>
            </ScrollReveal>

            {/* Filters & Actions */}
            <ScrollReveal delay={0.1} className="card shadow-sm border-0 rounded-4 mb-4 bg-white overflow-hidden">
                <div className="card-body p-3">
                    <div className="d-flex flex-column flex-md-row gap-3 align-items-center">
                        <div className="position-relative flex-grow-1 w-100">
                            <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Search services by title or keyword..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-control ps-5 bg-light border-0 focus:bg-white transition-all shadow-none"
                                style={{ height: '40px', borderRadius: '8px', fontSize: '14px' }}
                            />
                        </div>
                        <button
                            onClick={() => fetchApi('/services/seed', { method: 'POST' }).then(fetchServices)}
                            className="btn btn-light border d-flex align-items-center gap-2 px-4 py-2 fw-bold text-muted whitespace-nowrap"
                            style={{ height: '40px', borderRadius: '8px', fontSize: '13px' }}
                        >
                            <RefreshCcw size={16} />
                            Reset Defaults
                        </button>
                    </div>
                </div>
            </ScrollReveal>

            {/* Services Table */}
            <ScrollReveal delay={0.2} className="card shadow-sm border-0 rounded-4 mb-4 bg-white overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 border-0 text-dark small text-uppercase fw-bold">Service</th>
                                <th className="py-3 border-0 text-dark small text-uppercase fw-bold">Description</th>
                                <th className="py-3 border-0 text-dark small text-uppercase fw-bold">Order</th>
                                <th className="py-3 border-0 text-dark small text-uppercase fw-bold">Status</th>
                                <th className="pe-4 py-3 border-0 text-dark small text-uppercase fw-bold text-end">Actions</th>
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
                                filteredServices.map((service) => (
                                    <tr key={service.id} className="border-bottom border-light/50">
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className={`p-2 rounded-lg ${service.isDark ? 'bg-primary text-white shadow-sm' : 'bg-light text-primary border'}`}>
                                                    <Layout size={18} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark mb-0.5">{service.title || service.name}</div>
                                                    <div className="text-muted small">Key: {service.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="text-muted text-truncate" style={{ fontSize: '12px', maxWidth: '250px' }}>{service.description}</div>
                                        </td>
                                        <td className="py-3">
                                            <span className="badge bg-light text-dark border px-2 py-1.5 rounded">{service.order}</span>
                                        </td>
                                        <td className="py-3">
                                            <div className="form-check form-switch cursor-pointer">
                                                <input
                                                    className="form-check-input cursor-pointer shadow-none"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={service.isActive}
                                                    onChange={() => handleToggleActive(service)}
                                                />
                                                <span className={`small fw-bold ms-2 ${service.isActive ? 'text-success' : 'text-muted'}`}>
                                                    {service.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="pe-4 py-3 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button
                                                    onClick={() => { setEditingService(service); setIsModalOpen(true); }}
                                                    className="btn btn-light btn-sm border shadow-sm p-2 text-primary hover:bg-primary hover:text-white transition-all"
                                                    style={{ borderRadius: '8px' }}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="btn btn-light btn-sm border shadow-sm p-2 text-danger hover:bg-danger hover:text-white transition-all"
                                                    style={{ borderRadius: '8px' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </ScrollReveal>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingService(null); }} title={editingService ? 'Edit Service' : 'Add New Service'} size="md" draggable={true}>
                <div className="space-y-6">
                    {/* Image Section (Only for existing services) */}
                    {editingService && (
                        <div className="bg-light p-4 rounded-xl border border-dashed border-gray-300">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">Service Image</label>
                            <div className="d-flex align-items-center gap-4">
                                <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-white shadow-sm bg-white">
                                    <img
                                        src={getImageUrl(editingService.image) || '/img/service-1.jpg'}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/img/service-1.jpg'; }}
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="text-sm fw-bold text-dark mb-1">Visual Content</h4>
                                    <p className="text-[11px] text-muted mb-3 leading-tight">Recommended size: 800x600px (JPG/PNG)</p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 fw-bold"
                                        style={{ height: '32px', fontSize: '11px' }}
                                    >
                                        {uploading ? (
                                            <><RefreshCcw className="animate-spin" size={14} /> Uploading...</>
                                        ) : (
                                            <><Camera size={14} /> Replace Image</>
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Internal Name (Key)</label>
                                <input
                                    name="name"
                                    defaultValue={editingService?.name}
                                    required
                                    placeholder="e.g. brokerage"
                                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Public Title</label>
                                <input
                                    name="title"
                                    defaultValue={editingService?.title}
                                    required
                                    placeholder="Brokerage Services"
                                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Description</label>
                            <textarea
                                name="description"
                                defaultValue={editingService?.description}
                                required
                                rows={3}
                                className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Display Order</label>
                                <input
                                    type="number"
                                    name="order"
                                    defaultValue={editingService?.order || 0}
                                    required
                                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Animation Delay (s)</label>
                                <input
                                    name="delay"
                                    defaultValue={editingService?.delay || '0.1s'}
                                    required
                                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    defaultChecked={editingService ? editingService.isActive : true}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">Active Service</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="isDark"
                                    defaultChecked={editingService?.isDark}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">Dark Theme</span>
                            </label>
                        </div>

                        <div className="d-flex gap-3 pt-4 border-top mt-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="btn btn-light flex-grow-1 fw-bold text-muted border shadow-sm"
                                style={{ borderRadius: '10px', height: '42px' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary flex-grow-1 fw-bold shadow-sm d-flex align-items-center justify-center gap-2"
                                style={{ borderRadius: '10px', height: '42px' }}
                            >
                                {editingService ? <RefreshCcw size={18} /> : <Plus size={18} />}
                                {editingService ? "Update Texts" : "Create Service"}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
