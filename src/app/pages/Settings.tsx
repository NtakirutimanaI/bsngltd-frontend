import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import {
  User,
  Mail,
  Phone,
  Lock,
  Globe,
  Bell,
  Shield,
  Building,
  Save,
  Loader2,
  RefreshCw,
  Copy,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi, getImageUrl } from "../api/client";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

export function Settings() {
  const { user, setUser } = useAuth();
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

      // Map setting values to company data state
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
          token: "direct_reset", // Backend would need to support direct reset for logged in user or use current password
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

  // Determine if the user has an administrator role using the same logic as RootLayout
  const isAdmin = (() => {
    if (!user) return false;

    const roleName = (typeof user?.role === 'object' && user.role !== null)
      ? (user.role as any).name
      : (user?.role || 'guest');

    const normalizedRole = roleName.toString().toLowerCase().replace(/\s+/g, '_');

    // Allow broader access temporarily for testing/visibility
    return ['super_admin', 'admin', 'manager', 'site_manager', 'content_editor'].includes(normalizedRole);
  })();

  const tabs = [
    { id: "profile", name: "Profile Settings", icon: User },
    ...(isAdmin ? [
      { id: "company", name: "Company", icon: Building },
      { id: "notifications", name: "Notifications", icon: Bell },
      { id: "security", name: "Security", icon: Shield },
      { id: "api", name: "API & Integrations", icon: Globe },
    ] : [])
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <ScrollReveal>
        <h1 className="h3 fw-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <ScrollReveal delay={0.1} className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                  ? "bg-blue-100 text-teal-700"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <ScrollReveal delay={0.2} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden" style={{ backgroundImage: 'linear-gradient(to right bottom, #14b8a6, #16a085)' }}>
                    {profileData.avatar ? (
                      <img src={getImageUrl(profileData.avatar)} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      profileData.fullName.charAt(0) || "A"
                    )}
                  </div>
                  <div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/gif" onChange={handleAvatarUpload} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors" style={{ backgroundColor: '#16a085' }}>
                      Change Avatar
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      JPG, GIF or PNG. Max size of 800KB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={profileData.language}
                        onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="rw">Kinyarwanda</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Save Changes
                </button>
              </form>
            </ScrollReveal>
          )}

          {isAdmin && activeTab === "company" && (
            <ScrollReveal delay={0.2} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h3>
              <form onSubmit={handleSaveCompany} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Official Address
                    </label>
                    <input
                      type="text"
                      value={companyData.address}
                      onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website Status
                    </label>
                    <select
                      value={companyData.websiteStatus}
                      onChange={(e) => setCompanyData({ ...companyData, websiteStatus: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                    >
                      <option value="active">Active (Public)</option>
                      <option value="maintenance">Maintenance Mode</option>
                      <option value="inactive">Inactive (Disabled)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex items-start gap-2 max-w-md">
                    <RefreshCw size={14} className="mt-0.5" />
                    <div> These settings affect the public website globally.</div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Save Company Info
                  </button>
                </div>
              </form>
            </ScrollReveal>
          )}

          {isAdmin && activeTab === "notifications" && (
            <ScrollReveal delay={0.2} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
              <form onSubmit={handleSaveNotifications} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Project Updates</p>
                      <p className="text-sm text-gray-600">
                        Get notified about project status changes
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Payment Notifications</p>
                      <p className="text-sm text-gray-600">
                        Alerts for payments received and sent
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Employee Updates</p>
                      <p className="text-sm text-gray-600">
                        New employee joins or attendance alerts
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Budget Alerts</p>
                      <p className="text-sm text-gray-600">
                        Notifications when projects exceed budget thresholds
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive email summaries daily</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Urgent alerts via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Save className="h-5 w-5" />
                  Save Preferences
                </button>
              </form>
            </ScrollReveal>
          )}

          {isAdmin && activeTab === "security" && (
            <ScrollReveal delay={0.2} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
              <div className="space-y-6">
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900">Enable 2FA for additional security</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Protect your account with an extra layer of security
                        </p>
                      </div>
                      <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Enable
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Update Password
                  </button>
                </form>
              </div>
            </ScrollReveal>
          )}

          {isAdmin && activeTab === "api" && (
            <ScrollReveal delay={0.2} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="d-flex justify-content-between align-items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">API Access & Integration</h3>
                  <p className="text-sm text-gray-600 mt-1">Share secure endpoints for employee registration and data collection.</p>
                </div>
                <button className="px-4 py-2 rounded-lg hover:opacity-90 transition-colors text-sm font-medium" style={{ backgroundColor: '#d4efea', color: '#16a085' }}>
                  Generate New Token
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Globe size={16} /> Public Registration Link
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">Share this link with new employees to allow them to self-register their details safely.</p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-300 text-sm font-mono text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
                      {window.location.origin}/register?ref=admin_invite
                    </code>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/register?ref=admin_invite`); alert("Link copied!") }} className="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-600">
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Core API Endpoints</h4>
                  <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-3">
                      {[
                        { method: 'POST', endpoint: '/auth/login', desc: 'Secure user authentication' },
                        { method: 'POST', endpoint: '/auth/register', desc: 'Register new system users' },
                        { method: 'GET', endpoint: '/users', desc: 'Manage system users (Admin)' },
                        { method: 'GET', endpoint: '/projects', desc: 'Full project portfolio management' },
                        { method: 'GET', endpoint: '/properties', desc: 'Property listings and status' },
                        { method: 'GET', endpoint: '/employees', desc: 'HR and personnel management' },
                        { method: 'POST', endpoint: '/employees/attendance', desc: 'Record daily site attendance' },
                        { method: 'GET', endpoint: '/employees/payroll/calculate', desc: 'Monthly salary engine' },
                        { method: 'POST', endpoint: '/payments', desc: 'Financial records and disbursements' },
                        { method: 'GET', endpoint: '/updates', desc: 'News and announcements CMS' },
                        { method: 'GET', endpoint: '/settings/public', desc: 'Public site configuration' }
                      ].map((api, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${api.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {api.method}
                              </span>
                              <code className="text-sm font-mono text-gray-800">{api.endpoint}</code>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{api.desc}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { navigator.clipboard.writeText(api.endpoint); toast.success("Endpoint copied") }} className="text-gray-400 hover:text-emerald-600">
                              <Copy size={14} />
                            </button>
                            <a href="#" className="text-gray-400 hover:text-blue-600">
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Integration Tokens</h4>
                    <span className="badge bg-success-subtle text-success px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                      <CheckCircle size={10} /> Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Use these tokens to authenticate third-party applications.</p>
                  <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800 flex items-start gap-2">
                    <Shield size={16} className="mt-0.5" />
                    <div>
                      <strong>Security Warning:</strong> Never share your secret API keys. Rotate them immediately if you suspect a leak.
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  );
}
