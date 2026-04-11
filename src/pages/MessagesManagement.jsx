import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MessagesManagement() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const messages = [
    { id: 1, sender: 'John Doe', email: 'john@example.com', subject: 'Inquiry about Plot Sales', date: '2026-04-10', status: 'Unread' },
    { id: 2, sender: 'Sarah Smith', email: 'sarah@example.com', subject: 'Renovation Quote Request', date: '2026-04-09', status: 'Read' },
    { id: 3, sender: 'Mike Johnson', email: 'mike@example.com', subject: 'Property Management Questions', date: '2026-04-08', status: 'Replied' },
  ];

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
          <SidebarItem icon="fa-comments" label="Messages" active onClick={() => navigate('/admin/messages')} />
          <SidebarItem icon="fa-chart-line" label="Analytics" onClick={() => navigate('/admin/analytics')} />
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
          <h4 style={{ margin: 0, fontWeight: 'bold', color: '#2d3748' }}>Messages & Inquiries</h4>
        </header>

        <main style={{ padding: '30px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
             <div className="table-responsive">
               <table className="table table-hover">
                 <thead style={{ background: '#f8f9fc' }}>
                   <tr>
                     <th>Sender</th>
                     <th>Email</th>
                     <th>Subject</th>
                     <th>Date</th>
                     <th>Status</th>
                     <th className="text-end">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {messages.map(msg => (
                     <tr key={msg.id} style={{ verticalAlign: 'middle' }}>
                       <td style={{ fontWeight: '600' }}>{msg.sender}</td>
                       <td>{msg.email}</td>
                       <td>{msg.subject}</td>
                       <td>{msg.date}</td>
                       <td>
                         <span style={{ 
                           padding: '3px 10px', 
                           borderRadius: '20px', 
                           fontSize: '0.7rem', 
                           fontWeight: 'bold',
                           background: msg.status === 'Unread' ? 'rgba(231, 74, 59, 0.1)' : 
                                       msg.status === 'Read' ? 'rgba(78, 115, 223, 0.1)' : 'rgba(28, 200, 138, 0.1)',
                           color: msg.status === 'Unread' ? '#e74a3b' : 
                                  msg.status === 'Read' ? '#4e73df' : '#1cc88a'
                         }}>
                           {msg.status.toUpperCase()}
                         </span>
                       </td>
                       <td className="text-end">
                         <button className="btn btn-sm btn-outline-primary me-2"><i className="fa fa-eye"></i></button>
                         <button className="btn btn-sm btn-outline-success"><i className="fa fa-reply"></i></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
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
