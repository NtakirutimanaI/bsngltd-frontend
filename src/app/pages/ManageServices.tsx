import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Layout,
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from '../api/client';
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
        } catch (err) {
            console.error("Failed to save service", err);
        }
    };

    const filteredServices = services.filter(s =>
        (s.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <ScrollReveal className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Services</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Configure public services and their order of appearance
                    </p>
                </div>
                <button
                    onClick={() => { setEditingService(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md"
                >
                    <Plus className="h-5 w-5" />
                    Add New Service
                </button>
            </ScrollReveal>

            {/* Filters & Actions */}
            <ScrollReveal delay={0.1} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none dark:text-white"
                        />
                    </div>
                    <button
                        onClick={() => fetchApi('/services/seed', { method: 'POST' }).then(fetchServices)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium border border-gray-300 dark:border-gray-600"
                    >
                        Reset/Seed Defaults
                    </button>
                </div>
            </ScrollReveal>

            {/* Services Table */}
            <ScrollReveal delay={0.2} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading services...</td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">No services found.</td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${service.isDark ? 'bg-orange-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                                    <Layout className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{service.title || service.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Key: {service.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 max-w-xs">{service.description}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{service.order}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(service)}
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${service.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                                                    }`}
                                            >
                                                {service.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                {service.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingService(service); setIsModalOpen(true); }}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Internal Name (Key)</label>
                            <input
                                name="name"
                                defaultValue={editingService?.name}
                                required
                                placeholder="e.g. brokerage"
                                className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Public Title</label>
                            <input
                                name="title"
                                defaultValue={editingService?.title}
                                required
                                placeholder="Brokerage Services"
                                className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
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
                            className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
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
                                className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Animation Delay (s)</label>
                            <input
                                name="delay"
                                defaultValue={editingService?.delay || '0.1s'}
                                required
                                className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="isActive"
                                defaultChecked={editingService ? editingService.isActive : true}
                                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                            />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 transition-colors">Active Service</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="isDark"
                                defaultChecked={editingService?.isDark}
                                className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                            />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 transition-colors">Dark Theme</span>
                        </label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
                        >
                            {editingService ? 'Update Service' : 'Create Service'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
