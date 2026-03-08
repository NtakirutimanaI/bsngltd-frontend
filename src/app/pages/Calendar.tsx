import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Building2,
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from "../api/client";
import { AddEventModal } from "../components/AddEventModal";
import { Trash2, Globe, Lock } from "lucide-react";

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

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<Event[]>(`/events?t=${Date.now()}`);
      setEvents(data || []);
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => event.date === dateStr);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500";
      case "deadline":
        return "bg-red-500";
      case "inspection":
        return "bg-emerald-500";
      case "delivery":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return "👥";
      case "deadline":
        return "⏰";
      case "inspection":
        return "🔍";
      case "delivery":
        return "🚚";
      default:
        return "📅";
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 pt-1 pb-2">
      {/* Header */}
      <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2 px-2 px-md-4 pt-1">
        <div>
          <h1 className="h5 fw-bold text-dark mb-0">Schedule & Calendar</h1>
          <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Manage project timelines and important dates</p>
        </div>
        <button
          onClick={handleAdd}
          className="btn px-3 py-1 text-white border-0 shadow d-flex align-items-center gap-1" style={{
            background: '#16a085', border: 'none', color: '#fff', fontWeight: 600, fontSize: '12px', height: '30px'
          }}>
          <Plus size={13} /> Add Event
        </button>
      </ScrollReveal>

      <div className="row g-2 mx-2 mx-md-4">
        {/* Calendar */}
        <ScrollReveal delay={0.1} className="col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3">
              {/* Calendar Header */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h6 fw-semibold text-dark mb-0" style={{ fontSize: '14px' }}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={previousMonth}
                    className="btn btn-sm btn-light p-1" style={{ borderRadius: '6px' }}
                  >
                    <ChevronLeft size={12} className="text-muted" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="btn btn-sm btn-light px-2 py-1" style={{ fontSize: '11px', borderRadius: '6px' }}
                  >
                    Today
                  </button>
                  <button
                    onClick={nextMonth}
                    className="btn btn-sm btn-light p-1" style={{ borderRadius: '6px' }}
                  >
                    <ChevronRight size={12} className="text-muted" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="row g-1">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="col text-center text-muted fw-semibold py-1" style={{ fontSize: '10px' }}
                  >
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
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
                    <div
                      key={day}
                      className={`col border border-secondary-subtle rounded p-1 cursor-pointer hover:bg-light ${isToday ? "bg-warning-subtle border-warning" : ""
                        }`}
                      style={{ minHeight: '60px' }}
                    >
                      <div
                        className={`small fw-medium mb-1 ${isToday ? "text-warning" : "text-dark"
                          }`}
                        style={{ fontSize: '11px' }}
                      >
                        {day}
                      </div>
                      <div className="d-flex flex-column gap-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`${getTypeColor(
                              event.type
                            )} rounded`}
                            style={{ height: '2px' }}
                          />
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-muted" style={{ fontSize: '8px' }}>+{dayEvents.length - 2}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Upcoming Events */}
        <ScrollReveal delay={0.2} className="col-lg-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-body p-3">
              <h3 className="h6 fw-semibold text-dark mb-3" style={{ fontSize: '14px' }}>Upcoming Events</h3>
              <div className="d-flex flex-column gap-2">
                {events
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEdit(event)}
                      className="p-2 border border-secondary-subtle rounded hover:border-warning transition-all cursor-pointer small position-relative group"
                    >
                      <div className="position-absolute top-2 end-2 d-none group-hover:flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                          className="btn btn-xs btn-light p-1 text-danger border shadow-sm"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                      <div className="d-flex align-items-start gap-2">
                        <div className="fs-6">{getTypeIcon(event.type)}</div>
                        <div className="flex-fill">
                          <div className="d-flex align-items-center justify-content-between">
                            <h4 className="fw-medium text-dark mb-1" style={{ fontSize: '12px' }}>
                              {event.title}
                            </h4>
                            {event.isPublished ? (
                              <Globe size={10} className="text-emerald-500" />
                            ) : (
                              <Lock size={10} className="text-gray-400" />
                            )}
                          </div>
                          <div className="d-flex flex-column gap-1">
                            <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '10px' }}>
                              <CalendarIcon size={10} />
                              <span>{event.date}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '10px' }}>
                              <Clock size={10} />
                              <span>{event.time}</span>
                            </div>
                            {event.location && (
                              <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '10px' }}>
                                <MapPin size={10} />
                                <span className="text-truncate">{event.location}</span>
                              </div>
                            )}
                            {event.project && (
                              <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '10px' }}>
                                <Building2 size={10} />
                                <span className="text-truncate">{event.project}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {events.length === 0 && !loading && (
                  <div className="text-center py-5 text-muted small">
                    <CalendarIcon size={24} className="mb-2 opacity-20" />
                    <div>No upcoming events found</div>
                  </div>
                )}
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary opacity-50" role="status"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadEvents}
        editingEvent={editingEvent}
      />

      {/* Event Legend */}
      <ScrollReveal delay={0.3} className="mx-2 mx-md-4">
        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
          <div className="card-body p-3">
            <h3 className="h6 fw-semibold text-dark mb-3" style={{ fontSize: '14px' }}>Event Types</h3>
            <div className="row g-2">
              <div className="col-6 col-md-3 d-flex align-items-center gap-2">
                <div className="bg-primary rounded" style={{ width: '12px', height: '12px' }}></div>
                <span className="text-muted" style={{ fontSize: '11px' }}>Meetings</span>
              </div>
              <div className="col-6 col-md-3 d-flex align-items-center gap-2">
                <div className="bg-danger rounded" style={{ width: '12px', height: '12px' }}></div>
                <span className="text-muted" style={{ fontSize: '11px' }}>Deadlines</span>
              </div>
              <div className="col-6 col-md-3 d-flex align-items-center gap-2">
                <div className="bg-warning rounded" style={{ width: '12px', height: '12px' }}></div>
                <span className="text-muted" style={{ fontSize: '11px' }}>Inspections</span>
              </div>
              <div className="col-6 col-md-3 d-flex align-items-center gap-2">
                <div className="bg-success rounded" style={{ width: '12px', height: '12px' }}></div>
                <span className="text-muted" style={{ fontSize: '11px' }}>Deliveries</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
