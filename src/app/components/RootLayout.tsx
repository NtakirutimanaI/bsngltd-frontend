import { Outlet, NavLink, useNavigate } from "react-router";
import { ScrollToTopOnNavigate } from "@/app/components/ScrollToTopOnNavigate";
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  Menu,
  BarChart3,
  CalendarDays,
  LogOut,
  Newspaper,
  Search,
  Plus,
  Moon,
  Sun,
  MessageSquare,
  Settings,
  User,
  UserCog,
  Banknote,
  Shield,
  CalendarCheck,
  Globe
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
import { fetchApi } from "../api/client";
import { formatDistanceToNow } from 'date-fns';
import logo from '@/assets/logo.png';
import { useTracker } from "../hooks/useTracker";

export function RootLayout() {
  useTracker();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

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

  // Define Access Control List
  const allNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ['all'] },
    { name: "Portfolio", path: "/dashboard/portfolio", icon: Building2, roles: ['all'] },
    { name: "Workforce", path: "/dashboard/workforce", icon: Users, roles: ['super_admin', 'admin', 'manager', 'site_manager', 'hr', 'employee'] },
    { name: "Finance Hub", path: "/dashboard/finance", icon: Banknote, roles: ['super_admin', 'admin', 'manager', 'accountant', 'auditor', 'employee', 'contractor'] },
    { name: "Insights", path: "/dashboard/insights", icon: BarChart3, roles: ['super_admin', 'admin', 'manager', 'site_manager', 'auditor'] },
    { name: "Calendar", path: "/dashboard/calendar", icon: CalendarDays, roles: ['all'] },
    { name: "Attendance", path: "/dashboard/attendance", icon: CalendarCheck, roles: ['super_admin', 'admin', 'manager', 'site_manager', 'hr'] },
    { name: "Content Management", path: "/dashboard/content", icon: Globe, roles: ['super_admin', 'admin'] },
    { name: "Administration", path: "/dashboard/admin", icon: Shield, roles: ['super_admin', 'admin', 'manager', 'hr'] },
  ];

  const navigation = allNavItems.filter(item => {
    if (item.roles.includes('all')) return true;
    return item.roles.includes(roleName.toLowerCase().replace(' ', '_'));
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = messages.reduce((sum, m) => sum + (m.unread || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <ScrollToTopOnNavigate />
      {/* Sidebar — brand color: #16a085 teal, matching public website */}
      <aside
        className={`fixed top-0 left-0 h-screen w-52 transition-transform lg:translate-x-0 z-50 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: 'linear-gradient(180deg, #1c1917 0%, #292524 40%, #1c1917 100%)', border: 'none' }}
      >
        {/* Logo / Brand */}
        <div className="p-5 shrink-0" style={{ border: 'none', borderBottom: '2px solid rgba(22,160,133,0.35)' }}>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center p-1.5 overflow-hidden" style={{ background: '#16a085' }}>
              <img src={logo} alt="BSNG Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-lg font-bold text-white leading-tight tracking-wide">BSNG</div>
              <div className="text-[11px] font-semibold leading-tight" style={{ color: '#16a085' }}>CONSTRUCTION CO.</div>
              <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">Building Strong Generations</div>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <div className="px-5 pt-4 pb-1 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Navigation</span>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group ${isActive
                    ? "text-[#16a085] font-bold"
                    : "text-gray-400 hover:text-white"
                  }`
                }
                style={{ border: 'none', background: 'transparent' }}
                onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.color = ''; }}
              >
                <item.icon className={`h-4.5 w-4.5 shrink-0 ${window.location.pathname === item.path ? 'text-[#16a085]' : ''}`} style={{ width: '18px', height: '18px' }} />
                <span className="font-medium text-[13px]">{item.name}</span>
                {item.name === "Messages" && unreadCount > 0 && (
                  <span className="ml-auto text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#e74c3c' }}>
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="px-3 pb-4 shrink-0" style={{ borderTop: '2px solid rgba(22,160,133,0.25)', paddingTop: '12px' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 w-full text-gray-400 hover:text-red-400 rounded-lg transition-all duration-200 group"
            style={{ border: 'none', background: 'transparent' }}
          >
            <LogOut style={{ width: '18px', height: '18px' }} />
            <span className="font-medium text-[13px]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-52 flex flex-col min-h-screen">
        {/* Header */}
        <header
          className="fixed top-0 right-0 left-0 lg:left-52 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-40 px-6 transition-all duration-300"
          style={{ border: 'none', borderBottom: '2px solid #16a085' }}
        >
          <div className="h-full flex items-center justify-between gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              style={{ border: 'none' }}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="hidden md:flex flex-1 max-w-md relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search projects by code or name..."
                className="pl-12 pr-4 py-2 bg-transparent rounded-none w-full focus:ring-0 transition-colors"
                style={{ border: 'none', borderBottom: '2px solid #16a085' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white rounded-full h-8 w-8 flex items-center justify-center"
                    style={{ background: '#16a085', border: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#0f766e')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#16a085')}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" style={{ border: 'none', borderBottom: '2px solid #16a085', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                  <DropdownMenuLabel>Add New</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard/portfolio')}>
                    <Building2 className="mr-2 h-4 w-4" style={{ color: '#16a085' }} /> Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/portfolio')}>
                    <Home className="mr-2 h-4 w-4" style={{ color: '#16a085' }} /> Property
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/workforce')}>
                    <Users className="mr-2 h-4 w-4" style={{ color: '#16a085' }} /> Employee
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/admin')}>
                    <Newspaper className="mr-2 h-4 w-4" style={{ color: '#16a085' }} /> Update
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme" style={{ border: 'none' }}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="Messages" className="relative" style={{ border: 'none' }}>
                    <MessageSquare className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white dark:border-gray-900" style={{ background: '#e74c3c' }} />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80" style={{ border: 'none', borderBottom: '2px solid #16a085', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                  <DropdownMenuLabel>Messages</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No new messages</div>
                    ) : (
                      messages.map((msg) => (
                        <DropdownMenuItem
                          key={msg.id}
                          className="cursor-pointer flex flex-col items-start gap-1 p-3"
                          style={{ border: 'none' }}
                          onClick={() => navigate('/dashboard/admin')}
                        >
                          <div className="flex justify-between w-full">
                            <span className="font-medium text-sm">{msg.sender}</span>
                            <span className="text-xs text-gray-400">{msg.time}</span>
                          </div>
                          <span className="text-xs text-gray-500 line-clamp-1">{msg.content}</span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer justify-center font-semibold"
                    style={{ color: '#16a085', border: 'none', borderTop: '2px solid #f0fdfa' }}
                    onClick={() => navigate('/dashboard/admin')}
                  >
                    View all messages
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <NotificationBell />

              <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-2" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" style={{ border: 'none' }}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="font-bold text-white" style={{ background: '#16a085' }}>
                        {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" style={{ border: 'none', borderBottom: '2px solid #16a085', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    {user?.fullName || user?.name}
                    <div className="text-xs font-normal opacity-70 capitalize">{roleName}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard/admin')} style={{ border: 'none' }}>
                    <User className="mr-2 h-4 w-4" style={{ color: '#16a085' }} /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/admin')} style={{ border: 'none' }}>
                    <Settings className="mr-2 h-4 w-4" style={{ color: '#16a085' }} /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600" style={{ border: 'none' }}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-2 md:p-4 overflow-y-auto mt-16">
          <div className="w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
