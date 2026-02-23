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
        return "bg-orange-500";
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
    <div className="space-y-6">
      {/* Header */}
      <ScrollReveal className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule & Calendar</h1>
          <p className="text-gray-600 mt-1">Manage project timelines and important dates</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          <Plus className="h-5 w-5" />
          Add Event
        </button>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <ScrollReveal delay={0.1} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
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
                  className={`aspect-square border border-gray-200 rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors ${isToday ? "bg-orange-50 border-orange-300" : ""
                    }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${isToday ? "text-orange-600" : "text-gray-900"
                      }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`${getTypeColor(
                          event.type
                        )} h-1 rounded-full`}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-600">+{dayEvents.length - 2}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Upcoming Events */}
        <ScrollReveal delay={0.2} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map((event, index) => (
                <ScrollReveal
                  key={event.id}
                  delay={0.3 + index * 0.1}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getTypeIcon(event.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {event.title}
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                        {event.project && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{event.project}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
          </div>
        </ScrollReveal>
      </div>

      {/* Event Legend */}
      <ScrollReveal delay={0.3} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Meetings</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-700">Deadlines</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-700">Inspections</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-700">Deliveries</span>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
