import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import "../../styles/dashmin-theme.css";
import "../../styles/dashboard-premium.css";
import "../../dashboard.css";
import { ScrollToTopOnNavigate } from "@/app/components/ScrollToTopOnNavigate";
import {
  Menu,
  LogOut,
  Moon,
  Sun,
  MessageSquare,
  Settings,
  User,
  ArrowUp,
  X
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
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
    { name: "Rent/Buy", path: "/dashboard/rent-buy", iconClass: "fa-solid fa-house-chimney", roles: ['all'] },
    { name: "Chats", path: "/dashboard/communications?tab=internal", iconClass: "fa-solid fa-comments", roles: ['super_admin', 'admin', 'manager', 'hr', 'content_editor', 'client'] },
    { name: "Notifications", path: "/dashboard/communications?tab=notifications", iconClass: "fa-solid fa-bell", roles: ['all'] },
    { name: "Booking History", path: "/dashboard/bookings", iconClass: "fa-solid fa-calendar-check", roles: ['super_admin', 'admin', 'manager', 'site_manager', 'client'] },
    { name: "Calendar", path: "/dashboard/calendar", iconClass: "fa-solid fa-calendar-days", roles: ['super_admin', 'admin', 'manager', 'site_manager', 'hr', 'content_editor', 'contractor', 'employee'] },
    { name: "Content Management", path: "/dashboard/content", iconClass: "fa-solid fa-file-pen", roles: ['super_admin', 'admin', 'content_editor'] },
    { name: "Insights & Reports", path: "/dashboard/insights", iconClass: "fa-solid fa-chart-line", roles: ['super_admin', 'admin', 'manager', 'auditor'] },
    { name: "Profile Settings", path: "/dashboard/settings", iconClass: "fa-solid fa-gear", roles: ['all'] },
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
          <div className="d-flex align-items-center justify-content-between w-100 px-4 mt-4 mb-0 pb-0">
            <NavLink to="/dashboard" className="navbar-brand mb-0 pb-0 text-decoration-none">
              <h3 className="text-primary mb-0"><i className="fa fa-hashtag me-2"></i>BSNG</h3>
            </NavLink>
            <button
              onClick={() => setSidebarOpen(false)}
              className="btn btn-sm d-lg-none border-0 p-1 rounded-circle bg-gray-100 hover:bg-gray-200 transition-all d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
              aria-label="Close sidebar"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>

          <div className="navbar-nav w-100 flex-column" style={{ gap: '3px', paddingLeft: '5px', paddingRight: '12px' }}>
            {navigation.map((item, idx) => {
              const isNotifications = item.name === "Notifications";
              const subtitleMap: Record<string, string> = {
                "Dashboard": "Overview",
                "Sites & Projects": "Site manager",
                "Manage Users": "User control",
                "Site Attendance": "Attendance tracker",
                "Rent/Buy": "Property holdings",
                "Chats": "Team collaboration",
                "Notifications": "System alerts",
                "Booking History": "My reservations",
                "Calendar": "Schedule",
                "Content Management": "CMS",
                "Insights & Reports": "Analytics",
                "Profile Settings": "Profile & Account",
              };
              const subtitle = subtitleMap[item.name] || "";

              const iconPalette = [
                { bg: '#EFF6FF', color: '#2563EB' }, { bg: '#F5F3FF', color: '#7C3AED' },
                { bg: '#F0FDF4', color: '#16A34A' }, { bg: '#FFF7ED', color: '#EA580C' },
                { bg: '#FFF0F6', color: '#DB2777' }, { bg: '#ECFEFF', color: '#0891B2' },
                { bg: '#EEF2FF', color: '#4F46E5' }, { bg: '#FFF1F2', color: '#E11D48' },
                { bg: '#FFFBEB', color: '#D97706' }, { bg: '#ECFDF5', color: '#059669' },
                { bg: '#F5F3FF', color: '#6D28D9' }, { bg: '#F0F9FF', color: '#0284C7' },
              ];
              const palette = iconPalette[idx % iconPalette.length];

              // CUSTOM ACTIVE LOGIC: Compare full path with current URL
              const currentFullPath = location.pathname + location.search;
              const isActuallyActive = (item.path === currentFullPath) || 
                                      (item.path === "/dashboard" && location.pathname === "/dashboard");

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className="text-decoration-none"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 6px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: isActuallyActive ? '#009CFF' : 'transparent',
                    background: isActuallyActive ? '#009CFF' : '#ffffff',
                    transition: 'background 0.2s, border-color 0.2s',
                    minHeight: '52px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    minWidth: '36px',
                    maxWidth: '36px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isActuallyActive ? 'rgba(255,255,255,0.20)' : palette.bg,
                    flexShrink: 0,
                  }}>
                    <i
                      className={`fa-fw ${item.iconClass}`}
                      style={{
                        fontSize: '15px',
                        color: isActuallyActive ? '#ffffff' : palette.color,
                      }}
                    />
                  </div>

                  <div style={{
                    marginLeft: '10px',
                    flexGrow: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: isActuallyActive ? '#ffffff' : '#111827',
                      marginBottom: '2px',
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      lineHeight: '1',
                      color: isActuallyActive ? 'rgba(255,255,255,0.75)' : '#9CA3AF',
                      whiteSpace: 'nowrap',
                    }}>
                      {subtitle}
                    </div>
                  </div>

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
                      background: isActuallyActive ? 'rgba(255,255,255,0.30)' : '#EF4444',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
      {/* Sidebar End */}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={() => setSidebarOpen(false)}
          style={{ display: 'block', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.35)', zIndex: 998 }}
        />
      )}

      {/* Content Start */}
      <div className={`content ${sidebarOpen ? "open" : ""}`}>
        {/* Navbar Start */}
        <nav className="navbar navbar-expand px-2 px-md-4 py-0 shadow-sm bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800" style={{ height: '56px', position: 'fixed', top: 0, right: 0, left: isDesktop ? (sidebarOpen ? '0px' : '250px') : '0px', zIndex: 1020, transition: 'left 0.5s' }}>
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
              className="form-control border-0 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              style={{ width: '200px' }}
            />
          </form>

          {/* Site Switcher */}
          {normalizedRole !== 'client' && 
           !location.pathname.includes('/dashboard/content') && 
           !location.pathname.includes('/dashboard/bookings') && 
           !location.pathname.includes('/dashboard/attendance') && 
           !location.pathname.includes('/dashboard/communications') && 
           !location.pathname.includes('/dashboard/calendar') && 
           !location.pathname.includes('/dashboard/settings') && (
            <div className="ms-4 d-none d-lg-block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="d-flex align-items-center gap-2 border-0 bg-white dark:bg-gray-800 shadow-sm rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700" style={{ height: '36px' }}>
                    <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded d-flex align-items-center justify-content-center flex-shrink-0">
                      <Building2 size={12} />
                    </div>
                    <div className="text-start">
                      <div className="text-xs text-muted dark:text-gray-400 fw-bold uppercase px-0" style={{ fontSize: '8px', letterSpacing: '0.4px', lineHeight: '1' }}>Current Site</div>
                      <div className="fw-bold text-dark dark:text-white px-0 truncate" style={{ maxWidth: '100px', fontSize: '11px', lineHeight: '1.2' }}>
                        {selectedSite ? selectedSite.name : "Select a Site"}
                      </div>
                    </div>
                    <ChevronDown size={11} className="text-muted ms-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 border-0 shadow-lg rounded-xl p-1.5 bg-white dark:bg-gray-800 dark:border dark:border-gray-700">
                  <DropdownMenuLabel className="small fw-bold text-muted dark:text-gray-400 px-3 py-1.5 uppercase tracking-wider" style={{ fontSize: '10px' }}>Switch Working Site</DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  <div className="max-h-60 overflow-auto py-0">
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
                          className={`d-flex align-items-center gap-2 p-2 rounded-lg mb-0.5 cursor-pointer transition-all ${selectedSite?.id === site.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                          <MapPin size={13} className={selectedSite?.id === site.id ? 'text-blue-600' : 'text-gray-400'} />
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="fw-bold truncate" style={{ fontSize: '11px' }}>{site.name}</div>
                            <div className="text-muted truncate" style={{ fontSize: '9px' }}>{site.location}</div>
                          </div>
                          {selectedSite?.id === site.id && <div className="h-1.5 w-1.5 bg-blue-600 rounded-circle shadow-sm" />}
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={() => navigate('/dashboard/sites')} className="d-flex align-items-center gap-2 p-2 text-primary fw-bold cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" style={{ fontSize: '11px' }}>
                    <PlusCircle size={14} /> Manage All Sites
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <div className="navbar-nav align-items-center ms-auto gap-1 gap-md-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-circle hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors d-none d-md-flex">
              {theme === "dark" ? <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" /> : <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />}
            </Button>

            {isAdminOrManager && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="nav-link position-relative rounded-circle border-0 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <MessageSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-1 end-1 p-1 bg-danger border border-white dark:border-gray-900 rounded-circle"></span>
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

            <div className="h-8 w-px bg-gray-200 mx-1 d-none d-md-block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="nav-link dropdown-toggle d-flex align-items-center gap-2 border-0 bg-transparent p-0">
                  <Avatar className="h-8 w-8" style={{ flexShrink: 0 }}>
                    <AvatarImage src={user?.avatar ? getImageUrl(user.avatar) : ""} style={{ objectFit: "cover" }} />
                    <AvatarFallback className="bg-primary text-white font-bold" style={{ fontSize: '12px' }}>
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
        <div style={{ height: '56px', flexShrink: 0 }} />

        {/* Dash Page Content */}
        <div className="container-fluid pt-4 px-4 min-vh-100">
           <Suspense fallback={
             <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
               <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                 <span className="visually-hidden">Loading...</span>
               </div>
             </div>
           }>
             <Outlet />
           </Suspense>
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
