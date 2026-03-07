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
  Banknote,
  Shield,
  CalendarCheck,
  Globe,
  Eye
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
  const [unreadContactMessages, setUnreadContactMessages] = useState(0);

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

  // Define Access Control List
  const allNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ['all'] },
    { name: "Portfolio", path: "/dashboard/portfolio", icon: Building2, roles: ['all'] },
    { name: "Workforce", path: "/dashboard/workforce", icon: Users, roles: ['super_admin', 'admin', 'manager', 'site_manager', 'hr', 'employee'] },
    { name: "Finance Hub", path: "/dashboard/finance", icon: Banknote, roles: ['super_admin', 'admin', 'manager', 'accountant', 'auditor', 'employee', 'contractor'] },
    { name: "Insights", path: "/dashboard/insights", icon: BarChart3, roles: ['super_admin', 'admin', 'auditor'] },
    { name: "Calendar", path: "/dashboard/calendar", icon: CalendarDays, roles: ['all'] },
    { name: "Attendance", path: "/dashboard/attendance", icon: CalendarCheck, roles: ['super_admin', 'admin', 'manager', 'site_manager', 'hr'] },
    { name: "Communications", path: "/dashboard/communications", icon: MessageSquare, roles: ['super_admin', 'admin', 'manager', 'hr'] },
    { name: "Content Management", path: "/dashboard/content", icon: Globe, roles: ['super_admin', 'admin'] },
    { name: "Bookings", path: "/dashboard/bookings", icon: Eye, roles: ['super_admin', 'admin', 'manager', 'site_manager'] },
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

  const unreadCount = messages.reduce((sum, m) => sum + (m.unread || 0), 0) + unreadContactMessages;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <ScrollToTopOnNavigate />
      {/* Sidebar — brand color: #16a085 teal, matching public website */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-64px)] w-56 transition-transform lg:translate-x-0 z-40 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: 'linear-gradient(180deg, #18181b 0%, #27272a 100%)',
          borderRight: '1px solid rgba(22,160,133,0.15)',
          boxShadow: sidebarOpen ? '10px 0 25px rgba(0,0,0,0.2)' : 'none'
        }}
      >
        {/* Nav label */}
        <div className="px-5 pt-6 pb-2 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500/80">Menu Explorer</span>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
          <nav className="flex flex-col gap-1.5 mt-2">
            {navigation.map((item) => {
              const isActive = window.location.pathname === item.path || (item.path === '/dashboard' && window.location.pathname === '/dashboard/');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group relative w-full ${isActive
                      ? "text-white font-bold bg-[#16a085] shadow-lg shadow-[#16a085]/20"
                      : "text-gray-100 font-semibold hover:text-white hover:bg-white/5"
                    }`
                  }
                  style={{ border: 'none', display: 'flex', textDecoration: 'none' }}
                >
                  <item.icon className="h-5 w-5 shrink-0" style={{ minWidth: '20px' }} />
                  <span className="text-[14px] tracking-tight whitespace-nowrap">{item.name}</span>
                  {item.name === "Communications" && unreadCount > 0 && (
                    <span className="ml-auto text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#e74c3c' }}>
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="px-4 pb-8 mt-auto shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 px-5 py-3.5 w-full text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-300 font-bold text-[14px] shadow-lg border-none"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-52 flex flex-col min-h-screen">
        {/* Header */}
        <header
          className="fixed top-0 right-0 left-0 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-50 px-3 md:px-6 transition-all duration-300"
          style={{ border: 'none', borderBottom: '2px solid #16a085' }}
        >
          <div className="h-full flex items-center justify-between flex-nowrap gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                id="sidebarToggle"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarOpen(!sidebarOpen);
                }}
                className="lg:hidden p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-center"
                style={{ border: 'none', background: 'transparent' }}
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="flex-shrink-0 flex items-center justify-center p-1 bg-[#16a085] rounded-md h-8 w-8">
                  <img src={logo} alt="BSNG Logo" className="h-full w-full object-contain" />
                </div>
                <span className="hidden sm:inline-block text-[15px] font-black tracking-tight text-gray-900 dark:text-white">BSNG</span>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 max-w-sm relative mx-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Find anything..."
                className="pl-10 pr-4 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-[10px] w-full focus:ring-2 focus:ring-[#16a085]/30 transition-all text-[13px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white rounded-lg h-9 w-9 flex items-center justify-center bg-[#16a085] hover:bg-emerald-700 border-none shadow-sm"
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

              <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme" style={{ border: 'none' }} className="d-none d-sm-inline-flex">
                {theme === 'dark' ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="Messages" className="relative d-none d-sm-inline-flex" style={{ border: 'none' }}>
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
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
                          onClick={() => navigate('/dashboard/communications')}
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
                    onClick={() => navigate('/dashboard/communications')}
                  >
                    View all messages
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <NotificationBell />

              <div className="d-none d-sm-block h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1 md:mx-2" />

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
        <main className="flex-1 p-3 md:p-6 mt-16 bg-gray-50/50 dark:bg-gray-950/50 overflow-x-auto max-w-full custom-scrollbar">
          <div className="w-full max-w-[1600px] mx-auto min-w-[320px]">
            <Outlet />
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
