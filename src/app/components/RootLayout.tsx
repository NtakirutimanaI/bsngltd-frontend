import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { ScrollToTopOnNavigate } from "@/app/components/ScrollToTopOnNavigate";
import {
  Menu,
  LogOut,
  Moon,
  Sun,
  MessageSquare,
  Settings,
  User,
  ArrowUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationBell } from "@/app/components/NotificationBell";
import { useAuth } from "@/app/context/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { fetchApi, getImageUrl } from "../api/client";
import { formatDistanceToNow } from 'date-fns';
import { useTracker } from "../hooks/useTracker";
import { useSite } from "../context/SiteContext";
import { 
  Building2, 
  MapPin, 
  ChevronDown, 
  PlusCircle 
} from "lucide-react";

export function RootLayout() {
  useTracker();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { selectedSite, setSelectedSite, sites } = useSite();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadContactMessages, setUnreadContactMessages] = useState(0);
  const location = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    const handleResize = () => setIsDesktop(window.innerWidth >= 992);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close sidebar on route change - this allows the user to see the link selection before the sidebar closes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      loadMessages();
      const interval = setInterval(loadMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const loadMessages = async () => {
    try {
      const data = await fetchApi<any[]>(`/messages/conversations?userId=${user?.id}`);
      setMessages(data.map(m => ({
        id: m.id,
        sender: m.name,
        content: m.lastMessage,
        time: formatDistanceToNow(new Date(m.time), { addSuffix: true }),
        unread: m.unread
      })));

      try {
        const contactData = await fetchApi<any>('/messages/contact?limit=1&status=new');
        setUnreadContactMessages(contactData.unreadCount || 0);
      } catch (err) {
        console.error("Failed to fetch contact messages count", err);
      }
    } catch (error) {
      console.error("Failed to load header messages:", error);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate(`/dashboard/projects?search=${searchTerm}`);
    }
  };

  // Role-based Navigation Logic
  const roleName = (typeof user?.role === 'object' && user.role !== null)
    ? user.role.name
    : (user?.role || 'guest');

  // Restoring EXACT sidebar links from original project with HUB-TAB routing where needed
  const allNavItems = [
    { name: "Dashboard", path: "/dashboard", iconClass: "fa-solid fa-gauge-high", roles: ['all'] },
    { name: "Sites & Projects", path: "/dashboard/sites", iconClass: "fa-solid fa-map-location-dot", roles: ['super_admin', 'admin', 'manager'] },
    { name: "Manage Users", path: "/dashboard/users", iconClass: "fa-solid fa-users-gear", roles: ['super_admin', 'admin'] },
    { name: "Site Attendance", path: "/dashboard/attendance", iconClass: "fa-solid fa-calendar-check", roles: ['super_admin', 'admin', 'manager', 'site_manager', 'hr'] },
    { name: "Finance Center", path: "/dashboard/finance", iconClass: "fa-solid fa-money-bill-transfer", roles: ['super_admin', 'admin', 'manager', 'site_manager'] },
    { name: "Communication", path: "/dashboard/communications", iconClass: "fa-solid fa-comments", roles: ['super_admin', 'admin', 'manager', 'hr', 'content_editor'] },
    { name: "Insights & Reports", path: "/dashboard/insights", iconClass: "fa-solid fa-chart-line", roles: ['super_admin', 'admin', 'manager', 'auditor'] },
    { name: "Content Management", path: "/dashboard/content", iconClass: "fa-solid fa-file-pen", roles: ['super_admin', 'admin', 'content_editor'] },
    { name: "Booking Center", path: "/dashboard/bookings", iconClass: "fa-solid fa-calendar-check", roles: ['super_admin', 'admin', 'manager', 'site_manager'] },
    { name: "Calendar", path: "/dashboard/calendar", iconClass: "fa-solid fa-calendar-days", roles: ['all'] },
    { name: "Notifications", path: "/dashboard/notifications", iconClass: "fa-solid fa-bell", roles: ['all'] },
    { name: "System Settings", path: "/dashboard/settings", iconClass: "fa-solid fa-gear", roles: ['all'] },
  ];

  const normalizedRole = roleName.toLowerCase().replace(/\s+/g, '_');
  const isAdminOrManager = ['super_admin', 'admin', 'manager'].includes(normalizedRole);

  const navigation = allNavItems.filter(item => {
    if (item.roles.includes('all')) return true;
    if (normalizedRole === 'super_admin') return true;
    return item.roles.includes(normalizedRole);
  }).map((item, idx) => {
    // Generate distinct vibrant colors for a Flaticon look
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-purple-100 text-purple-600',
      'bg-green-100 text-green-600',
      'bg-orange-100 text-orange-600',
      'bg-pink-100 text-pink-600',
      'bg-cyan-100 text-cyan-600',
      'bg-indigo-100 text-indigo-600',
      'bg-rose-100 text-rose-600',
      'bg-amber-100 text-amber-600',
      'bg-emerald-100 text-emerald-600',
      'bg-violet-100 text-violet-600',
      'bg-sky-100 text-sky-600'
    ];
    return { ...item, colorClass: colors[idx % colors.length] };
  });

  const unreadCount = messages.reduce((sum, m) => sum + (m.unread || 0), 0) + unreadContactMessages;

  return (
    <div className="container-fluid position-relative d-flex p-0">
      <ScrollToTopOnNavigate />

      {/* Sidebar Start */}
      <div className={`sidebar pe-4 pb-3 ${sidebarOpen ? "open" : ""}`}>
        <nav className="navbar bg-light navbar-light">
          <NavLink to="/dashboard" className="navbar-brand mx-4 mt-4 mb-3 pb-0 text-decoration-none">
            <h3 className="text-primary mb-0"><i className="fa fa-hashtag me-2"></i>BSNG</h3>
          </NavLink>

          <div className="navbar-nav w-100 flex-column" style={{ gap: '3px', paddingLeft: '12px', paddingRight: '12px' }}>
            {navigation.map((item, idx) => {
              const isNotifications = item.name === "Notifications";
              const subtitleMap: Record<string, string> = {
                "Dashboard": "Overview",
                "Sites & Projects": "Site manager",
                "Manage Users": "User control",
                "Site Attendance": "Attendance tracker",
                "Finance Center": "Payments & budget",
                "Communication": "Messages & inbox",
                "Insights & Reports": "Analytics",
                "Content Management": "CMS & media",
                "Administration Console": "Admin hub",
                "Booking Center": "Reservations",
                "Calendar": "Schedule",
                "Notifications": "Alerts",
                "System Settings": "Configuration",
              };
              const subtitle = subtitleMap[item.name] || "";

              // Deterministic icon bg + text colors — no Tailwind needed
              const iconPalette = [
                { bg: '#EFF6FF', color: '#2563EB' }, // blue
                { bg: '#F5F3FF', color: '#7C3AED' }, // purple
                { bg: '#F0FDF4', color: '#16A34A' }, // green
                { bg: '#FFF7ED', color: '#EA580C' }, // orange
                { bg: '#FFF0F6', color: '#DB2777' }, // pink
                { bg: '#ECFEFF', color: '#0891B2' }, // cyan
                { bg: '#EEF2FF', color: '#4F46E5' }, // indigo
                { bg: '#FFF1F2', color: '#E11D48' }, // rose
                { bg: '#FFFBEB', color: '#D97706' }, // amber
                { bg: '#ECFDF5', color: '#059669' }, // emerald
                { bg: '#F5F3FF', color: '#6D28D9' }, // violet
                { bg: '#F0F9FF', color: '#0284C7' }, // sky
              ];
              const palette = iconPalette[idx % iconPalette.length];

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  className="nav-link text-decoration-none"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    padding: '7px 8px',         /* identical on every row — active or not */
                    borderRadius: '12px',
                    border: '1px solid',        /* always 1px border — color changes, size never does */
                    borderColor: isActive ? '#009CFF' : 'transparent',
                    background: isActive ? '#009CFF' : '#ffffff',
                    transition: 'background 0.2s, border-color 0.2s',
                    minHeight: '50px',
                    boxSizing: 'border-box',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {/* Icon box — forced to 6px from left edge on every row */}
                      <div style={{
                        marginLeft: '6px',
                        width: '36px',
                        height: '36px',
                        minWidth: '36px',
                        maxWidth: '36px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isActive ? 'rgba(255,255,255,0.20)' : palette.bg,
                        flexShrink: 0,
                      }}>
                        <i
                          className={item.iconClass}
                          style={{
                            fontSize: '14px',
                            width: '14px',
                            textAlign: 'center',
                            color: isActive ? '#ffffff' : palette.color,
                          }}
                        />
                      </div>

                      {/* Text block — always starts 10px after icon box */}
                      <div style={{
                        marginLeft: '10px',
                        flexGrow: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          lineHeight: '1.3',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: isActive ? '#ffffff' : '#111827',
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          lineHeight: '1.2',
                          color: isActive ? 'rgba(255,255,255,0.70)' : '#9CA3AF',
                          whiteSpace: 'nowrap',
                        }}>
                          {subtitle}
                        </div>
                      </div>

                      {/* Badge — only for Notifications */}
                      {isNotifications && unreadCount > 0 && (
                        <span style={{
                          marginLeft: '6px',
                          flexShrink: 0,
                          fontSize: '9px',
                          fontWeight: 800,
                          minWidth: '18px',
                          height: '18px',
                          padding: '0 5px',
                          borderRadius: '9999px',
                          background: isActive ? 'rgba(255,255,255,0.30)' : '#EF4444',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
      {/* Sidebar End */}

      {/* Content Start */}
      <div className={`content ${sidebarOpen ? "open" : ""}`}>
        {/* Navbar Start */}
        <nav className="navbar navbar-expand bg-light navbar-light px-4 py-0 shadow-sm" style={{ height: '64px', position: 'fixed', top: 0, right: 0, left: isDesktop ? (sidebarOpen ? '0px' : '250px') : '0px', zIndex: 1020, transition: 'left 0.5s' }}>
          <NavLink to="/" className="navbar-brand d-flex d-lg-none me-4">
            <h2 className="text-primary mb-0"><i className="fa fa-hashtag"></i></h2>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggler flex-shrink-0 border-0 bg-transparent"
          >
            <Menu className="text-primary" />
          </button>
          <form className="d-none d-md-flex ms-4">
            <Input
              type="search"
              placeholder="Search..."
              className="form-control border-0 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              style={{ width: '200px' }}
            />
          </form>

          {/* Site Switcher */}
          {!location.pathname.includes('/dashboard/content') && (
            <div className="ms-4 d-none d-lg-block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="d-flex align-items-center gap-2 border-0 bg-white shadow-sm rounded-xl px-4 py-2 hover:bg-gray-50 transition-all border border-gray-100">
                    <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-lg d-flex align-items-center justify-content-center">
                      <Building2 size={16} />
                    </div>
                    <div className="text-start">
                      <div className="text-xs text-muted fw-bold uppercase px-1" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Current Site</div>
                      <div className="fw-bold text-dark px-1 truncate" style={{ maxWidth: '140px', fontSize: '13px' }}>
                        {selectedSite ? selectedSite.name : "Select a Site"}
                      </div>
                    </div>
                    <ChevronDown size={14} className="text-muted ms-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 border-0 shadow-lg rounded-xl p-2 bg-white">
                  <DropdownMenuLabel className="small fw-bold text-muted px-3 py-2 uppercase tracking-wider">Switch Working Site</DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  <div className="max-h-60 overflow-auto py-1">
                    {sites.length === 0 ? (
                      <div className="p-4 text-center">
                         <p className="small text-muted mb-2">No sites available</p>
                         <Button size="sm" variant="link" onClick={() => navigate('/dashboard/sites')} className="fw-bold p-0">Create First Site</Button>
                      </div>
                    ) : (
                      sites.map(site => (
                        <DropdownMenuItem 
                          key={site.id} 
                          onClick={() => setSelectedSite(site)}
                          className={`d-flex align-items-center gap-3 p-3 rounded-lg mb-1 cursor-pointer transition-all ${selectedSite?.id === site.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                        >
                          <MapPin size={16} className={selectedSite?.id === site.id ? 'text-blue-600' : 'text-gray-400'} />
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="fw-bold small truncate">{site.name}</div>
                            <div className="smaller text-muted truncate">{site.location}</div>
                          </div>
                          {selectedSite?.id === site.id && <div className="h-2 w-2 bg-blue-600 rounded-circle shadow-sm" />}
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={() => navigate('/dashboard/sites')} className="d-flex align-items-center gap-2 p-3 text-primary fw-bold cursor-pointer hover:bg-blue-50 rounded-lg">
                    <PlusCircle size={16} /> Manage All Sites
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <div className="navbar-nav align-items-center ms-auto gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-circle">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {isAdminOrManager && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="nav-link position-relative rounded-circle border-0 bg-transparent">
                    <MessageSquare className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-1 end-1 p-1 bg-danger border border-white rounded-circle"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 border-0 bg-light shadow-sm">
                  <DropdownMenuLabel className="fw-bold px-3 py-2">Messages</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-64 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No messages</div>
                    ) : (
                      messages.map((msg) => (
                        <DropdownMenuItem
                          key={msg.id}
                          className="d-flex flex-column align-items-start p-3 gap-1 cursor-pointer"
                          onClick={() => navigate("/dashboard/communications")}
                        >
                          <div className="d-flex justify-content-between w-100 fw-bold small">
                            <span>{msg.sender}</span>
                            <span className="text-muted fw-normal smaller">{msg.time}</span>
                          </div>
                          <span className="small text-muted line-clamp-1">{msg.content}</span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="justify-center text-primary fw-bold cursor-pointer text-center py-2"
                    onClick={() => navigate("/dashboard/communications")}
                  >
                    View All Messages
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <NotificationBell />

            <div className="h-8 w-px bg-gray-200 mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="nav-link dropdown-toggle d-flex align-items-center gap-2 border-0 bg-transparent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar ? getImageUrl(user.avatar) : ""} style={{ objectFit: "cover" }} />
                    <AvatarFallback className="bg-primary text-white font-bold">
                      {user?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="d-none d-lg-inline small fw-bold">{user?.fullName || user?.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-0 bg-light shadow-sm">
                <DropdownMenuLabel className="fw-bold">My Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings?tab=profile")} className="cursor-pointer">
                  <User className="me-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings?tab=company")} className="cursor-pointer">
                  <Settings className="me-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-danger cursor-pointer font-bold">
                  <LogOut className="me-2 h-4 w-4" /> Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
        {/* Navbar End */}

        {/* Navbar Spacer — prevents content from hiding behind fixed navbar */}
        <div style={{ height: '64px', flexShrink: 0 }} />

        {/* Dash Page Content */}
        <div className="container-fluid pt-4 px-4 min-vh-100">
           <Outlet />
        </div>

        {/* Footer */}
        <div className="container-fluid pt-4 px-4 mt-auto">
          <div className="bg-light rounded-top p-4 shadow-sm">
            <div className="row g-2">
              <div className="col-12 col-sm-6 text-center text-sm-start text-muted smaller">
                &copy; {new Date().getFullYear()} <NavLink to="/" className="text-primary fw-bold text-decoration-none">BSNG Construction</NavLink>, All Right Reserved.
              </div>
              <div className="col-12 col-sm-6 text-center text-sm-end text-muted smaller">
                Designed By <a href="https://bsng.org" className="text-primary text-decoration-none fw-bold">MIS</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content End */}

      {/* Back to Top */}
      {showBackToTop && (
        <button
          className="btn btn-primary btn-lg-square rounded-circle shadow"
          onClick={scrollToTop}
          style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 1050, width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
