import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Save,
    Upload,
    Image as ImageIcon,
    FileText,
    Globe,
    Home,
    Building2,
    Phone,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from '../api/client';
import { Modal } from '@/app/components/Modal';
import { PaginationSelector } from '@/app/components/ui/pagination-selector';

interface ContentSection {
    id: string;
    section: string;
    title: string;
    subtitle?: string;
    description: string;
    content?: string;
    image?: string;
    images?: string[];
    isActive: boolean;
    order: number;
    metadata?: Record<string, any>;
}

interface ContentCategory {
    key: string;
    label: string;
    icon: React.ElementType;
    description: string;
}

const CONTENT_CATEGORIES: ContentCategory[] = [
    {
        key: 'hero',
        label: 'Hero Section',
        icon: Home,
        description: 'Main hero slider and welcome message'
    },
    {
        key: 'about',
        label: 'About Us',
        icon: FileText,
        description: 'Company information and story'
    },
    {
        key: 'services',
        label: 'Services',
        icon: Building2,
        description: 'Service descriptions and details'
    },
    {
        key: 'contact',
        label: 'Contact Information',
        icon: Phone,
        description: 'Contact details and form'
    },
    {
        key: 'testimonials',
        label: 'Testimonials',
        icon: Globe,
        description: 'Customer testimonials and reviews'
    },
    {
        key: 'gallery',
        label: 'Gallery',
        icon: ImageIcon,
        description: 'Project gallery and images'
    },
    {
        key: 'features',
        label: 'Features',
        icon: CheckCircle,
        description: 'Key features and highlights'
    }
];

export function ManageContent() {
    const [content, setContent] = useState<ContentSection[]>([]);
    const [filteredContent, setFilteredContent] = useState<ContentSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<ContentSection | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [previewMode, setPreviewMode] = useState(false);

    const fetchContent = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize.toString(),
                search: searchTerm,
                category: selectedCategory !== "all" ? selectedCategory : ""
            }).toString();

            const response = await fetchApi<{ data: ContentSection[]; total: number; lastPage: number }>(`/content?${query}`);
            setContent(response.data || []);
            setFilteredContent(response.data || []);
            setTotalPages(response.lastPage || 1);
            setTotalItems(response.total || 0);
        } catch (err) {
            console.error("Failed to fetch content", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [currentPage, pageSize, searchTerm, selectedCategory]);

    useEffect(() => {
        const filtered = content.filter(item => {
            const matchesSearch = searchTerm === "" ||
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === "all" || item.section === selectedCategory;

            return matchesSearch && matchesCategory;
        });
        setFilteredContent(filtered);
    }, [content, searchTerm, selectedCategory]);

    const handleSave = async (formData: Partial<ContentSection>) => {
        try {
            if (editingContent) {
                await fetchApi(`/content/${editingContent.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(formData)
                });
            } else {
                await fetchApi('/content', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }

            setIsModalOpen(false);
            setEditingContent(null);
            fetchContent();
        } catch (err) {
            console.error("Failed to save content", err);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

        try {
            await fetchApi(`/content/${id}`, { method: 'DELETE' });
            fetchContent();
        } catch (err) {
            console.error("Failed to delete content", err);
        }
    };

    const handleImageUpload = async (file: File, contentId: string) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('contentId', contentId);

        try {
            const response = await fetchApi('/content/upload-image', {
                method: 'POST',
                body: formData
            });
            return response;
        } catch (err) {
            console.error("Failed to upload image", err);
            throw err;
        }
    };

    const toggleContentStatus = async (id: string, isActive: boolean) => {
        try {
            await fetchApi(`/content/${id}/toggle-status`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: !isActive })
            });
            fetchContent();
        } catch (err) {
            console.error("Failed to toggle content status", err);
        }
    };

    return (
        <div className="container-fluid bg-transparent min-vh-100 px-2 px-md-4 pt-4 pb-4">
            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                <div>
                    <h1 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <FileText size={20} className="text-primary" />
                        Content Management
                    </h1>
                    <p className="text-muted small mb-0">
                        Manage website content, images, and text across all sections
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`btn btn-sm d-flex align-items-center gap-2 px-3 fw-bold ${previewMode ? 'btn-primary' : 'btn-outline-primary'}`}
                        style={{ height: '38px', borderRadius: '8px' }}
                    >
                        {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                        {previewMode ? 'Editor View' : 'Live Preview'}
                    </button>
                    <button
                        onClick={() => { setEditingContent(null); setIsModalOpen(true); }}
                        className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 fw-bold shadow-sm"
                        style={{ height: '38px', borderRadius: '8px' }}
                    >
                        <Plus size={16} /> Add New Section
                    </button>
                </div>
            </ScrollReveal>

            {/* Category Filters */}
            <div className="bg-light rounded p-4 mb-4 shadow-sm">
                <div className="p-0">
                    <div className="nav nav-pills gap-2 flex-nowrap overflow-auto pb-1">
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={`nav-link flex-shrink-0 d-flex align-items-center gap-2 px-3 py-2 fw-semibold transition-all ${selectedCategory === "all" ? 'active' : 'text-muted'}`}
                            style={{
                                borderRadius: '10px',
                                fontSize: '13px',
                                background: selectedCategory === "all" ? '#009CFF' : 'transparent'
                            }}
                        >
                            <FileText size={16} /> All Sections
                        </button>
                        {CONTENT_CATEGORIES.map(category => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.key}
                                    onClick={() => setSelectedCategory(category.key)}
                                    className={`nav-link flex-shrink-0 d-flex align-items-center gap-2 px-3 py-2 fw-semibold transition-all ${selectedCategory === category.key ? 'active' : 'text-muted'}`}
                                    style={{
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        background: selectedCategory === category.key ? '#009CFF' : 'transparent'
                                    }}
                                >
                                    <Icon size={16} />
                                    <span>{category.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-light rounded p-4 mb-4 shadow-sm">
                <div className="p-0">
                    <div className="position-relative d-flex align-items-center gap-3">
                        <div className="position-relative flex-grow-1">
                            <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={16} />
                            <input
                                type="text"
                                placeholder="Find sections by title, description or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-control form-control-lg ps-5 bg-light border-0 focus:bg-white transition-all shadow-none"
                                style={{ fontSize: '14px', borderRadius: '10px', height: '45px' }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="position-absolute end-0 top-50 translate-middle-y me-3 btn btn-link p-0 text-muted hover:text-dark"
                                >
                                    <XCircle size={18} />
                                </button>
                            )}
                        </div>
                        <div className="text-muted small fw-bold text-uppercase px-3 py-2 bg-light rounded-pill border" style={{ fontSize: '10px', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                            {totalItems} entries total
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="bg-light rounded p-4 shadow-sm mb-4">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-3 small">Retrieving content data...</p>
                    </div>
                ) : filteredContent.length === 0 ? (
                    <div className="text-center py-12 bg-white">
                        <div className="w-16 h-16 bg-light rounded-circle d-flex align-items-center justify-center mx-auto mb-4 border">
                            <FileText size={32} className="text-muted" />
                        </div>
                        <h6 className="fw-bold text-dark">No Results Found</h6>
                        <p className="text-muted small px-4">We couldn't find any content sections matching your current filters.</p>
                        <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="btn btn-primary btn-sm px-4 fw-bold mt-2">Clear Filters</button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th className="ps-4 py-3 border-0 text-dark small text-uppercase fw-bold" style={{ letterSpacing: '0.02em' }}>Section</th>
                                    <th className="py-3 border-0 text-dark small text-uppercase fw-bold" style={{ letterSpacing: '0.02em' }}>Title & Subtitle</th>
                                    <th className="py-3 border-0 text-dark small text-uppercase fw-bold" style={{ letterSpacing: '0.02em' }}>Description</th>
                                    <th className="py-3 border-0 text-dark small text-uppercase fw-bold" style={{ letterSpacing: '0.02em' }}>Visibility</th>
                                    <th className="pe-4 py-3 border-0 text-dark small text-uppercase fw-bold text-end" style={{ letterSpacing: '0.02em' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="border-0">
                                {filteredContent.map((item) => (
                                    <tr key={item.id} className="border-bottom border-light/50">
                                        <td className="ps-4 py-3">
                                            <span className="badge bg-primary-subtle text-primary border border-primary/10 px-2 py-1.5 rounded-pill text-uppercase" style={{ fontSize: '9px', fontWeight: 800 }}>
                                                {item.section}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <div className="fw-bold text-dark mb-0.5" style={{ fontSize: '13px' }}>{item.title}</div>
                                            {item.subtitle && <div className="text-muted" style={{ fontSize: '11px' }}>{item.subtitle}</div>}
                                        </td>
                                        <td className="py-3">
                                            <div className="text-muted text-truncate" style={{ fontSize: '12px', maxWidth: '250px' }}>
                                                {item.description}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="form-check form-switch cursor-pointer">
                                                <input
                                                    className="form-check-input cursor-pointer"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={item.isActive}
                                                    onChange={() => toggleContentStatus(item.id, item.isActive)}
                                                />
                                                <span className={`small fw-bold ms-2 ${item.isActive ? 'text-success' : 'text-muted'}`}>
                                                    {item.isActive ? 'VISIBLE' : 'HIDDEN'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 pe-4 text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button
                                                    onClick={() => setEditingContent(item)}
                                                    className="btn btn-light btn-sm border shadow-sm p-2 text-primary hover:bg-primary hover:text-white transition-all"
                                                    style={{ borderRadius: '8px' }}
                                                    title="Edit Entry"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.title)}
                                                    className="btn btn-light btn-sm border shadow-sm p-2 text-danger hover:bg-danger hover:text-white transition-all"
                                                    style={{ borderRadius: '8px' }}
                                                    title="Delete Entry"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-2 px-md-4 py-3">
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

            {/* Add/Edit Content Modal */}
            <ContentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingContent(null);
                }}
                content={editingContent}
                onSave={handleSave}
                onImageUpload={handleImageUpload}
                categories={CONTENT_CATEGORIES}
            />
        </div>
    );
}

// Content Modal Component
interface ContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: ContentSection | null;
    onSave: (data: Partial<ContentSection>) => void;
    onImageUpload: (file: File, contentId: string) => Promise<any>;
    categories: ContentCategory[];
}

function ContentModal({ isOpen, onClose, content, onSave, onImageUpload, categories }: ContentModalProps) {
    const [formData, setFormData] = useState<Partial<ContentSection>>({
        section: 'hero',
        title: '',
        subtitle: '',
        description: '',
        content: '',
        image: '',
        images: [],
        isActive: true,
        order: 0,
        metadata: {}
    });
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string>('');

    useEffect(() => {
        if (content) {
            setFormData(content);
            if (content.image) {
                setPreviewImage(content.image);
            }
        } else {
            setFormData({
                section: 'hero',
                title: '',
                subtitle: '',
                description: '',
                content: '',
                image: '',
                images: [],
                isActive: true,
                order: 0,
                metadata: {}
            });
            setPreviewImage('');
        }
    }, [content, isOpen]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            try {
                const response = await onImageUpload(file, content?.id || 'new');
                setFormData(prev => ({ ...prev, image: response.url }));
                setPreviewImage(response.url);
            } catch (err) {
                console.error('Image upload failed:', err);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={content ? 'Edit Content' : 'Add New Content'} size="lg" draggable={true}>
            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    {/* Section Selection */}
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold">Section</label>
                        <select
                            value={formData.section}
                            onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                            className="form-select form-select-sm"
                            style={{ fontSize: '12px', borderRadius: '6px' }}
                        >
                            {categories.map(cat => (
                                <option key={cat.key} value={cat.key}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Order */}
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold">Display Order</label>
                        <input
                            type="number"
                            value={formData.order || 0}
                            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                            className="form-control form-control-sm"
                            style={{ fontSize: '12px', borderRadius: '6px' }}
                            min="0"
                        />
                    </div>

                    {/* Title */}
                    <div className="col-12">
                        <label className="form-label small fw-semibold">Title</label>
                        <input
                            type="text"
                            value={formData.title || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="form-control form-control-sm"
                            style={{ fontSize: '12px', borderRadius: '6px' }}
                            required
                        />
                    </div>

                    {/* Subtitle */}
                    <div className="col-12">
                        <label className="form-label small fw-semibold">Subtitle (Optional)</label>
                        <input
                            type="text"
                            value={formData.subtitle || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                            className="form-control form-control-sm"
                            style={{ fontSize: '12px', borderRadius: '6px' }}
                        />
                    </div>

                    {/* Description */}
                    <div className="col-12">
                        <label className="form-label small fw-semibold">Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="form-control form-control-sm"
                            style={{ fontSize: '12px', borderRadius: '6px', minHeight: '100px' }}
                            rows={4}
                            required
                        />
                    </div>

                    {/* Content */}
                    <div className="col-12">
                        <label className="form-label small fw-semibold">Full Content (Optional)</label>
                        <textarea
                            value={formData.content || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            className="form-control form-control-sm"
                            style={{ fontSize: '12px', borderRadius: '6px', minHeight: '150px' }}
                            rows={6}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="col-12">
                        <label className="form-label small fw-semibold">Image</label>
                        <div className="d-flex gap-3 align-items-start">
                            <div className="flex-shrink-0">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="form-control form-control-sm"
                                    style={{ fontSize: '12px', borderRadius: '6px' }}
                                    id="content-image-upload"
                                />
                                <label htmlFor="content-image-upload" className="btn btn-sm btn-outline-primary mt-2">
                                    <Upload size={12} /> Choose Image
                                </label>
                            </div>
                            {previewImage && (
                                <div className="flex-grow-1">
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        style={{
                                            maxWidth: '200px',
                                            maxHeight: '150px',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        {uploading && (
                            <div className="text-muted small mt-2">
                                <div className="spinner-border spinner-border-sm me-2" />
                                Uploading image...
                            </div>
                        )}
                    </div>

                    {/* Active Status */}
                    <div className="col-12">
                        <div className="form-check">
                            <input
                                type="checkbox"
                                id="content-active"
                                checked={formData.isActive || false}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="form-check-input"
                            />
                            <label htmlFor="content-active" className="form-check-label small">
                                Active (show on website)
                            </label>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-light px-4 fw-bold text-dark border shadow-sm"
                        style={{ height: '38px', borderRadius: '8px', fontSize: '13px' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                        style={{ height: '38px', borderRadius: '8px', fontSize: '13px' }}
                    >
                        <Save size={16} />
                        {content ? 'Update Content' : 'Publish Section'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
