import React, { useEffect, useMemo, useState } from 'react';
import { getAppointments, cancelAppointment } from '../api/api';
import { Icon } from '../App';

function formatTime(value) { if (!value) return '—'; const [h, m] = value.slice(0, 5).split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
const STATUS_LABEL = { SCHEDULED: 'Scheduled', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };

export default function AppointmentList({ highlightId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const load = () => { setLoading(true); getAppointments().then((data) => setAppointments(data || [])).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleCancel = async (id) => { setActioningId(id); setError(''); try { await cancelAppointment(id); load(); } catch (err) { setError(err.message); } finally { setActioningId(null); } };

  const sorted = useMemo(() => [...appointments].sort((a, b) => `${a.appointmentDate}T${a.timeSlot}`.localeCompare(`${b.appointmentDate}T${b.timeSlot}`)), [appointments]);
  const filtered = filter === 'ALL' ? sorted : sorted.filter((a) => a.status === filter);
  const scheduledCount = appointments.filter((a) => a.status === 'SCHEDULED').length;

  return (
    <section className="page-enter">
      <div className="page-header-row"><div><span className="eyebrow">YOUR CARE</span><h1>Appointments</h1><p>Keep track of upcoming visits and your appointment history.</p></div><div className="header-stat"><strong>{scheduledCount}</strong><span>scheduled</span></div></div>
      {error && <div className="alert alert--error"><Icon name="x" size={17} /> {error}</div>}
      <div className="filter-tabs" role="tablist"><button className={filter === 'ALL' ? 'filter-tab--active' : ''} onClick={() => setFilter('ALL')}>All <span>{appointments.length}</span></button><button className={filter === 'SCHEDULED' ? 'filter-tab--active' : ''} onClick={() => setFilter('SCHEDULED')}>Scheduled <span>{scheduledCount}</span></button><button className={filter === 'COMPLETED' ? 'filter-tab--active' : ''} onClick={() => setFilter('COMPLETED')}>Completed <span>{appointments.filter((a) => a.status === 'COMPLETED').length}</span></button><button className={filter === 'CANCELLED' ? 'filter-tab--active' : ''} onClick={() => setFilter('CANCELLED')}>Cancelled <span>{appointments.filter((a) => a.status === 'CANCELLED').length}</span></button></div>

      {loading ? <div className="appointment-list">{[1, 2, 3].map((x) => <div className="appointment-card skeleton-card" key={x}><div className="skeleton skeleton-date" /><div className="skeleton-content"><div className="skeleton skeleton-line skeleton-line--long" /><div className="skeleton skeleton-line" /></div></div>)}</div> : filtered.length === 0 ? <div className="empty-state empty-state--large"><div className="empty-icon"><Icon name="calendar" size={24} /></div><h3>No appointments here</h3><p>{filter === 'ALL' ? 'Your booked appointments will appear here.' : `You do not have any ${STATUS_LABEL[filter]?.toLowerCase() || ''} appointments.`}</p></div> : <div className="appointment-list">
        {filtered.map((a) => <article key={a.id} className={`appointment-card ${a.id === highlightId ? 'appointment-card--highlight' : ''}`}>
          <div className="appointment-date-tile"><span>{new Date(`${a.appointmentDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</span><strong>{new Date(`${a.appointmentDate}T00:00:00`).getDate()}</strong><small>{new Date(`${a.appointmentDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</small></div>
          <div className="appointment-main"><div className="appointment-topline"><span className={`status-badge status-badge--${a.status.toLowerCase()}`}>{STATUS_LABEL[a.status] || a.status}</span><span className="appointment-time"><Icon name="clock" size={14} /> {formatTime(a.timeSlot)}</span></div><h2>{a.doctor?.name || 'Doctor'}</h2><p>{a.doctor?.specialization || 'Medical appointment'}</p><div className="patient-line"><span>Patient: {a.patient?.name || 'Patient'}</span>{a.reason && <span>Reason: {a.reason}</span>}</div></div>
          {a.status === 'SCHEDULED' && <button className="cancel-btn" onClick={() => handleCancel(a.id)} disabled={actioningId === a.id}>{actioningId === a.id ? 'Cancelling…' : 'Cancel appointment'}</button>}
        </article>)}
      </div>}
    </section>
  );
}
