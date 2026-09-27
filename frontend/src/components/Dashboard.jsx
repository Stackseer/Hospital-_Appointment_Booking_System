import React, { useEffect, useMemo, useState } from 'react';
import { getDoctors, getAppointments } from '../api/api';
import { Icon } from '../App';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(value) {
  if (!value) return '—';
  const [h, m] = value.slice(0, 5).split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function Dashboard({ onNavigate }) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getDoctors(), getAppointments()])
      .then(([doctorData, appointmentData]) => {
        if (!active) return;
        setDoctors(doctorData || []);
        setAppointments(appointmentData || []);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const scheduled = useMemo(() => appointments
    .filter((a) => a.status === 'SCHEDULED')
    .sort((a, b) => `${a.appointmentDate}T${a.timeSlot}`.localeCompare(`${b.appointmentDate}T${b.timeSlot}`)), [appointments]);

  const nextAppointment = scheduled[0];
  const specializations = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))];

  if (loading) {
    return <div className="dashboard-loading"><div className="spinner" /><p>Preparing your dashboard…</p></div>;
  }

  return (
    <div className="dashboard page-enter">
      {error && <div className="alert alert--error"><Icon name="x" size={17} /> {error}</div>}

      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">PATIENT PORTAL</span>
          <h1>Good evening. <span>Let’s take care of your next visit.</span></h1>
          <p>Book appointments, explore our doctors, and keep your schedule in one place.</p>
          <div className="hero-actions">
            <button className="btn btn--primary" onClick={() => onNavigate('book')}><Icon name="calendar-plus" size={18} /> Book an appointment</button>
            <button className="btn btn--secondary" onClick={() => onNavigate('doctors')}>Find a doctor <Icon name="arrow" size={17} /></button>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orbit hero-orbit--one" />
          <div className="hero-orbit hero-orbit--two" />
          <div className="hero-symbol"><Icon name="heart" size={46} strokeWidth={1.5} /></div>
          <div className="hero-badge hero-badge--top"><Icon name="check" size={15} /> Easy scheduling</div>
          <div className="hero-badge hero-badge--bottom"><span className="mini-dot" /> {doctors.length} doctors available</div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Overview">
        <button className="stat-card" onClick={() => onNavigate('doctors')}>
          <div className="stat-card-top"><span className="stat-icon stat-icon--teal"><Icon name="users" size={20} /></span><Icon name="arrow" size={16} /></div>
          <span className="stat-label">Doctors</span>
          <strong>{doctors.length}</strong>
          <small>{specializations.length || 0} specialties</small>
        </button>
        <button className="stat-card" onClick={() => onNavigate('appointments')}>
          <div className="stat-card-top"><span className="stat-icon stat-icon--sage"><Icon name="calendar" size={20} /></span><Icon name="arrow" size={16} /></div>
          <span className="stat-label">Upcoming visits</span>
          <strong>{scheduled.length}</strong>
          <small>{scheduled.length ? 'You have care scheduled' : 'Nothing scheduled yet'}</small>
        </button>
        <button className="stat-card" onClick={() => onNavigate('appointments')}>
          <div className="stat-card-top"><span className="stat-icon stat-icon--peach"><Icon name="clock" size={20} /></span><Icon name="arrow" size={16} /></div>
          <span className="stat-label">Total appointments</span>
          <strong>{appointments.length}</strong>
          <small>Across your appointment history</small>
        </button>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-card next-card">
          <div className="card-heading">
            <div><span className="eyebrow">YOUR SCHEDULE</span><h2>Next appointment</h2></div>
            <button className="link-btn" onClick={() => onNavigate('appointments')}>View all <Icon name="arrow" size={15} /></button>
          </div>
          {nextAppointment ? (
            <div className="next-appointment">
              <div className="date-tile"><span>{new Date(`${nextAppointment.appointmentDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short' })}</span><strong>{new Date(`${nextAppointment.appointmentDate}T00:00:00`).getDate()}</strong></div>
              <div className="next-details">
                <div className="next-time"><Icon name="clock" size={15} /> {formatTime(nextAppointment.timeSlot)} · {formatDate(nextAppointment.appointmentDate)}</div>
                <h3>{nextAppointment.doctor?.name || 'Doctor'}</h3>
                <p>{nextAppointment.doctor?.specialization || 'Medical appointment'}</p>
                {nextAppointment.reason && <span className="reason-line">{nextAppointment.reason}</span>}
              </div>
              <span className="status-badge status-badge--scheduled">Scheduled</span>
            </div>
          ) : (
            <div className="empty-state empty-state--compact">
              <div className="empty-icon"><Icon name="calendar-plus" size={22} /></div>
              <div><h3>Your calendar is clear</h3><p>Book your next visit when you’re ready.</p></div>
              <button className="btn btn--primary btn--small" onClick={() => onNavigate('book')}>Book now</button>
            </div>
          )}
        </section>

        <section className="dashboard-card quick-card">
          <div className="card-heading"><div><span className="eyebrow">QUICK ACTIONS</span><h2>What do you need?</h2></div></div>
          <div className="quick-list">
            <button onClick={() => onNavigate('book')}><span className="quick-icon"><Icon name="calendar-plus" size={19} /></span><span><strong>Book appointment</strong><small>Choose a doctor &amp; time</small></span><Icon name="chevron" size={18} /></button>
            <button onClick={() => onNavigate('doctors')}><span className="quick-icon"><Icon name="users" size={19} /></span><span><strong>Browse doctors</strong><small>Explore specialties</small></span><Icon name="chevron" size={18} /></button>
            <button onClick={() => onNavigate('appointments')}><span className="quick-icon"><Icon name="calendar" size={19} /></span><span><strong>Manage appointments</strong><small>Review your schedule</small></span><Icon name="chevron" size={18} /></button>
          </div>
        </section>
      </div>

      <section className="trust-strip"><div><span className="trust-icon"><Icon name="shield" size={18} /></span><span><strong>Simple &amp; secure</strong><small>Your appointment details stay within this portal.</small></span></div><span className="trust-note">Spring Boot REST API · React</span></section>
    </div>
  );
}
