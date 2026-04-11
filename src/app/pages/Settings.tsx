import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import {
  Save,
  Loader2,
  RefreshCw,
  Copy,
  ChevronRight,
  Settings as SettingsIcon,
  User,
  Building2,
  Bell,
  ShieldHalf,
  Network,
  Globe,
  Lock,
  Mail,
  Phone,
  Languages
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi, getImageUrl } from "../api/client";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

export function Settings() {
  const { user, setUser, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTabState] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    websiteStatus: "active"
  });

  // Profile State
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    language: "en",
    avatar: user?.avatar || ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTabState(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "+250 788 000 000",
        language: "en",
        avatar: user.avatar || ""
      });
    }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const settings = await fetchApi<any[]>("/settings");

      const findVal = (key: string) => {
        const s = settings.find(i => i.key === key);
        if (!s) return "";
        try {
          const parsed = JSON.parse(s.value);
          return parsed.en || s.value;
        } catch {
          return s.value;
        }
      };

      setCompanyData({
        name: findVal('footer_company_name') || findVal('home_about_title'),
        email: findVal('contact_email'),
        phone: findVal('contact_phone'),
        address: findVal('contact_address'),
        websiteStatus: findVal('website_status') || 'active'
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);
    try {
      const updatedUser = await fetchApi<any>(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          fullName: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
          avatar: profileData.avatar
        })
      });
      setUser(updatedUser);
      // Also call refreshUser to sync fresh data from backend everywhere
      await refreshUser();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (file.size > 800 * 1024) {
      toast.error("Maximum file size is 800KB");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('contentId', user.id);

      const res = await fetchApi<{ url: string }>('/content/upload-image', {
        method: 'POST',
        body: formData
      });
      setProfileData(prev => ({ ...prev, avatar: res.url }));
      toast.success("Avatar uploaded! Save changes to apply.");
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await fetchApi("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: "direct_reset", 
          password: passwordData.newPassword
        })
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updates = [
        { key: 'footer_company_name', value: companyData.name },
        { key: 'contact_email', value: companyData.email },
        { key: 'contact_phone', value: companyData.phone },
        { key: 'contact_address', value: companyData.address },
        { key: 'website_status', value: companyData.websiteStatus }
      ];

      for (const update of updates) {
        if (update.value) {
          await fetchApi(`/settings/${update.key}`, {
            method: "PUT",
            body: JSON.stringify({ value: update.value })
          });
        }
      }

      await loadSettings();
      toast.success("Company settings updated");
    } catch (error) {
      toast.error("Failed to update company settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notification preferences updated locally");
  };

  const isAdmin = (() => {
    if (!user) return false;
    const roleName = (typeof user?.role === 'object' && user.role !== null)
      ? (user.role as any).name
      : (user?.role || 'guest');
    const normalizedRole = roleName.toString().toLowerCase().replace(/\s+/g, '_');
    return ['super_admin', 'admin', 'manager', 'site_manager', 'content_editor'].includes(normalizedRole);
  })();

  const categories = [
    { id: "profile", name: "Profile Settings", icon: User, color: 'text-blue-500', description: 'Account & personal info' },
    ...(isAdmin ? [
      { id: "company", name: "Company", icon: Building2, color: 'text-indigo-500', description: 'Business & site info' },
      { id: "notifications", name: "Notifications", icon: Bell, color: 'text-emerald-500', description: 'Alerts & messaging' },
      { id: "security", name: "Security", icon: ShieldHalf, color: 'text-rose-500', description: 'Privacy & access' },
      { id: "api", name: "API & Integrations", icon: Network, color: 'text-violet-500', description: 'Endpoints & tokens' },
    ] : [])
  ];

  return (
    <div className="container-fluid py-0 min-vh-100" style={{ background: 'transparent' }}>
      <div className="row g-4 pt-2">
        {/* Category sub-sidebar */}
        <div className="col-lg-3 px-lg-4 border-end border-gray-100">
          <div className="glass-card p-2 rounded-xl mb-3 border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
            <div className="d-flex align-items-center gap-2 mb-0 pb-2 border-bottom border-gray-100">
              <div className="bg-primary rounded-lg p-2 text-white shadow-sm d-flex align-items-center justify-content-center">
                <SettingsIcon size={16} />
              </div>
              <div className="overflow-hidden">
                <h2 className="fw-bold mb-0 text-truncate" style={{ fontSize: '13px' }}>Settings Center</h2>
                <p className="smaller text-muted mb-0" style={{ fontSize: '11px' }}>Manage preferences</p>
              </div>
            </div>
          </div>

          <div className="directory-scroll-container">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                onClick={() => setActiveTab(cat.id)}
                className={`site-row p-1 mb-1.5 rounded-xl transition-all border cursor-pointer ${activeTab === cat.id ? 'active-site shadow-md' : 'bg-white text-dark border-gray-100 hover:bg-light'}`}
                style={activeTab === cat.id ? { 
                  background: '#009CFF',
                  borderColor: '#009CFF',
                  color: 'white'
                } : {}}
              >
                <div className="px-3 py-2 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3 overflow-hidden flex-grow-1">
                    <div className={`rounded-lg p-2 d-flex align-items-center justify-content-center ${activeTab === cat.id ? 'bg-white/20' : 'bg-blue-50'}`} style={{ width: '34px', height: '34px' }}>
                      <cat.icon size={16} className={activeTab === cat.id ? 'text-white' : cat.color} />
                    </div>
                    <div className="overflow-hidden text-start">
                      <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '11px' }}>{cat.name}</h6>
                      <div className={`smaller ${activeTab === cat.id ? 'text-white/80' : 'text-muted'}`} style={{ fontSize: '9px' }}>{cat.description}</div>
                    </div>
                  </div>
                  {activeTab === cat.id && <ChevronRight size={14} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="col-lg-9 px-lg-4">
          <div className="admin-content-panel h-100 px-0 mt-2">
            {activeTab === "profile" && (
              <ScrollReveal delay={0.1} className="fade-in-up">
                <div className="glass-card p-4 rounded-xl border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.8)' }}>
                  <h3 className="fw-bold text-dark mb-4" style={{ fontSize: '14px' }}>Profile Information</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="d-flex align-items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-circle shadow-sm border-2 border-white overflow-hidden bg-primary d-flex align-items-center justify-content-center text-white fw-bold" style={{ fontSize: '20px' }}>
                        {profileData.avatar ? (
                          <img src={getImageUrl(profileData.avatar)} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          profileData.fullName.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleAvatarUpload} />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-sm text-white px-3" style={{ background: '#009CFF', fontSize: '11px', borderRadius: '8px' }}>
                          Update Photo
                        </button>
                        <p className="text-muted mb-0 mt-1" style={{ fontSize: '10px' }}>Max size 800KB. JPG or PNG.</p>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Full Name</label>
                        <div className="position-relative">
                          <User size={14} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={profileData.fullName}
                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                            className="form-control form-control-sm border-gray-200 settings-input-icon"
                            style={{ borderRadius: '8px', fontSize: '12px' }}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Email Address</label>
                        <div className="position-relative">
                          <Mail size={14} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          <input
                            type="email"
                            placeholder="Email Address"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="form-control form-control-sm border-gray-200 settings-input-icon"
                            style={{ borderRadius: '8px', fontSize: '12px' }}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Phone Number</label>
                        <div className="position-relative">
                          <Phone size={14} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="form-control form-control-sm border-gray-200 settings-input-icon"
                            style={{ borderRadius: '8px', fontSize: '12px' }}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Language</label>
                        <div className="position-relative">
                          <Languages size={14} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, pointerEvents: 'none' }} />
                          <select
                            value={profileData.language}
                            onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                            className="form-select form-select-sm border-gray-200 settings-input-icon"
                            style={{ borderRadius: '8px', fontSize: '12px' }}
                          >
                            <option value="en">English (US)</option>
                            <option value="fr">French (FR)</option>
                            <option value="rw">Kinyarwanda</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn text-white w-auto px-4 mt-3 d-flex align-items-center gap-2" style={{ background: '#009CFF', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Save Profile
                    </button>
                  </form>
                </div>
              </ScrollReveal>
            )}

            {isAdmin && activeTab === "company" && (
              <ScrollReveal delay={0.1} className="fade-in-up">
                <div className="glass-card p-4 rounded-xl border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.8)' }}>
                  <h3 className="fw-bold text-dark mb-4" style={{ fontSize: '14px' }}>Company Information</h3>
                  <form onSubmit={handleSaveCompany} className="space-y-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Company Name</label>
                        <input type="text" value={companyData.name} onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })} className="form-control form-control-sm border-gray-200" style={{ borderRadius: '8px', fontSize: '12px' }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Support Email</label>
                        <input type="email" value={companyData.email} onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })} className="form-control form-control-sm border-gray-200" style={{ borderRadius: '8px', fontSize: '12px' }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Phone</label>
                        <input type="text" value={companyData.phone} onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })} className="form-control form-control-sm border-gray-200" style={{ borderRadius: '8px', fontSize: '12px' }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Status</label>
                        <select value={companyData.websiteStatus} onChange={(e) => setCompanyData({ ...companyData, websiteStatus: e.target.value })} className="form-select form-select-sm border-gray-200" style={{ borderRadius: '8px', fontSize: '12px' }}>
                          <option value="active">Active (Production)</option>
                          <option value="maintenance">Maintenance Mode</option>
                          <option value="inactive">Internal Use Only</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Headquarters Address</label>
                        <textarea value={companyData.address} onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })} className="form-control form-control-sm border-gray-200" rows={2} style={{ borderRadius: '8px', fontSize: '12px' }} />
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between pt-3">
                      <div className="d-flex align-items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100" style={{ fontSize: '10px' }}>
                        <RefreshCw size={12} className="text-blue-500" />
                        <span className="text-blue-700">Syncs with public footer & contact page.</span>
                      </div>
                      <button type="submit" disabled={loading} className="btn text-white px-4 d-flex align-items-center gap-2" style={{ background: '#009CFF', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Update Global Settings
                      </button>
                    </div>
                  </form>
                </div>
              </ScrollReveal>
            )}

            {isAdmin && activeTab === "notifications" && (
              <ScrollReveal delay={0.1} className="fade-in-up">
                <div className="glass-card p-4 rounded-xl border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.8)' }}>
                  <h3 className="fw-bold text-dark mb-4" style={{ fontSize: '14px' }}>Notification Preferences</h3>
                  <div className="space-y-3">
                    {[
                      { title: "Project Updates", desc: "Status changes and milestones" },
                      { title: "Payment Alerts", desc: "Sent and received disbursements" },
                      { title: "Employee Hub", desc: "New joins and daily attendance" },
                      { title: "Budget Thresholds", desc: "Warnings for over-budget projects" }
                    ].map((pref, i) => (
                      <div key={i} className="d-flex align-items-center justify-content-between p-2 rounded-lg bg-light/50 border border-gray-100">
                        <div>
                          <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>{pref.title}</div>
                          <div className="text-muted" style={{ fontSize: '10px' }}>{pref.desc}</div>
                        </div>
                        <div className="form-check form-switch mb-0">
                          <input className="form-check-input" type="checkbox" defaultChecked />
                        </div>
                      </div>
                    ))}
                    <button onClick={handleSaveNotifications} className="btn text-white px-4 mt-3 d-flex align-items-center gap-2" style={{ background: '#009CFF', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                      <Save size={14} /> Save Preferences
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {isAdmin && activeTab === "security" && (
              <ScrollReveal delay={0.1} className="fade-in-up">
                <div className="glass-card p-4 rounded-xl border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.8)' }}>
                  <h3 className="fw-bold text-dark mb-4" style={{ fontSize: '14px' }}>Access & Security</h3>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="row g-3 px-1">
                      <div className="col-12">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Current Password</label>
                        <div className="position-relative">
                          <Lock size={14} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          <input type="password" placeholder="Current Password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="form-control form-control-sm border-gray-200 settings-input-icon" style={{ borderRadius: '8px', fontSize: '12px' }} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>New Password</label>
                        <div className="position-relative">
                          <Lock size={14} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          <input type="password" placeholder="New Password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="form-control form-control-sm border-gray-200 settings-input-icon" style={{ borderRadius: '8px', fontSize: '12px' }} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="text-muted mb-1 font-medium d-block" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Confirm Password</label>
                        <div className="position-relative">
                          <Lock size={14} className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          <input type="password" placeholder="Confirm New Password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="form-control form-control-sm border-gray-200 settings-input-icon" style={{ borderRadius: '8px', fontSize: '12px' }} />
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between pt-3">
                      <div className="d-flex align-items-center gap-2 text-warning" style={{ fontSize: '10px' }}>
                        <ShieldHalf size={12} />
                        <span>Recommended: Enable 2FA for extra safety.</span>
                      </div>
                      <button type="submit" disabled={loading} className="btn text-white px-4 d-flex align-items-center gap-2" style={{ background: '#009CFF', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </ScrollReveal>
            )}

            {isAdmin && activeTab === "api" && (
              <ScrollReveal delay={0.1} className="fade-in-up">
                <div className="glass-card p-4 rounded-xl border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.8)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark mb-0" style={{ fontSize: '14px' }}>Developer Hub</h3>
                    <button className="btn btn-sm btn-light border" style={{ fontSize: '10px', borderRadius: '8px' }}>Generate Secret Key</button>
                  </div>
                  
                  <div className="bg-light/40 p-3 rounded-lg border border-gray-100 mb-4">
                    <div className="d-flex align-items-center gap-2 text-dark fw-bold mb-2" style={{ fontSize: '12px' }}>
                      <Globe size={14} className="text-blue-500" /> System Registration API
                    </div>
                    <div className="input-group input-group-sm">
                      <input type="text" readOnly value={`${window.location.origin}/register?ref=bsng_admin`} className="form-control bg-white border-gray-200 font-mono" style={{ fontSize: '10px' }} />
                      <button className="btn btn-outline-secondary" style={{ fontSize: '10px' }} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/register?ref=bsng_admin`); toast.success("Copied!"); }}>Copy</button>
                    </div>
                  </div>

                  <div className="max-h-[500px] overflow-auto pr-1 pe-2">
                    {[
                      { method: 'POST', endpoint: '/auth/login', desc: 'System authentication' },
                      { method: 'GET', endpoint: '/users/profile', desc: 'Current user data' },
                      { method: 'GET', endpoint: '/sites', desc: 'List all operational sites' },
                      { method: 'POST', endpoint: '/sites', desc: 'Create new site entry' },
                      { method: 'GET', endpoint: '/projects', desc: 'Full project portfolio' },
                      { method: 'POST', endpoint: '/projects', desc: 'Initialize new project' },
                      { method: 'PATCH', endpoint: '/projects/:id', desc: 'Update project details' },
                      { method: 'GET', endpoint: '/employees', desc: 'Workforce registry' },
                      { method: 'POST', endpoint: '/employees/attendance', desc: 'Secure site entry log' },
                      { method: 'GET', endpoint: '/employees/attendance/:siteId', desc: 'Site-specific logs' },
                      { method: 'GET', endpoint: '/finance/stats', desc: 'Financial health metrics' },
                      { method: 'GET', endpoint: '/finance/transactions', desc: 'Full ledger access' },
                      { method: 'POST', endpoint: '/finance/disbursement', desc: 'Process new payment' },
                      { method: 'GET', endpoint: '/communications/messages', desc: 'Internal chat hub' },
                      { method: 'POST', endpoint: '/communications/send', desc: 'Dispatch notification' },
                      { method: 'GET', endpoint: '/settings', desc: 'Global configuration' },
                      { method: 'PUT', endpoint: '/settings/:key', desc: 'Update system constant' },
                      { method: 'POST', endpoint: '/content/upload-image', desc: 'Direct asset storage' },
                      { method: 'GET', endpoint: '/analytics/performance', desc: 'System-wide insights' }
                    ].map((api, i) => (
                      <div key={i} className="d-flex align-items-center justify-content-between p-2 mb-2 rounded-lg border border-gray-100 hover:bg-light/30 transition-all shadow-sm bg-white">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-0.5">
                             <span className="badge p-1 px-2 rounded" style={{ 
                               background: api.method === 'GET' ? '#eff6ff' : api.method === 'POST' ? '#ecfdf5' : api.method === 'PATCH' ? '#fff7ed' : '#fef2f2', 
                               color: api.method === 'GET' ? '#2563eb' : api.method === 'POST' ? '#059669' : api.method === 'PATCH' ? '#d97706' : '#dc2626', 
                               fontSize: '8px',
                               fontWeight: 800
                             }}>{api.method}</span>
                             <code className="text-dark font-mono font-bold" style={{ fontSize: '10px' }}>{api.endpoint}</code>
                          </div>
                          <div className="text-muted" style={{ fontSize: '9px', paddingLeft: '4px' }}>{api.desc}</div>
                        </div>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm p-1.5 text-muted hover:text-blue-500 bg-light rounded" title="Copy Endpoint" onClick={() => { navigator.clipboard.writeText(api.endpoint); toast.success("Endpoint copied"); }}>
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .active-site { border-color: #009CFF !important; }
        .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp { 
            from { opacity: 0; transform: translateY(15px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
        .smaller { font-size: 11px; }
        .site-row:hover { border-color: #009CFF !important; background-color: #f8fbff !important; }
        .directory-scroll-container::-webkit-scrollbar { width: 4px; }
        .directory-scroll-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .settings-input-icon { padding-left: 36px !important; }
      `}</style>
    </div>
  );
}
