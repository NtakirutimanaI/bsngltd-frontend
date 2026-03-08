import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Save,
    Upload,
    Image as ImageIcon,
    Type,
    FileText,
    Globe,
    Home,
    Building2,
    Phone,
    Mail,
    MapPin,
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
        <div className="container-fluid px-2 px-md-4 pt-1 pb-2">
            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2 px-2 px-md-4 pt-1">
                <div>
                    <h1 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <FileText size={16} style={{ color: '#16a085' }} />
                        Content Management
                    </h1>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                        Manage website content, images, and text across all sections
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="btn px-3 py-1 d-flex align-items-center gap-1"
                        style={{
                            background: previewMode ? '#16a085' : 'transparent',
                            border: '2px solid #16a085',
                            color: previewMode ? '#fff' : '#16a085',
                            fontWeight: 600,
                            fontSize: '12px',
                            height: '30px'
                        }}
                    >
                        {previewMode ? <EyeOff size={13} /> : <Eye size={13} />}
                        {previewMode ? 'Edit Mode' : 'Preview Mode'}
                    </button>
                    <button
                        onClick={() => { setEditingContent(null); setIsModalOpen(true); }}
                        className="btn px-3 py-1 text-white border-0 shadow d-flex align-items-center gap-1"
                        style={{
                            background: '#16a085',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '12px',
                            height: '30px'
                        }}
                    >
                        <Plus size={13} /> Add Content
                    </button>
                </div>
            </ScrollReveal>

            {/* Category Filters */}
            <div className="card border-0 shadow-sm mb-2 mx-2 mx-md-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-header bg-white border-0 p-0">
                    <div className="nav nav-pills p-1 gap-2 flex-nowrap overflow-auto">
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={`nav-link flex-shrink-0 d-flex align-items-center gap-1 py-2 transition-all ${selectedCategory === "all" ? 'text-white shadow' : 'text-muted hover:bg-light'}`}
                            style={{
                                borderRadius: '8px',
                                border: 'none',
                                background: selectedCategory === "all" ? '#16a085' : 'transparent',
                                color: selectedCategory === "all" ? '#fff' : '#6c757d',
                                fontWeight: 600,
                                fontSize: '12px',
                                padding: '6px 12px',
                                minWidth: 'fit-content'
                            }}
                        >
                            <FileText size={14} /> All Content
                        </button>
                        {CONTENT_CATEGORIES.map(category => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={category.key}
                                    onClick={() => setSelectedCategory(category.key)}
                                    className={`nav-link flex-shrink-0 d-flex align-items-center gap-1 py-2 transition-all ${selectedCategory === category.key ? 'text-white shadow' : 'text-muted hover:bg-light'}`}
                                    style={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: selectedCategory === category.key ? '#16a085' : 'transparent',
                                        color: selectedCategory === category.key ? '#fff' : '#6c757d',
                                        fontWeight: 600,
                                        fontSize: '12px',
                                        padding: '6px 12px',
                                        minWidth: 'fit-content'
                                    }}
                                >
                                    <Icon size={14} />
                                    <span className="d-none d-md-inline">{category.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card border-0 shadow-sm mb-2 mx-2 mx-md-4" style={{ borderRadius: '12px' }}>
                <div className="card-body py-2">
                    <div className="position-relative d-flex align-items-center gap-2">
                        <Search className="position-absolute end-0 translate-middle-y me-3 text-muted" size={14} />
                        <input
                            type="text"
                            placeholder="Search content by title, section, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control form-control-sm ps-5 bg-light border-0"
                            style={{ fontSize: '12px', borderRadius: '8px' }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="btn btn-light btn-sm p-1"
                                style={{ borderRadius: '6px' }}
                            >
                                <XCircle size={12} />
                            </button>
                        )}
                        <div className="text-muted small" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                            {totalItems} item{totalItems !== 1 ? 's' : ''} found
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="card border-0 shadow-sm mx-2 mx-md-4" style={{ borderRadius: '12px' }}>
                {isLoading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted mt-2" style={{ fontSize: '12px' }}>Loading content...</p>
                    </div>
                ) : filteredContent.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <FileText size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                        <p style={{ fontSize: '14px', fontWeight: 500 }}>No content found</p>
                        <p style={{ fontSize: '12px' }}>Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '12px' }}>
                            <thead className="bg-light">
                                <tr>
                                    {['Section', 'Title', 'Description', 'Status', 'Actions'].map(h => (
                                        <th key={h} className={
                                            h === 'Actions' ? 'text-end pe-4' : 'ps-4'
                                        } style={{
                                            fontWeight: 600,
                                            color: '#374151',
                                            fontSize: '11px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            padding: '8px 16px'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContent.map((item) => (
                                    <tr key={item.id} className="transition-all">
                                        <td className="ps-4 py-2">
                                            <span style={{
                                                background: '#e0e7ff',
                                                color: '#4338ca',
                                                padding: '2px 8px',
                                                borderRadius: 12,
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                textTransform: 'capitalize'
                                            }}>
                                                {item.section}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <div className="fw-medium" style={{ color: '#1f2937', fontSize: '12px' }}>
                                                {item.title}
                                            </div>
                                            {item.subtitle && (
                                                <div className="text-muted" style={{ fontSize: '10px' }}>
                                                    {item.subtitle}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2">
                                            <div className="text-muted" style={{ fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.description}
                                            </div>
                                        </td>
                                        <td className="py-2">
                                            <button
                                                onClick={() => toggleContentStatus(item.id, item.isActive)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    padding: '2px 8px',
                                                    borderRadius: 12,
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    background: item.isActive ? '#dcfce7' : '#fee2e2',
                                                    color: item.isActive ? '#16a34a' : '#dc2626'
                                                }}
                                            >
                                                {item.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="py-2 pe-4 text-end">
                                            <div className="d-flex justify-content-end gap-1">
                                                <button
                                                    onClick={() => setEditingContent(item)}
                                                    title="Edit"
                                                    style={{
                                                        background: '#eff6ff',
                                                        border: '1px solid #bfdbfe',
                                                        borderRadius: 6,
                                                        padding: '4px 6px',
                                                        cursor: 'pointer',
                                                        color: '#2563eb'
                                                    }}
                                                >
                                                    <Edit size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.title)}
                                                    title="Delete"
                                                    style={{
                                                        background: '#fef2f2',
                                                        border: '1px solid #fecaca',
                                                        borderRadius: 6,
                                                        padding: '4px 6px',
                                                        cursor: 'pointer',
                                                        color: '#dc2626'
                                                    }}
                                                >
                                                    <Trash2 size={12} />
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

                {/* Modal Actions */}
                <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn d-flex align-items-center justify-content-center"
                        style={{
                            background: 'transparent',
                            border: '2px solid #6c757d',
                            color: '#6c757d',
                            fontWeight: 600,
                            fontSize: '12px',
                            height: '32px',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                            padding: '0 20px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#6c757d';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#6c757d';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn d-flex align-items-center justify-content-center"
                        style={{
                            background: '#16a085',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '12px',
                            height: '32px',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                            padding: '0 20px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#1a9b7d';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#16a085';
                        }}
                    >
                        <Save size={12} className="me-1" />
                        {content ? 'Update Content' : 'Add Content'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
