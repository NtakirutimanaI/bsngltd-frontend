import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Modal } from '@/app/components/Modal';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
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
  const { dt } = useLanguage();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    const query = new URLSearchParams({
      page: currentPage.toString(),
      limit: '10',
      search: debouncedSearchTerm,
      t: refreshKey.toString()
    }).toString();

    fetchApi<PaginatedResponse<Update>>(`/updates?${query}`)
      .then(res => {
        setUpdates(res.data);
        setTotalPages(res.lastPage);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch updates", err);
        setIsLoading(false);
      });
  }, [currentPage, debouncedSearchTerm, refreshKey]);
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
      <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-lg mb-3">
        {languages.map(lang => (
          <button
            key={lang.id}
            type="button"
            onClick={() => setActiveLang(lang.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all text-xs font-semibold ${activeLang === lang.id
              ? 'bg-white shadow-sm text-orange-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <span className="uppercase">{lang.id}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3 p-3 border border-orange-100 rounded-lg bg-orange-50/20">
        <div>
          <label className="block text-xs font-semibold text-orange-900 mb-1 uppercase">Title ({activeLang.toUpperCase()}) *</label>
          <input
            type="text"
            value={localizedData.title[activeLang]}
            onChange={(e) => handleLocalizedChange('title', e.target.value)}
            required={activeLang === 'en'}
            className="w-full px-3 py-2 text-sm border border-orange-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
            placeholder={`Title in ${languages.find(l => l.id === activeLang)?.name}`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-orange-900 mb-1 uppercase">Excerpt ({activeLang.toUpperCase()}) *</label>
          <textarea
            value={localizedData.excerpt[activeLang]}
            onChange={(e) => handleLocalizedChange('excerpt', e.target.value)}
            required={activeLang === 'en'}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-orange-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none bg-white"
            placeholder={`Brief summary in ${languages.find(l => l.id === activeLang)?.name}`}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-orange-900 mb-1 uppercase">Content ({activeLang.toUpperCase()}) *</label>
          <textarea
            value={localizedData.content[activeLang]}
            onChange={(e) => handleLocalizedChange('content', e.target.value)}
            required={activeLang === 'en'}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-orange-200 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none bg-white"
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Author *</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
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
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
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
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
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
              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-orange-900 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <button
          type="button"
          onClick={() => {
            isEdit ? setIsEditModalOpen(false) : setIsAddModalOpen(false);
            resetForm();
          }}
          className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium transition"
        >
          {isEdit ? 'Update' : 'Create'} Update
        </button>
      </div>
    </form>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <ScrollReveal className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Updates</h1>
        <p className="text-gray-600">Create and manage company updates, news, and announcements</p>
      </ScrollReveal>

      {/* Actions Bar */}
      <ScrollReveal delay={0.1} className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search updates..."
            className="w-full pl-12 pr-4 py-2 bg-transparent border-0 border-b-2 border-gray-400 rounded-none focus:ring-0 focus:border-orange-500 outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          <Plus className="w-5 h-5" />
          Add Update
        </button>
      </ScrollReveal>

      {/* Stats */}
      <ScrollReveal delay={0.2} className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{updates.length}</div>
          <div className="text-sm text-gray-600">Total Updates</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{updates.length}</div>
          <div className="text-sm text-gray-600">Visible Results</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
      </ScrollReveal>

      {/* Updates List */}
      <ScrollReveal delay={0.3} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Title</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Author</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Tags</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {updates.map((update) => (
                <tr key={update.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{dt(update.title)}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{dt(update.excerpt)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
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
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUpdate(update.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Add Modal */}
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Update" size="md" draggable={true}>
          <div className="p-4">
            <UpdateForm onSubmit={handleAddUpdate} />
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Update" size="md" draggable={true}>
          <div className="p-4">
            <UpdateForm onSubmit={handleEditUpdate} isEdit={true} />
          </div>
        </Modal>
      )}
    </div>
  );
}
