import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, RefreshCcw } from 'lucide-react';
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

      <div className="p-3 border rounded-4 bg-light/30 mb-4">
        <div className="mb-3">
          <label className="form-label text-uppercase fw-bold text-muted" style={{ fontSize: '10px' }}>Title ({activeLang.toUpperCase()}) *</label>
          <input
            type="text"
            value={localizedData.title[activeLang]}
            onChange={(e) => handleLocalizedChange('title', e.target.value)}
            required={activeLang === 'en'}
            className="form-control bg-white border-0 focus:bg-white shadow-none"
            style={{ borderRadius: '8px', fontSize: '14px' }}
            placeholder={`Title in ${languages.find(l => l.id === activeLang)?.name}`}
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-uppercase fw-bold text-muted" style={{ fontSize: '10px' }}>Excerpt ({activeLang.toUpperCase()}) *</label>
          <textarea
            value={localizedData.excerpt[activeLang]}
            onChange={(e) => handleLocalizedChange('excerpt', e.target.value)}
            required={activeLang === 'en'}
            rows={2}
            className="form-control bg-white border-0 focus:bg-white shadow-none resize-none"
            style={{ borderRadius: '8px', fontSize: '13px' }}
            placeholder={`Brief summary in ${languages.find(l => l.id === activeLang)?.name}`}
          />
        </div>

        <div>
          <label className="form-label text-uppercase fw-bold text-muted" style={{ fontSize: '10px' }}>Body Content ({activeLang.toUpperCase()}) *</label>
          <textarea
            value={localizedData.content[activeLang]}
            onChange={(e) => handleLocalizedChange('content', e.target.value)}
            required={activeLang === 'en'}
            rows={4}
            className="form-control bg-white border-0 focus:bg-white shadow-none resize-none"
            style={{ borderRadius: '8px', fontSize: '13px' }}
            placeholder={`Full article body in ${languages.find(l => l.id === activeLang)?.name}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? t('allUpdates') : (t('category' + cat) !== 'category' + cat ? t('category' + cat) : cat)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Author *</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            placeholder="Author name"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Image URL *</label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            placeholder="Add a tag"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition"
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

      <div className="d-flex gap-3 pt-4 border-top mt-4">
        <button
          type="button"
          onClick={() => {
            isEdit ? setIsEditModalOpen(false) : setIsAddModalOpen(false);
            resetForm();
          }}
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
          {isEdit ? <RefreshCcw size={18} /> : <Plus size={18} />}
          {isEdit ? 'Update' : 'Publish'} Update
        </button>
      </div>
    </form>
  );

  return (
    <div className="container-fluid bg-light min-vh-100 px-2 px-md-4 pt-4 pb-4">
      {/* Header */}
      <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <RefreshCcw size={20} className="text-primary" />
            Manage Updates
          </h1>
          <p className="text-muted small mb-0">Create and manage company updates, news, and announcements</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={handleSeed}
            className="btn btn-light border d-flex align-items-center gap-2 px-4 py-2 fw-bold text-muted"
            style={{ borderRadius: '10px', height: '38px' }}
          >
            <RefreshCcw size={16} />
            Seed Sample
          </button>
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 fw-bold shadow-sm"
            style={{ borderRadius: '10px', height: '38px' }}
          >
            <Plus size={18} />
            Add Update
          </button>
        </div>
      </ScrollReveal>

      {/* Actions Bar */}
      <ScrollReveal delay={0.1} className="card shadow-sm border-0 rounded-4 mb-4 bg-white overflow-hidden">
        <div className="card-body p-3">
          <div className="position-relative">
            <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by title, content or author..."
              className="form-control ps-5 bg-light border-0 focus:bg-white transition-all shadow-none"
              style={{ height: '45px', borderRadius: '10px', fontSize: '14px' }}
            />
          </div>
        </div>
      </ScrollReveal>

      {/* Stats */}
      <ScrollReveal delay={0.2} className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 rounded-4 bg-white p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-primary-subtle text-primary rounded-4">
                <RefreshCcw size={24} />
              </div>
              <div>
                <div className="h4 fw-bold mb-0 text-dark">{updates.length}</div>
                <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '10px' }}>Total Updates</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 rounded-4 bg-white p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-success-subtle text-success rounded-4">
                <Search size={24} />
              </div>
              <div>
                <div className="h4 fw-bold mb-0 text-dark">{updates.length}</div>
                <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '10px' }}>Visible Results</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 rounded-4 bg-white p-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-info-subtle text-info rounded-4">
                <Plus size={24} />
              </div>
              <div>
                <div className="h4 fw-bold mb-0 text-dark">{categories.length}</div>
                <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '10px' }}>Categories</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Updates List */}
      <ScrollReveal delay={0.3} className="card shadow-sm border-0 rounded-4 mb-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4 py-3 border-0 text-dark small text-uppercase fw-bold">Title & Excerpt</th>
                <th className="py-3 border-0 text-dark small text-uppercase fw-bold">Category</th>
                <th className="py-3 border-0 text-dark small text-uppercase fw-bold">Author</th>
                <th className="py-3 border-0 text-dark small text-uppercase fw-bold">Date</th>
                <th className="py-3 border-0 text-dark small text-uppercase fw-bold">Tags</th>
                <th className="pe-4 py-3 border-0 text-dark small text-uppercase fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="border-0">
              {updates.map((update) => (
                <tr key={update.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{dt(update.title)}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{dt(update.excerpt)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {update.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{update.author}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(update.date)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {update.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {update.tags.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{update.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(update)}
                        className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all hover:scale-110 active:scale-95"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUpdate(update.id)}
                        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-all hover:scale-110 active:scale-95"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {updates.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No updates found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <PaginationSelector
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
              />
            </div>
          )}
        </div>
      </ScrollReveal >

      {/* Add Modal */}
      {
        isAddModalOpen && (
          <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Update" size="md" draggable={true}>
            <div className="p-4">
              <UpdateForm onSubmit={handleAddUpdate} />
            </div>
          </Modal>
        )
      }

      {/* Edit Modal */}
      {
        isEditModalOpen && (
          <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Update" size="md" draggable={true}>
            <div className="p-4">
              <UpdateForm onSubmit={handleEditUpdate} isEdit={true} />
            </div>
          </Modal>
        )
      }
    </div >
  );
}
