import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '', profileImage: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const decoded = parseJwt(token);
    if (decoded && decoded.sub) {
      fetch(`http://localhost:4000/api/users/${decoded.sub}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()).then(data => {
        if (!data.error) {
          setUser(data);
          setEditForm({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            profileImage: data.profileImage || ''
          });
        }
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:4000/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editForm)
      });
      if (response.ok) {
        toast.success("Profile updated!");
        const updated = await response.json();
        setUser({ ...user, ...updated });
        setShowProfileModal(false);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  return (
    <div className={`admin-wrapper ${isDarkMode ? 'dark-mode' : ''}`} style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: isDarkMode ? '#111' : '#f8f9fc',
      color: isDarkMode ? '#fff' : '#2d3748',
      transition: 'all 0.3s'
    }}>
      
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ 
        width: '200px', 
        background: '#1a1d23', 
        color: '#fff', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
        zIndex: 100,
        position: 'fixed',
        height: '100vh'
      }}>
        <div className="sidebar-brand" style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #2d333d' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#f68b1f' }}>BSNG ADMIN</h2>
        </div>
        
        <div className="sidebar-menu" style={{ padding: '20px 0', flex: 1 }}>
          <SidebarItem icon="fa-tachometer-alt" label="Dashboard" active={location.pathname === '/admin'} onClick={() => navigate('/admin')} />
          <SidebarItem icon="fa-map-marked-alt" label="Sites" active={location.pathname === '/admin/sites'} onClick={() => navigate('/admin/sites')} />
          <SidebarItem icon="fa-hard-hat" label="Projects" active={location.pathname === '/admin/projects'} onClick={() => navigate('/admin/projects')} />
          <SidebarItem icon="fa-users" label="Users" active={location.pathname === '/admin/users'} onClick={() => navigate('/admin/users')} />
          <SidebarItem icon="fa-clipboard-check" label="Attendance" active={location.pathname === '/admin/attendance'} onClick={() => navigate('/admin/attendance')} />
          <SidebarItem icon="fa-wallet" label="Financial" active={location.pathname === '/admin/financial'} onClick={() => navigate('/admin/financial')} />
          <SidebarItem icon="fa-comments" label="Messages" active={location.pathname === '/admin/messages'} onClick={() => navigate('/admin/messages')} />
          <SidebarItem icon="fa-chart-line" label="Analytics" active={location.pathname === '/admin/analytics'} onClick={() => navigate('/admin/analytics')} />
          <SidebarItem icon="fa-key" label="Permissions" active={location.pathname === '/admin/permissions'} onClick={() => navigate('/admin/permissions')} />
          <SidebarItem 
            icon="fa-edit" 
            label="CMS" 
            active={location.pathname.startsWith('/admin/cms')}
            subItems={[
              { label: 'Home', path: '/admin/cms/home', onClick: () => navigate('/admin/cms/home') },
              { label: 'About', path: '/admin/cms/about', onClick: () => navigate('/admin/cms/about') },
              { label: 'Services', path: '/admin/cms/services', onClick: () => navigate('/admin/cms/services') },
              { label: 'Projects', path: '/admin/cms/projects', onClick: () => navigate('/admin/cms/projects') },
              { label: 'Updates', path: '/admin/cms/updates', onClick: () => navigate('/admin/cms/updates') },
              { label: 'Contact', path: '/admin/cms/contact', onClick: () => navigate('/admin/cms/contact') }
            ]}
          />
          <SidebarItem icon="fa-cog" label="Settings" active={location.pathname === '/admin/settings'} onClick={() => navigate('/admin/settings')} />
        </div>

        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid #2d333d' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              color: '#ff4d4d', 
              padding: '10px', 
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <i className="fa fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main-area" style={{ flex: 1, marginLeft: '200px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Universal Admin Header */}
        <header style={{ 
          height: '70px', 
          background: isDarkMode ? '#1a1d23' : '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          borderBottom: isDarkMode ? '1px solid #2d333d' : 'none'
        }}>
          <div className="header-left">
            <h4 style={{ margin: 0, fontWeight: 'bold' }}>{title || 'Admin Panel'} {isDarkMode && <span className="badge bg-secondary ms-2" style={{ fontSize: '0.6rem' }}>DARK</span>}</h4>
          </div>

          <div className="admin-header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Search (Optional) */}
            <div className="search-bar d-none d-md-block">
               <div style={{ position: 'relative' }}>
                 <i className="fa fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }}></i>
                 <input type="text" placeholder="Search..." style={{ padding: '6px 15px 6px 35px', borderRadius: '20px', border: isDarkMode ? '1px solid #2d333d' : '1px solid #e2e8f0', background: isDarkMode ? '#111' : '#fff', color: isDarkMode ? '#fff' : '#000', fontSize: '0.85rem', width: '200px' }} />
               </div>
            </div>

            {/* Quick Add (+) */}
            <button 
                className="btn btn-primary" 
                style={{ borderRadius: '50%', width: '35px', height: '35px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Quick Action"
            >
              <i className="fa fa-plus"></i>
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative', cursor: 'pointer' }} title="Notifications">
              <i className="fa fa-bell" style={{ color: isDarkMode ? '#a0aec0' : '#718096', fontSize: '1.2rem' }}></i>
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#e74a3b', color: '#fff', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '10px' }}>5</span>
            </div>

            {/* Light/Dark Mode Toggle */}
            <div style={{ cursor: 'pointer' }} onClick={toggleTheme} title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
              <i className={`fa ${isDarkMode ? 'fa-sun' : 'fa-moon'}`} style={{ color: isDarkMode ? '#f6c23e' : '#718096', fontSize: '1.2rem' }}></i>
            </div>

            <div className="admin-profile" style={{ position: 'relative' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div style={{ textAlign: 'right' }} className="d-none d-sm-block">
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User' : 'Loading...'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#718096', textTransform: 'capitalize' }}>
                    {user ? user.role : 'Administrator'}
                  </p>
                </div>
                <div style={{ width: '40px', height: '40px', background: isDarkMode ? '#2d333d' : '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {user && user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="fa fa-user-circle text-primary" style={{ fontSize: '1.5rem' }}></i>
                  )}
                </div>
              </div>
              
              {showProfileMenu && (
                 <div style={{ position: 'absolute', top: '50px', right: 0, background: isDarkMode ? '#1a1d23' : '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '8px', width: '200px', zIndex: 1000, border: isDarkMode ? '1px solid #2d333d' : '1px solid #e2e8f0' }}>
                   <div 
                     style={{ padding: '12px 20px', cursor: 'pointer', borderBottom: isDarkMode ? '1px solid #2d333d' : '1px solid #edf2f7', fontSize: '0.85rem' }}
                     onClick={() => { setShowProfileMenu(false); setShowProfileModal(true); }}
                   >
                     <i className="fa fa-user-edit me-2 text-primary"></i> Edit Profile
                   </div>
                   <div 
                     style={{ padding: '12px 20px', cursor: 'pointer', color: '#e74a3b', fontSize: '0.85rem' }}
                     onClick={handleLogout}
                   >
                     <i className="fa fa-sign-out-alt me-2"></i> Logout
                   </div>
                 </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main style={{ padding: '30px', flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: isDarkMode ? '#1a1d23' : '#fff', color: isDarkMode ? '#fff' : '#333', width: '500px', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <h5 className="mb-4">Edit Profile</h5>
            <form onSubmit={handleProfileUpdate}>
              <div className="text-center mb-4">
                <div style={{ width: '80px', height: '80px', background: '#e2e8f0', borderRadius: '50%', margin: '0 auto 15px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {editForm.profileImage ? (
                    <img src={editForm.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className="fa fa-user text-secondary" style={{ fontSize: '2rem' }}></i>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.5)', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <label htmlFor="profileUpload" style={{ cursor: 'pointer', margin: 0, fontSize: '0.7rem', color: '#fff' }}>Change</label>
                    <input type="file" id="profileUpload" accept="image/*" onChange={handleProfileImageChange} style={{ display: 'none' }} />
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small">First Name</label>
                  <input type="text" className="form-control form-control-sm" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} placeholder="e.g. John" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Last Name</label>
                  <input type="text" className="form-control form-control-sm" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} placeholder="e.g. Doe" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Email Address</label>
                  <input type="email" className="form-control form-control-sm" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="e.g. email@example.com" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Phone Number</label>
                  <input type="text" className="form-control form-control-sm" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="e.g. +250 788 000 000" />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" onClick={() => setShowProfileModal(false)} className="btn btn-light btn-sm px-4 border">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm px-4">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick, subItems = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    if (subItems.length > 0) {
      setIsOpen(!isOpen);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        onClick={handleClick}
        style={{ 
          padding: '12px 15px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          cursor: 'pointer',
          background: active && subItems.length === 0 ? 'rgba(246, 139, 31, 0.1)' : 'transparent',
          borderLeft: active && subItems.length === 0 ? '3px solid #f68b1f' : '3px solid transparent',
          color: active || isHovered ? '#f68b1f' : '#a0aec0',
          transition: 'all 0.3s'
        }}
      >
        <i className={`fa ${icon}`} style={{ width: '20px' }}></i>
        <span style={{ fontSize: '0.9rem', fontWeight: active || isHovered ? 'bold' : 'normal' }}>{label}</span>
        {label === 'Messages' && <span style={{ marginLeft: 'auto', background: '#e74a3b', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px' }}>18</span>}
        {subItems.length > 0 && (
          <i className={`fa ${isHovered ? 'fa-chevron-left' : 'fa-chevron-right'}`} style={{ marginLeft: 'auto', fontSize: '0.7rem' }}></i>
        )}
      </div>
      {subItems.length > 0 && isHovered && (
        <div style={{ 
          position: 'absolute', 
          bottom: '0', 
          left: '100%', 
          width: '160px', 
          background: '#1a1d23', 
          padding: '5px 0', 
          boxShadow: '4px 4px 15px rgba(0,0,0,0.3)',
          borderRadius: '0 8px 8px 0',
          zIndex: 9999,
          border: '1px solid #2d333d',
          borderLeft: 'none'
        }}>
          {subItems.map((item, index) => {
            const isActiveSub = window.location.pathname === item.path;
            return (
              <div 
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  item.onClick();
                }}
                style={{
                  padding: '6px 15px',
                  cursor: 'pointer',
                  color: isActiveSub ? '#fff' : '#a0aec0',
                  background: isActiveSub ? 'rgba(246, 139, 31, 0.1)' : 'transparent',
                  borderLeft: isActiveSub ? '2px solid #f68b1f' : '2px solid transparent',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fa fa-angle-right" style={{ fontSize: '0.65rem', color: isActiveSub ? '#f68b1f' : '#718096' }}></i>
                {item.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
