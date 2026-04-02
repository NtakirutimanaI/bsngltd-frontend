import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { ScrollToTopOnNavigate } from "@/app/components/ScrollToTopOnNavigate";
import {
  Building2,
  LayoutDashboard,
  Users,
  Menu,
  CalendarDays,
  LogOut,
  Moon,
  Sun,
  MessageSquare,
  Settings,
  User,
  Banknote,
  Shield,
  Eye,
  TrendingUp,
  Bell,
  Globe,
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

export function RootLayout() {
  useTracker();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      navigate(`/dashboard/portfolio?search=${searchTerm}`);
    }
  };

  // Role-based Navigation Logic
  const roleName = (typeof user?.role === 'object' && user.role !== null)
    ? user.role.name
    : (user?.role || 'guest');

  // Restoring EXACT sidebar links from original project with HUB-TAB routing where needed
  const allNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ['all'] },
    { name: "Portfolio Hub", path: "/dashboard/portfolio", icon: Building2, roles: ['all'] },
    { name: "Workforce Center", path: "/dashboard/workforce", icon: Users, roles: ['super_admin', 'admin', 'manager', 'site_manager', 'hr', 'employee'] },
    { name: "Finance Center", path: "/dashboard/finance", icon: Banknote, roles: ['super_admin', 'admin', 'manager', 'site_manager'] },
    { name: "Communication Hub", path: "/dashboard/communications", icon: MessageSquare, roles: ['super_admin', 'admin', 'manager', 'hr', 'content_editor'] },
    { name: "Insights & Reports", path: "/dashboard/insights", icon: TrendingUp, roles: ['super_admin', 'admin', 'manager', 'auditor'] },
    { name: "Content Management", path: "/dashboard/content", icon: Globe, roles: ['super_admin', 'admin', 'content_editor'] },
    { name: "Administration Console", path: "/dashboard/admin", icon: Shield, roles: ['super_admin', 'admin', 'manager', 'site_manager', 'hr'] },
    { name: "Booking Center", path: "/dashboard/bookings", icon: Eye, roles: ['super_admin', 'admin', 'manager', 'site_manager'] },
    { name: "Calendar", path: "/dashboard/calendar", icon: CalendarDays, roles: ['all'] },
    { name: "Notifications", path: "/dashboard/notifications", icon: Bell, roles: ['all'] },
    { name: "System Settings", path: "/dashboard/settings", icon: Settings, roles: ['all'] },
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
          <NavLink to="/dashboard" className="navbar-brand mx-4 mt-4 mb-0 pb-0 text-decoration-none">
            <h3 className="text-primary mb-0"><i className="fa fa-hashtag me-2"></i>BSNG</h3>
          </NavLink>

          <div className="navbar-nav w-100 flex-column pt-0" style={{ marginTop: '-10px' }}>
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `nav-item nav-link d-flex align-items-center mb-1 py-2 px-4 transition-all ${isActive ? "active bg-white shadow-sm" : ""}`
                }
                style={{ height: '48px' }}
              >
                <div className={`d-flex align-items-center justify-content-center rounded-lg me-3 ${item.colorClass}`} style={{ width: '34px', height: '34px', minWidth: '34px' }}>
                   <item.icon size={18} strokeWidth={2.5} />
                </div>
                <span className="fw-bold text-dark" style={{ fontSize: '14px', lineHeight: '1' }}>{item.name}</span>
                {item.name === "Notifications" && unreadCount > 0 && (
                  <span className="ms-auto badge bg-danger rounded-pill d-flex align-items-center justify-content-center" style={{ fontSize: '10px', width: '20px', height: '20px' }}>{unreadCount}</span>
                )}
              </NavLink>
            ))}
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
              className="form-control border-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
            />
          </form>
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
