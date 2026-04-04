import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, RefreshCcw, Rss, Calendar, User, Tag } from 'lucide-react';
import { Modal } from '@/app/components/Modal';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import { PaginationSelector } from "@/app/components/ui/pagination-selector";
import { useLanguage } from '@/app/context/LanguageContext';
import { fetchApi } from '../api/client';
import { useDebounce } from "@/app/hooks/useDebounce";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

interface Update {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  image: string;
  tags: string[];
}

export function ManageUpdates() {
  const { dt, t } = useLanguage();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    const query = new URLSearchParams({
      page: currentPage.toString(),
      limit: pageSize.toString(),
      search: debouncedSearchTerm,
      t: refreshKey.toString()
    }).toString();

    fetchApi<PaginatedResponse<Update>>(`/updates?${query}`)
      .then(res => {
        setUpdates(res.data);
        setTotalPages(res.lastPage);
        setTotalItems(res.total || 0);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch updates", err);
        setIsLoading(false);
      });
  }, [currentPage, pageSize, debouncedSearchTerm, refreshKey]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [formData, setFormData] = useState<Omit<Update, 'id'>>({
    title: '',
    excerpt: '',
    content: '',
    category: 'News',
    author: '',
    date: new Date().toISOString().split('T')[0],
    image: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleSeed = async () => {
    if (!window.confirm("Seed sample updates? This will add demonstration data.")) return;
    try {
      setIsLoading(true);
      await fetchApi('/updates/seed');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error("Failed to seed updates", err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Projects', 'Awards', 'Events', 'News', 'Company'];


  const [activeLang, setActiveLang] = useState('en');
  const languages = [
    { id: 'en', name: 'English' },
    { id: 'rw', name: 'Kinyarwanda' },
    { id: 'sw', name: 'Swahili' },
    { id: 'fr', name: 'French' },
  ];

  // Localized fields state
  const [localizedData, setLocalizedData] = useState<Record<string, Record<string, string>>>({
    title: { en: "", rw: "", sw: "", fr: "" },
    excerpt: { en: "", rw: "", sw: "", fr: "" },
    content: { en: "", rw: "", sw: "", fr: "" },
  });

  const handleLocalizedChange = (field: string, val: string) => {
    setLocalizedData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [activeLang]: val
      }
    }));
  };

  const getLocalizedValues = (update: Update) => {
    const parse = (val: string) => {
      try {
        if (val.startsWith('{')) return JSON.parse(val);
      } catch (e) { }
      return { en: val, rw: "", sw: "", fr: "" };
    };
    return {
      title: parse(update.title),
      excerpt: parse(update.excerpt),
      content: parse(update.content),
    };
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/updates', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          title: JSON.stringify(localizedData.title),
          excerpt: JSON.stringify(localizedData.excerpt),
          content: JSON.stringify(localizedData.content),
        }),
      });
      // Refresh list
      setCurrentPage(1);
      setRefreshKey(prev => prev + 1);
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create update", error);
      alert("Failed to create update");
    }
  };

  const handleEditUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUpdate) {
      try {
        await fetchApi(`/updates/${selectedUpdate.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            ...formData,
            title: JSON.stringify(localizedData.title),
            excerpt: JSON.stringify(localizedData.excerpt),
            content: JSON.stringify(localizedData.content),
          }),
        });
        setRefreshKey(prev => prev + 1);
        setIsEditModalOpen(false);
        setSelectedUpdate(null);
        resetForm();
      } catch (error) {
        console.error("Failed to update", error);
        alert("Failed to update");
      }
    }
  };

  const handleDeleteUpdate = async (id: string) => {
    if (confirm('Are you sure you want to delete this update?')) {
      try {
        await fetchApi(`/updates/${id}`, { method: 'DELETE' });
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const openEditModal = (update: Update) => {
    setSelectedUpdate(update);
    const localized = getLocalizedValues(update);
    setLocalizedData(localized);
    setFormData({
      title: update.title,
      excerpt: update.excerpt,
      content: update.content,
      category: update.category,
      author: update.author,
      date: update.date.split('T')[0],
      image: update.image,
      tags: update.tags,
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'News',
      author: '',
      date: new Date().toISOString().split('T')[0],
      image: '',
      tags: [],
    });
    setLocalizedData({
      title: { en: "", rw: "", sw: "", fr: "" },
      excerpt: { en: "", rw: "", sw: "", fr: "" },
      content: { en: "", rw: "", sw: "", fr: "" },
    });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const UpdateForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void; isEdit?: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="d-flex gap-1 p-1 bg-light rounded-3 mb-4 border">
        {languages.map(lang => (
          <button
            key={lang.id}
            type="button"
            onClick={() => setActiveLang(lang.id)}
            className={`flex-grow-1 btn btn-sm py-1.5 fw-bold transition-all ${activeLang === lang.id
              ? 'btn-white bg-white shadow-sm text-primary'
              : 'text-muted hover:text-dark border-0 bg-transparent'
              }`}
            style={{ borderRadius: '6px' }}
          >
            <span className="text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>{lang.name}</span>
          </button>
        ))}
      </div>

      <div className="p-2 border rounded-4 bg-light/30 mb-2">
        <div className="mb-2">
          <label className="form-label text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '10px' }}>Title ({activeLang.toUpperCase()}) *</label>
          <input
            type="text"
            value={localizedData.title[activeLang]}
            onChange={(e) => handleLocalizedChange('title', e.target.value)}
            required={activeLang === 'en'}
            className="form-control bg-white border-0 focus:bg-white shadow-none"
            style={{ borderRadius: '6px', fontSize: '13px', padding: '6px 12px', height: '32px' }}
            placeholder={`Title in ${languages.find(l => l.id === activeLang)?.name}`}
          />
        </div>

        <div className="mb-2">
          <label className="form-label text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '10px' }}>Excerpt ({activeLang.toUpperCase()}) *</label>
          <textarea
            value={localizedData.excerpt[activeLang]}
            onChange={(e) => handleLocalizedChange('excerpt', e.target.value)}
            required={activeLang === 'en'}
            rows={2}
            className="form-control bg-white border-0 focus:bg-white shadow-none resize-none"
            style={{ borderRadius: '6px', fontSize: '12px', padding: '6px 12px' }}
            placeholder={`Brief summary in ${languages.find(l => l.id === activeLang)?.name}`}
          />
        </div>

        <div>
          <label className="form-label text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '10px' }}>Body Content ({activeLang.toUpperCase()}) *</label>
          <textarea
            value={localizedData.content[activeLang]}
            onChange={(e) => handleLocalizedChange('content', e.target.value)}
            required={activeLang === 'en'}
            rows={3}
            className="form-control bg-white border-0 focus:bg-white shadow-none resize-none"
            style={{ borderRadius: '6px', fontSize: '12px', padding: '6px 12px' }}
            placeholder={`Full article body in ${languages.find(l => l.id === activeLang)?.name}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase">Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-2 py-1.5 text-[12px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white h-8"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? t('allUpdates') : (t('category' + cat) !== 'category' + cat ? t('category' + cat) : cat)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase">Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="w-full px-2 py-1.5 text-[12px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white h-8"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase">Author *</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required
            className="w-full px-2 py-1.5 text-[12px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white h-8"
            placeholder="Author name"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase">Image URL *</label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
          className="w-full px-2 py-1.5 text-[12px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white h-8"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-2 py-1.5 text-[12px] border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white h-8"
            placeholder="Add a tag..."
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-1 text-[11px] bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-bold transition h-8"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-900 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="d-flex gap-2 pt-3 border-top mt-3">
        <button
          type="button"
          onClick={() => {
            isEdit ? setIsEditModalOpen(false) : setIsAddModalOpen(false);
            resetForm();
          }}
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
          {isEdit ? <RefreshCcw size={14} /> : <Plus size={14} />}
          {isEdit ? 'Update' : 'Publish'} Update
        </button>
      </div>
    </form>
  );

  return (
    <div className="container-fluid bg-light min-vh-100 px-2 pt-2 pb-2">
      {/* Success/Error Message */}
      {/* Header */}
      <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <Rss size={18} className="text-primary" />
            Blog &amp; Updates
          </h1>
          <p className="text-muted small mb-0">Create and manage company updates, news, and announcements</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={handleSeed}
            className="btn btn-light btn-sm border d-flex align-items-center gap-1.5 px-3 fw-bold text-muted whitespace-nowrap"
            style={{ height: '34px', borderRadius: '6px', fontSize: '11px' }}
          >
            <RefreshCcw size={12} />
            Seed Sample
          </button>
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 fw-bold shadow-sm"
            style={{ borderRadius: '8px', height: '32px', fontSize: '11px' }}
          >
            <Plus size={14} />
            Add Update
          </button>
        </div>
      </ScrollReveal>

      {/* Filters & Actions */}
      <ScrollReveal delay={0.1} className="mb-2">
        <div className="d-flex flex-column gap-2" style={{ maxWidth: '300px' }}>
          <div className="position-relative">
            <Search className="position-absolute top-50 translate-middle-y text-muted opacity-50" size={14} style={{ left: '12px' }} />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by title, content or author..."
                className="form-control form-control-sm ps-5 bg-white border-0 shadow-sm rounded-xl py-2 search-input"
              />
          </div>
        </div>
      </ScrollReveal>

      {/* Stats */}
      <ScrollReveal delay={0.2} className="row g-2 mb-2">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 rounded-4 bg-white p-2 h-100">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3" style={{ background: 'rgba(0,156,255,0.1)' }}>
                <Rss size={16} className="text-primary" />
              </div>
              <div>
                <div className="fw-bold mb-0 text-dark" style={{ fontSize: '20px', lineHeight: 1 }}>{totalItems}</div>
                <div className="text-muted fw-bold text-uppercase" style={{ fontSize: '10px' }}>Total Updates</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 rounded-4 bg-white p-2 h-100">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3" style={{ background: 'rgba(25,135,84,0.1)' }}>
                <Tag size={16} className="text-success" />
              </div>
              <div>
                <div className="fw-bold mb-0 text-dark" style={{ fontSize: '20px', lineHeight: 1 }}>{categories.length}</div>
                <div className="text-muted fw-bold text-uppercase" style={{ fontSize: '10px' }}>Categories</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 rounded-4 bg-white p-2 h-100">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3" style={{ background: 'rgba(13,202,240,0.1)' }}>
                <Calendar size={16} className="text-info" />
              </div>
              <div>
                <div className="fw-bold mb-0 text-dark" style={{ fontSize: '20px', lineHeight: 1 }}>{updates.length}</div>
                <div className="text-muted fw-bold text-uppercase" style={{ fontSize: '10px' }}>This Page</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
      {/* Updates Table */}
      <ScrollReveal delay={0.3} className="card shadow-sm border-0 rounded-4 mb-2 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-3 py-2 border-0 text-dark small text-uppercase fw-bold">Update</th>
                <th className="py-2 border-0 text-dark small text-uppercase fw-bold">Category</th>
                <th className="py-2 border-0 text-dark small text-uppercase fw-bold">Author</th>
                <th className="py-2 border-0 text-dark small text-uppercase fw-bold">Date</th>
                <th className="py-2 border-0 text-dark small text-uppercase fw-bold">Tags</th>
                <th className="pe-3 py-2 border-0 text-dark small text-uppercase fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-0">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">Loading updates...</td>
                </tr>
              ) : updates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">No updates found.</td>
                </tr>
              ) : (
                updates.map((update) => (
                  <tr key={update.id} className="border-bottom border-light/50">
                    <td className="ps-3 py-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-1.5 rounded bg-light text-primary border">
                          <Rss size={13} />
                        </div>
                        <div>
                          <div className="fw-bold text-dark text-sm mb-0">{dt(update.title)}</div>
                          <div className="text-muted text-truncate" style={{ fontSize: '11px', maxWidth: '220px' }}>{dt(update.excerpt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2">
                      <span className="badge bg-light text-primary border px-2 py-1 rounded" style={{ fontSize: '11px' }}>
                        {update.category}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="d-flex align-items-center gap-1">
                        <User size={11} className="text-muted" />
                        <span className="text-muted" style={{ fontSize: '11px' }}>{update.author}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="d-flex align-items-center gap-1">
                        <Calendar size={11} className="text-muted" />
                        <span className="text-muted" style={{ fontSize: '11px' }}>{formatDate(update.date)}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="d-flex flex-wrap gap-1">
                        {update.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="badge bg-light text-dark border px-2 py-0.5 rounded" style={{ fontSize: '10px' }}>
                            {tag}
                          </span>
                        ))}
                        {update.tags.length > 2 && (
                          <span className="badge bg-light text-muted border px-2 py-0.5 rounded" style={{ fontSize: '10px' }}>
                            +{update.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="pe-3 py-2 text-end">
                      <div className="d-flex justify-content-end gap-1.5">
                        <button
                          onClick={() => openEditModal(update)}
                          className="btn btn-light btn-sm border shadow-sm p-1.5 text-primary hover:bg-primary hover:text-white transition-all"
                          style={{ borderRadius: '6px' }}
                          title="Edit"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteUpdate(update.id)}
                          className="btn btn-light btn-sm border shadow-sm p-1.5 text-danger hover:bg-danger hover:text-white transition-all"
                          style={{ borderRadius: '6px' }}
                          title="Delete"
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

      {/* Add Modal */}
      {
        isAddModalOpen && (
          <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Update" size="md" draggable={true}>
            <div className="p-3">
              <UpdateForm onSubmit={handleAddUpdate} />
            </div>
          </Modal>
        )
      }

      {/* Edit Modal */}
      {
        isEditModalOpen && (
          <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Update" size="md" draggable={true}>
            <div className="p-3">
              <UpdateForm onSubmit={handleEditUpdate} isEdit={true} />
            </div>
          </Modal>
        )
      }

      <style>{`
        .search-input { padding-left: 35px !important; }
        .search-input::placeholder { text-indent: 5px; }
      `}</style>
    </div >
  );
}
