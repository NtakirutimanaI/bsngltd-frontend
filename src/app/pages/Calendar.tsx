import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Trash2,
  CalendarDays,
  Globe,
  Lock,
  Edit2
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from "../api/client";
import { AddEventModal } from "../components/AddEventModal";

interface Event {
  id: string;
  title: string;
  type: "meeting" | "deadline" | "inspection" | "delivery";
  date: string;
  time: string;
  location?: string;
  attendees?: string[];
  project?: string;
  description: string;
  isPublished?: boolean;
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<Event[]>(`/events?t=${Date.now()}`);
      setEvents(data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await fetchApi(`/events/${id}`, { method: 'DELETE' });
      loadEvents();
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean | undefined) => {
    try {
      await fetchApi(`/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus })
      });
      loadEvents();
    } catch (err) {
      console.error("Failed to update event publish status", err);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => event.date === dateStr);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting": return { bg: 'rgba(0,156,255,0.1)', border: '#009CFF', bar: '#009CFF' };
      case "deadline": return { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', bar: '#ef4444' };
      case "inspection": return { bg: 'rgba(245,158,11,0.1)', border: '#f59e0b', bar: '#f59e0b' };
      case "delivery": return { bg: 'rgba(16,185,129,0.1)', border: '#10b981', bar: '#10b981' };
      default: return { bg: 'rgba(100,116,139,0.1)', border: '#64748b', bar: '#64748b' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meeting": return "👥";
      case "deadline": return "⏰";
      case "inspection": return "🔍";
      case "delivery": return "🚚";
      default: return "📅";
    }
  };

  return (
    <div className="container-fluid py-0 min-vh-100" style={{ background: 'transparent' }}>
      <div className="row g-1 pt-1">
        {/* ── Page Header ── */}
        <div className="col-12 px-lg-4">
          <ScrollReveal>
            <div className="glass-card p-3 rounded-xl border border-white shadow-sm d-flex align-items-center justify-content-between"
                 style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-lg d-flex align-items-center justify-content-center shadow-sm"
                     style={{ width: 36, height: 36, background: '#009CFF' }}>
                  <CalendarDays size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="fw-bold mb-0" style={{ fontSize: '14px' }}>Schedule & Calendar</h2>
                  <p className="text-muted mb-0" style={{ fontSize: '11px' }}>Manage project timelines and important dates</p>
                </div>
              </div>
              <button
                onClick={handleAdd}
                className="btn btn-sm d-flex align-items-center gap-2 text-white shadow-none"
                style={{ background: '#009CFF', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>
                <Plus size={13} /> Add Event
              </button>
            </div>
          </ScrollReveal>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="col-12 px-lg-4">
          <div className="row g-1">
            {/* Calendar Widget */}
            <ScrollReveal delay={0.1} className="col-lg-8">
              <div className="glass-card h-100 rounded-xl border border-white shadow-sm overflow-hidden"
                   style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
                {/* Calendar Bar */}
                <div className="px-3 py-2 border-bottom border-gray-100 d-flex align-items-center justify-content-between"
                     style={{ background: 'rgba(248,251,255,0.9)' }}>
                  <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <div className="d-flex align-items-center gap-1">
                    <button onClick={previousMonth} className="btn btn-sm d-flex justify-content-center align-items-center"
                            style={{ borderRadius: '6px', background: 'rgba(0,156,255,0.06)', padding: '4px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                      <ChevronLeft size={14} />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="btn btn-sm fw-bold"
                            style={{ borderRadius: '6px', fontSize: '11px', background: 'rgba(0,156,255,0.06)', padding: '4px 10px', color: '#009CFF', border: '1px solid rgba(0,156,255,0.15)' }}>
                      Today
                    </button>
                    <button onClick={nextMonth} className="btn btn-sm d-flex justify-content-center align-items-center"
                            style={{ borderRadius: '6px', background: 'rgba(0,156,255,0.06)', padding: '4px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {/* Day headers */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="col text-center text-uppercase fw-bold pb-2 text-muted" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                        {day}
                      </div>
                    ))}

                    {/* Empty cells */}
                    {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                      <div key={`empty-${index}`} className="col" />
                    ))}

                    {/* Calendar days */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const day = index + 1;
                      const dayEvents = getEventsForDate(day);
                      const isToday =
                        day === new Date().getDate() &&
                        currentDate.getMonth() === new Date().getMonth() &&
                        currentDate.getFullYear() === new Date().getFullYear();

                      return (
                        <div key={day} className="col p-0 px-1 mb-1">
                          <div className={`calendar-day-box p-1 h-100 d-flex flex-column rounded-lg`}
                               style={{ 
                                 minHeight: '45px', 
                                 background: isToday ? 'rgba(0,156,255,0.08)' : 'rgba(248,251,255,0.6)', 
                                 border: isToday ? '1px solid rgba(0,156,255,0.3)' : '1px solid #f1f5f9',
                                 cursor: 'pointer',
                                 transition: 'all 0.2s ease'
                               }}>
                            <div className={`fw-bold text-end pe-1 ${isToday ? "text-primary" : "text-dark"}`} style={{ fontSize: '14px' }}>
                              {day}
                            </div>
                            <div className="d-flex flex-column gap-1 flex-grow-1 mt-1 justify-content-end px-1">
                              {dayEvents.slice(0, 3).map((event) => {
                                const c = getTypeColor(event.type);
                                return (
                                  <div key={event.id} className="w-100 rounded-pill" style={{ height: '3px', background: c.bar }} title={event.title} />
                                );
                              })}
                              {dayEvents.length > 3 && (
                                <div className="text-muted fw-bold text-end" style={{ fontSize: '8px' }}>+{dayEvents.length - 3}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Upcoming Events sidebar */}
            <ScrollReveal delay={0.15} className="col-lg-4">
              <div className="d-flex flex-column gap-1 h-100">
                <div className="glass-card rounded-xl border border-white shadow-sm flex-grow-1"
                     style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
                  
                  <div className="px-3 py-2 border-bottom border-gray-100" style={{ background: 'rgba(248,251,255,0.9)' }}>
                    <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>Upcoming Events</span>
                  </div>

                  <div className="p-2 d-flex flex-column h-100 position-relative gap-0">
                    <div className="d-flex flex-column gap-1 flex-grow-1 overflow-auto" style={{ minHeight: '180px' }}>
                      {(() => {
                        const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        const paginatedEvents = sortedEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                        return paginatedEvents.map((event) => {
                          const tc = getTypeColor(event.type);
                          return (
                            <div key={event.id} onClick={() => handleEdit(event)}
                                 className="event-card p-1 px-2 mb-1 rounded-xl d-flex flex-column gap-0 position-relative"
                                 style={{ background: 'rgba(248,251,255,0.8)', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                              <div className="position-absolute top-0 end-0 p-1 d-flex align-items-center gap-1 bg-white shadow-sm rounded-start border" style={{ zIndex: 10, borderColor: '#f1f5f9' }}>
                                <button onClick={(e) => { e.stopPropagation(); handleTogglePublish(event.id, event.isPublished); }}
                                        className="d-flex align-items-center justify-content-center p-1 rounded hover-bg-light"
                                        style={{ border: 'none', background: 'transparent', color: event.isPublished ? '#10b981' : '#64748b' }} title={event.isPublished ? 'Unpublish' : 'Publish'}>
                                  {event.isPublished ? <Globe size={12} /> : <Lock size={12} />}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleEdit(event); }}
                                        className="d-flex align-items-center justify-content-center p-1 rounded hover-bg-light"
                                        style={{ border: 'none', background: 'transparent', color: '#009CFF' }} title="Edit">
                                  <Edit2 size={12} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                                        className="d-flex align-items-center justify-content-center p-1 rounded hover-bg-light"
                                        style={{ border: 'none', background: 'transparent', color: '#ef4444' }} title="Delete">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <div className="rounded d-flex align-items-center justify-content-center flex-shrink-0"
                                     style={{ width: 18, height: 18, background: tc.bg, border: `1px solid ${tc.border}` }}>
                                  <span style={{ fontSize: '10px' }}>{getTypeIcon(event.type)}</span>
                                </div>
                                <div className="fw-bold text-dark text-truncate" style={{ fontSize: '11px', paddingRight: '80px' }}>
                                  {event.title}
                                </div>
                              </div>
                              <div className="d-flex gap-2 text-muted align-items-center ps-4 mt-1" style={{ fontSize: '9px' }}>
                                <div className="d-flex align-items-center gap-1">
                                  <CalendarIcon size={8} className="text-primary" /> {event.date}
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                  <Clock size={8} className="text-primary" /> {event.time}
                                </div>
                              </div>
                              {event.location && (
                                <div className="d-flex align-items-center gap-1 text-muted ps-4 mb-1" style={{ fontSize: '9px' }}>
                                  <MapPin size={8} /> <span className="text-truncate">{event.location}</span>
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                      
                      {events.length === 0 && !loading && (
                        <div className="text-center py-4 my-auto">
                          <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                               style={{ width: 44, height: 44, background: 'rgba(0,156,255,0.08)' }}>
                            <CalendarDays size={20} style={{ color: '#009CFF' }} />
                          </div>
                          <p className="text-muted fw-semibold" style={{ fontSize: '11px' }}>No upcoming events</p>
                        </div>
                      )}
                      {loading && (
                        <div className="text-center py-4 my-auto">
                          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        </div>
                      )}
                    </div>
                    
                    {events.length > itemsPerPage && (
                      <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-gray-100 z-1 bg-white">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="btn btn-sm d-flex justify-content-center align-items-center"
                          style={{ borderRadius: '6px', background: 'rgba(0,156,255,0.06)', padding: '2px 6px', border: '1px solid #e2e8f0', color: currentPage === 1 ? '#cbd5e1' : '#64748b' }}>
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-muted fw-semibold" style={{ fontSize: '10px' }}>
                          {currentPage} / {Math.ceil(events.length / itemsPerPage)}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(events.length / itemsPerPage), p + 1))}
                          disabled={currentPage === Math.ceil(events.length / itemsPerPage)}
                          className="btn btn-sm d-flex justify-content-center align-items-center"
                          style={{ borderRadius: '6px', background: 'rgba(0,156,255,0.06)', padding: '2px 6px', border: '1px solid #e2e8f0', color: currentPage === Math.ceil(events.length / itemsPerPage) ? '#cbd5e1' : '#64748b' }}>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Legend directly integrated under upcoming events */}
                <div className="glass-card p-2 rounded-xl border border-white shadow-sm"
                     style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>
                  <div className="d-flex flex-wrap gap-2 px-2 py-1 justify-content-center">
                    {[
                      { l: 'Meetings', c: '#009CFF' },
                      { l: 'Deadlines', c: '#ef4444' },
                      { l: 'Inspections', c: '#f59e0b' },
                      { l: 'Deliveries', c: '#10b981' }
                    ].map(leg => (
                      <div key={leg.l} className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill" style={{ background: 'rgba(248,251,255,1)', border: '1px solid #f1f5f9' }}>
                        <div className="rounded-circle" style={{ width: 6, height: 6, background: leg.c }} />
                        <span className="text-muted fw-bold text-uppercase" style={{ fontSize: '8px', letterSpacing: '0.5px' }}>{leg.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadEvents}
        editingEvent={editingEvent}
      />

      <style>{`
        .calendar-day-box:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .event-card:hover {
          background: rgba(0,156,255,0.03) !important;
          border-color: rgba(0,156,255,0.15) !important;
        }
        .hover-opacity-100 { opacity: 0; }
        .event-card:hover .hover-opacity-100 { opacity: 1; }
        .rounded-xl { border-radius: 12px !important; }
      `}</style>
    </div>
  );
}
