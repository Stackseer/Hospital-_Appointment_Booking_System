import React, { useState } from 'react';
import './App.css';
import './components/Components.css';
import Dashboard from './components/Dashboard';
import DoctorList from './components/DoctorList';
import BookAppointment from './components/BookAppointment';
import AppointmentList from './components/AppointmentList';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'book', label: 'Book appointment', icon: 'calendar-plus' },
  { id: 'appointments', label: 'Appointments', icon: 'calendar' },
  { id: 'doctors', label: 'Find a doctor', icon: 'users' },
];

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    calendar: <><rect x="3" y="4.5" width="18" height="17" rx="2" /><path d="M16 2.5v4M8 2.5v4M3 9.5h18" /><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></>,
    'calendar-plus': <><rect x="3" y="4.5" width="18" height="17" rx="2" /><path d="M16 2.5v4M8 2.5v4M3 9.5h18M12 13v6M9 16h6" /></>,
    users: <><path d="M16 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 19.5V21" /><circle cx="10" cy="7.5" r="3.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 6.8M18.5 15.2a4.5 4.5 0 0 1 2.5 4.1V21" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    check: <path d="m5 12.5 4.2 4.2L19 7" />,
    x: <><path d="M6 6l12 12M18 6 6 18" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    heart: <path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z" />,
    shield: <><path d="M12 21s8-3.8 8-10V5l-8-3-8 3v6c0 6.2 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  };
  return <svg {...common}>{paths[name] || paths.grid}</svg>;
}

export default function App() {
  const [view, setView] = useState('dashboard');
  const [justBooked, setJustBooked] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (nextView) => {
    setView(nextView);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBooked = (appointment) => {
    setJustBooked(appointment);
    navigate('appointments');
  };

  const activeLabel = NAV_ITEMS.find((item) => item.id === view)?.label || 'Dashboard';

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark"><Icon name="heart" size={22} strokeWidth={2.2} /></div>
            <div>
              <div className="brand-name">MediCare</div>
              <div className="brand-sub">Appointment Center</div>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Main navigation">
            <span className="nav-section-label">Workspace</span>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${view === item.id ? 'nav-item--active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
                {item.id === 'appointments' && justBooked ? <span className="nav-dot" /> : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="care-card">
            <div className="care-card-icon"><Icon name="shield" size={18} /></div>
            <div>
              <strong>Your care, organized</strong>
              <span>Simple scheduling for your next visit.</span>
            </div>
          </div>
          <div className="sidebar-user">
            <div className="avatar avatar--small">P</div>
            <div className="sidebar-user-copy">
              <strong>Patient portal</strong>
              <span>Secure &amp; private</span>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setMobileOpen((open) => !open)} aria-label="Open navigation">
              <Icon name="menu" size={22} />
            </button>
            <div className="breadcrumb">
              <span>Patient portal</span><span className="breadcrumb-separator">/</span><strong>{activeLabel}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <div className="secure-indicator"><span className="online-dot" /> Connected</div>
            <div className="avatar">P</div>
          </div>
        </header>

        <div className="page-content">
          {view === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {view === 'book' && <BookAppointment onBooked={handleBooked} />}
          {view === 'appointments' && <AppointmentList highlightId={justBooked?.id} />}
          {view === 'doctors' && <DoctorList onNavigate={navigate} />}
        </div>
      </main>
    </div>
  );
}

export { Icon };
