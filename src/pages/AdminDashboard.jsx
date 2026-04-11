import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Projects', value: '24', icon: 'fa-project-diagram', color: '#4e73df' },
    { title: 'Active Sites', value: '12', icon: 'fa-building', color: '#1cc88a' },
    { title: 'Users/Staff', value: '48', icon: 'fa-users', color: '#36b9cc' },
    { title: 'Messages', value: '18', icon: 'fa-envelope', color: '#f6c23e' },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Stat Cards */}
      <div className="row g-4 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-xl-3 col-md-6">
            <div style={{ 
              background: 'var(--card-bg, #fff)', 
              borderRadius: '12px', 
              padding: '24px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
              borderLeft: `4px solid ${stat.color}`
            }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', fontWeight: 'bold', color: stat.color, textTransform: 'uppercase' }}>{stat.title}</p>
                <h4 style={{ margin: 0, fontWeight: 'bold' }}>{stat.value}</h4>
              </div>
              <i className={`fa ${stat.icon}`} style={{ fontSize: '2rem', color: '#e2e8f0' }}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Profits & Losses Chart Area */}
        <div className="col-lg-8">
          <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '24px', height: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h5 style={{ margin: 0, fontWeight: 'bold' }}>Profits & Losses Analysis</h5>
              <div style={{ display: 'flex', gap: '15px', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#4e73df', borderRadius: '2px' }}></span> Profits
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#e74a3b', borderRadius: '2px' }}></span> Losses
                </span>
              </div>
            </div>
            {/* Simulated Chart with SVG */}
            <div style={{ position: 'relative', height: '300px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px' }}>
              <div className="grid-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0 }}>
                {[1,2,3,4,5].map(i => <div key={i} style={{ width: '100%', borderTop: '1px dashed #edf2f7' }}></div>)}
              </div>
              {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                <div key={i} style={{ width: '12%', display: 'flex', flexDirection: 'column', gap: '2px', zIndex: 1, position: 'relative', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ height: `${h}%`, width: '100%', background: 'linear-gradient(to top, #4e73df, #224abe)', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ height: `${h/3}%`, width: '100%', background: 'linear-gradient(to top, #e74a3b, #be2617)', borderRadius: '0 0 4px 4px' }}></div>
                  <span style={{ fontSize: '0.7rem', color: '#718096', textAlign: 'center', marginTop: '10px' }}>Day {i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie Chart: Revenue Sources */}
        <div className="col-lg-4">
          <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '24px', height: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
            <h5 style={{ margin: '0 0 20px 0', fontWeight: 'bold' }}>Revenue Sources</h5>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 36 36" style={{ width: '180px', height: '180px' }}>
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#edf2f7" strokeWidth="4"></circle>
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#4e73df" strokeWidth="4" strokeDasharray="55 100" strokeDashoffset="25"></circle>
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#1cc88a" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="70"></circle>
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#36b9cc" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="85"></circle>
                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f6c23e" strokeWidth="4" strokeDasharray="5 100" strokeDashoffset="90"></circle>
              </svg>
              <div style={{ marginTop: '20px', width: '100%' }}>
                <LegendItem color="#4e73df" label="Home Construction" value="55%" />
                <LegendItem color="#1cc88a" label="Plot Sales" value="25%" />
                <LegendItem color="#36b9cc" label="Property Rental" value="15%" />
                <LegendItem color="#f6c23e" label="Renovation" value="5%" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        {/* Project Summary List */}
        <div className="col-lg-12">
          <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
            <h5 style={{ margin: '0 0 20px 0', fontWeight: 'bold' }}>Active Projects Status</h5>
            <div className="row">
              <div className="col-md-6">
                <ProjectRow name="Kigali Heights II" progress={85} status="On Track" color="#1cc88a" />
                <ProjectRow name="Rubavu Resort" progress={45} status="Delayed" color="#f6c23e" />
              </div>
              <div className="col-md-6">
                <ProjectRow name="Vision City Phase 4" progress={10} status="Just Started" color="#36b9cc" />
                <ProjectRow name="Nyagatare Warehouse" progress={100} status="Completed" color="#4e73df" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function ProjectRow({ name, progress, status, color }) {
  return (
    <div style={{ marginBottom: '20px', borderBottom: '1px solid #f7fafc', paddingBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.85rem' }}>{name}</span>
        <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: color }}>{status}</span>
      </div>
      <div style={{ height: '6px', width: '100%', background: '#edf2f7', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: color }}></div>
      </div>
      <div style={{ textAlign: 'right', marginTop: '4px' }}>
        <span style={{ fontSize: '0.65rem', color: '#a0aec0' }}>{progress}% Completion</span>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }}></div>
        <span style={{ fontSize: '0.75rem', color: '#718096' }}>{label}</span>
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{value}</span>
    </div>
  );
}
