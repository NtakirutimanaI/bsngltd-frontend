import { useState } from "react";
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
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const events: Event[] = [
    {
      id: "1",
      title: "Project Kickoff Meeting",
      type: "meeting",
      date: "2024-02-15",
      time: "10:00 AM",
      location: "BSNG Head Office",
      attendees: ["Jean Baptiste", "Marie Claire", "Client Team"],
      project: "Kigali Heights Tower",
      description: "Initial project planning and requirements gathering",
    },
    {
      id: "2",
      title: "Site Inspection",
      type: "inspection",
      date: "2024-02-18",
      time: "2:00 PM",
      location: "Green Valley, Musanze",
      attendees: ["Patrick Nkunda", "Engineering Team"],
      project: "Green Valley Estates",
      description: "Monthly progress inspection and quality check",
    },
    {
      id: "3",
      title: "Material Delivery",
      type: "delivery",
      date: "2024-02-20",
      time: "8:00 AM",
      location: "City Center Complex Site",
      project: "City Center Complex",
      description: "Steel beams and cement delivery",
    },
    {
      id: "4",
      title: "Payment Deadline",
      type: "deadline",
      date: "2024-02-25",
      time: "5:00 PM",
      project: "Nyarutarama Villas",
      description: "Contractor payment due",
    },
    {
      id: "5",
      title: "Client Presentation",
      type: "meeting",
      date: "2024-02-22",
      time: "11:00 AM",
      location: "Client Office",
      attendees: ["Marie Claire", "Design Team"],
      project: "Rubavu Beach Resort",
      description: "Present updated architectural designs",
    },
  ];

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
        <button className="btn px-3 py-1 text-white border-0 shadow d-flex align-items-center gap-1" style={{
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
                  .map((event, index) => (
                    <ScrollReveal
                      key={event.id}
                      delay={0.3 + index * 0.1}
                      className="p-2 border border-secondary-subtle rounded hover:border-warning transition-all cursor-pointer small"
                    >
                      <div className="d-flex align-items-start gap-2">
                        <div className="fs-6">{getTypeIcon(event.type)}</div>
                        <div className="flex-fill">
                          <h4 className="fw-medium text-dark mb-1" style={{ fontSize: '12px' }}>
                            {event.title}
                          </h4>
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
                    </ScrollReveal>
                  ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

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
