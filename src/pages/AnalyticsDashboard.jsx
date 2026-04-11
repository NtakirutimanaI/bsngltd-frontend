import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AnalyticsDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="admin-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fc' }}>
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ width: '260px', background: '#1a1d23', color: '#fff', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
        <div className="sidebar-brand" style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #2d333d' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#f68b1f' }}>BSNG ADMIN</h2>
        </div>
        <div className="sidebar-menu" style={{ padding: '20px 0', flex: 1 }}>
          <SidebarItem icon="fa-tachometer-alt" label="Dashboard" onClick={() => navigate('/admin')} />
          <SidebarItem icon="fa-hard-hat" label="Site & Projects" onClick={() => navigate('/admin/projects')} />
          <SidebarItem icon="fa-users" label="Users" onClick={() => navigate('/admin/users')} />
          <SidebarItem icon="fa-clipboard-check" label="Attendance" onClick={() => navigate('/admin/attendance')} />
          <SidebarItem icon="fa-wallet" label="Financial" onClick={() => navigate('/admin/financial')} />
          <SidebarItem icon="fa-comments" label="Messages" onClick={() => navigate('/admin/messages')} />
          <SidebarItem icon="fa-chart-line" label="Analytics" active onClick={() => navigate('/admin/analytics')} />
          <SidebarItem icon="fa-key" label="Permissions" onClick={() => navigate('/admin/permissions')} />
          <SidebarItem icon="fa-edit" label="CMS" onClick={() => navigate('/admin/cms')} />
          <SidebarItem icon="fa-cog" label="Settings" onClick={() => navigate('/admin/settings')} />
        </div>
        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid #2d333d' }}>
          <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#ff4d4d', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
            <i className="fa fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '70px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <h4 style={{ margin: 0, fontWeight: 'bold', color: '#2d3748' }}>Business Analytics</h4>
        </header>

        <main style={{ padding: '30px' }}>
          <div className="row g-4 mb-4">
             <div className="col-md-4">
               <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                 <h6>User Growth</h6>
                 <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '10px' }}>
                   {[30, 50, 45, 70, 85, 90, 100].map((h, i) => (
                     <div key={i} style={{ flex: 1, background: '#4e73df', height: `${h}%`, borderRadius: '4px' }}></div>
                   ))}
                 </div>
               </div>
             </div>
             <div className="col-md-4">
               <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                 <h6>Project Completion Rate</h6>
                 <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '10px' }}>
                   {[90, 80, 85, 75, 95, 100, 90].map((h, i) => (
                     <div key={i} style={{ flex: 1, background: '#1cc88a', height: `${h}%`, borderRadius: '4px' }}></div>
                   ))}
                 </div>
               </div>
             </div>
             <div className="col-md-4">
               <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                 <h6>Inquiry Conversion</h6>
                 <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '10px' }}>
                   {[20, 35, 40, 30, 50, 45, 60].map((h, i) => (
                     <div key={i} style={{ flex: 1, background: '#f6c23e', height: `${h}%`, borderRadius: '4px' }}></div>
                   ))}
                 </div>
               </div>
             </div>
          </div>
          
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h5>Detailed Performance Report</h5>
            <p className="text-muted">Analytics data visualization for business performance across all sectors.</p>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
               <span style={{ color: '#a0aec0' }}>Comprehensive Chart Visualization Placeholder</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        padding: '12px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        cursor: 'pointer',
        background: active ? 'rgba(246, 139, 31, 0.1)' : 'transparent',
        borderLeft: active ? '3px solid #f68b1f' : '3px solid transparent',
        color: active ? '#f68b1f' : '#a0aec0',
        transition: 'all 0.3s'
      }}
    >
      <i className={`fa ${icon}`} style={{ width: '20px' }}></i>
      <span style={{ fontSize: '0.9rem', fontWeight: active ? 'bold' : 'normal' }}>{label}</span>
    </div>
  );
}
