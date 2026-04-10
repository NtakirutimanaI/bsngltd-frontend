import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import {
    Type,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Building2,
    FileText,
    CheckCircle2,
    Globe
} from 'lucide-react';
import { fetchApi } from '../api/client';

interface Event {
    id?: string;
    title: string;
    type: "meeting" | "deadline" | "inspection" | "delivery";
    date: string;
    time: string;
    location?: string;
    project?: string;
    description: string;
    isPublished?: boolean;
}

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingEvent?: Event | null;
}

export function AddEventModal({ isOpen, onClose, onSuccess, editingEvent }: AddEventModalProps) {
    const [formData, setFormData] = useState<Event>({
        title: '',
        type: 'meeting',
        date: new Date().toISOString().split('T')[0],
        time: '09:00 AM',
        location: '',
        project: '',
        description: '',
        isPublished: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editingEvent) {
            setFormData(editingEvent);
        } else {
            setFormData({
                title: '',
                type: 'meeting',
                date: new Date().toISOString().split('T')[0],
                time: '09:00 AM',
                location: '',
                project: '',
                description: '',
                isPublished: false
            });
        }
    }, [editingEvent, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (editingEvent?.id) {
                await fetchApi(`/events/${editingEvent.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(formData)
                });
            } else {
                await fetchApi('/events', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save event');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingEvent ? "Edit Event" : "Add New Event"}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-100 text-red-700 text-xs rounded-lg font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Event Title</label>
                        <div className="relative group">
                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Enter event name..."
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Type</label>
                        <select
                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                        >
                            <option value="meeting">Meeting</option>
                            <option value="inspection">Site Inspection</option>
                            <option value="delivery">Material Delivery</option>
                            <option value="deadline">Deadline</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Date</label>
                        <div className="relative group">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="date"
                                required
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Time</label>
                        <div className="relative group">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
                                placeholder="e.g. 10:00 AM"
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Project (Optional)</label>
                        <div className="relative group">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
                                placeholder="Related project..."
                                value={formData.project}
                                onChange={e => setFormData({ ...formData, project: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Location</label>
                        <div className="relative group">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
                                placeholder="Enter location..."
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Description</label>
                        <div className="relative group">
                            <FileText className="absolute left-3 top-4 text-gray-400" size={16} />
                            <textarea
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none min-h-[100px]"
                                placeholder="Additional details..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                            <div className="flex items-center gap-2">
                                <Globe className="text-blue-600" size={18} />
                                <div>
                                    <div className="text-sm font-bold text-blue-900 dark:text-blue-100">Publish to Website</div>
                                    <div className="text-[10px] text-blue-600 font-medium">Allow this event to be visible on the public calendar</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.isPublished}
                                    onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <><Clock className="animate-spin" size={16} /> Saving...</>
                        ) : (
                            <><CheckCircle2 size={16} /> {editingEvent ? 'Update Event' : 'Create Event'}</>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
