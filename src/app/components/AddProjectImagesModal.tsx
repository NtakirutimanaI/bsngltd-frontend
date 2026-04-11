import { useState, useEffect } from "react";
import { Modal } from "@/app/components/Modal";
import { fetchApi } from '../api/client';
import { toast } from "sonner";
import { Image, Plus, Trash2, CheckCircle2, CloudUpload, Upload, RefreshCw } from "lucide-react";

interface AddProjectImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  project: any;
}

export function AddProjectImagesModal({ isOpen, onClose, onSuccess, project }: AddProjectImagesModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (project) {
      setMainImage(project.imageUrl || "");
      setGallery(project.gallery || []);
    }
  }, [project, isOpen]);

  const handleFileUpload = async (file: File, isGallery: boolean, galleryIdx?: number) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetchApi<any>('/content/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (res.url) {
        if (!isGallery) {
          setMainImage(res.url);
        } else if (galleryIdx !== undefined) {
          updateGalleryImage(galleryIdx, res.url);
        }
        toast.success('Image uploaded successfully');
      }
    } catch (err: any) {
      toast.error('Failed to upload image: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchApi(`/projects/${project.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          imageUrl: mainImage || null,
          gallery: gallery.filter(url => url && url.trim() !== '')
        }),
      });
      if (onSuccess) onSuccess();
      toast.success("Project images updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(`Failed to update images: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGalleryImage = () => setGallery([...gallery, ""]);
  const removeGalleryImage = (index: number) => setGallery(gallery.filter((_, i) => i !== index));
  const updateGalleryImage = (index: number, val: string) => {
    const newGallery = [...gallery];
    newGallery[index] = val;
    setGallery(newGallery);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Project Images" size="md">
      <form onSubmit={handleSubmit} className="p-1 text-start">
        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-dashed border-blue-200 d-flex align-items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-lg">
            <Image size={20} />
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">{project?.name}</h6>
            <p className="smaller text-muted mb-0">Manage visual media for this project</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label small fw-bold text-primary mb-2 d-flex align-items-center gap-2">
            <CheckCircle2 size={14} /> PRIMARY PROJECT IMAGE
          </label>
          <div className="d-flex flex-column gap-2">
            <input
              type="file"
              accept="image/*"
              className="d-none"
              id="mainImageUpload"
              disabled={isUploading}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0], false);
                }
              }}
            />
            <label htmlFor="mainImageUpload" className={`btn btn-outline-primary btn-sm py-4 px-3 fw-bold rounded-xl m-0 d-flex flex-column gap-2 align-items-center justify-content-center w-100 ${isUploading ? 'opacity-50' : 'cursor-pointer'}`} style={{ cursor: isUploading ? 'not-allowed' : 'pointer', borderStyle: 'dashed', borderWidth: '2px', backgroundColor: '#f8fbfc' }}>
              {isUploading ? <RefreshCw size={24} className="animate-spin text-primary" /> : <CloudUpload size={24} className="text-primary" />} 
              <span className="small text-muted">{isUploading ? 'Uploading...' : 'Browse Local Files to Upload Primary Image'}</span>
            </label>
          </div>
          {mainImage && (
            <div className="mt-2 rounded-xl overflow-hidden border shadow-sm" style={{ height: '120px' }}>
              <img src={mainImage} className="w-100 h-100 object-fit-cover" alt="Main Project Image" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label small fw-bold text-primary mb-2 d-flex align-items-center justify-content-between">
            <span className="d-flex align-items-center gap-2"><Image size={14} /> SITUATIONAL GALLERY</span>
            <button type="button" onClick={addGalleryImage} className="btn btn-sm btn-outline-primary py-0 px-2 fw-bold text-xs rounded-pill">
              <Plus size={12} className="me-1" /> Add Image
            </button>
          </label>
          
          <div className="d-flex flex-column gap-2">
            {gallery.map((url, idx) => (
              <div key={idx} className="d-flex gap-2 align-items-start">
                {url ? (
                  <div className="flex-grow-1 border rounded-lg p-1 bg-light d-flex align-items-center justify-content-center" style={{ height: '60px' }}>
                    <img src={url} alt="Gallery item" className="h-100 object-fit-cover rounded shadow-sm" style={{ maxWidth: '100%' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                ) : (
                  <div className="flex-grow-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      id={`galleryUpload-${idx}`}
                      disabled={isUploading}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0], true, idx);
                        }
                      }}
                    />
                    <label htmlFor={`galleryUpload-${idx}`} className={`btn btn-outline-secondary btn-sm p-2 m-0 d-flex align-items-center justify-content-center w-100 ${isUploading ? 'opacity-50' : 'cursor-pointer'}`} style={{ cursor: isUploading ? 'not-allowed' : 'pointer', borderStyle: 'dashed', borderWidth: '2px', height: '60px' }}>
                      {isUploading ? <RefreshCw size={18} className="animate-spin text-muted" /> : <Upload size={18} className="text-muted" />} 
                      <span className="ms-2 smaller text-muted fw-bold">Select Local Image</span>
                    </label>
                  </div>
                )}

                <button type="button" onClick={() => removeGalleryImage(idx)} className="btn btn-outline-danger btn-sm p-2 rounded-lg border-gray-200" style={{ height: '60px', width: '60px' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {gallery.length === 0 && (
              <div className="text-center py-4 bg-light rounded-xl border border-dashed border-gray-300">
                <p className="smaller text-muted mb-0">No gallery images added yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-2">
          <button type="button" onClick={onClose} className="btn btn-light px-4 py-2 border fw-bold text-muted shadow-sm rounded-xl text-xs">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="btn btn-primary px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 rounded-xl text-xs"
            style={{ background: '#009CFF', border: 'none', opacity: (isSubmitting || isUploading) ? 0.7 : 1 }}
          >
            {isSubmitting ? "Saving..." : "Save Project Images"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
