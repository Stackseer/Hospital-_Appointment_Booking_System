import React, { useEffect, useMemo, useState } from 'react';
import { getDoctors } from '../api/api';
import { Icon } from '../App';

const initials = (name = '') => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

export default function DoctorList({ onNavigate }) {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDoctors(search.trim())
      .then((data) => !cancelled && setDoctors(data || []))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [search]);

  const specializations = useMemo(() => [...new Set(doctors.map((d) => d.specialization).filter(Boolean))], [doctors]);

  return (
    <section className="page-enter">
      <div className="page-header-row">
        <div><span className="eyebrow">CARE TEAM</span><h1>Find your doctor</h1><p>Browse the available doctors and choose the right specialty for your visit.</p></div>
        <button className="btn btn--primary" onClick={() => onNavigate?.('book')}><Icon name="calendar-plus" size={18} /> Book appointment</button>
      </div>

      <div className="directory-toolbar">
        <div className="search-box"><Icon name="search" size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by specialty…" aria-label="Search doctors" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><Icon name="x" size={15} /></button>}</div>
        <span className="result-count">{loading ? 'Searching…' : `${doctors.length} doctor${doctors.length === 1 ? '' : 's'}`}</span>
      </div>

      {error && <div className="alert alert--error"><Icon name="x" size={17} /> {error}</div>}
      {loading ? (
        <div className="doctor-grid">{[1, 2, 3, 4].map((item) => <div className="doctor-card skeleton-card" key={item}><div className="skeleton skeleton-avatar" /><div className="skeleton skeleton-line skeleton-line--long" /><div className="skeleton skeleton-line" /></div>)}</div>
      ) : doctors.length === 0 ? (
        <div className="empty-state empty-state--large"><div className="empty-icon"><Icon name="search" size={24} /></div><h3>No doctors found</h3><p>Try a different specialty or clear your search.</p><button className="btn btn--secondary" onClick={() => setSearch('')}>Clear search</button></div>
      ) : (
        <div className="doctor-grid">
          {doctors.map((doctor) => (
            <article className="doctor-card" key={doctor.id}>
              <div className="doctor-card-top"><div className="doctor-avatar">{initials(doctor.name)}</div><span className="availability"><span /> Available</span></div>
              <div className="doctor-body"><span className="specialty-chip">{doctor.specialization || 'General care'}</span><h2>{doctor.name}</h2><p className="doctor-email">{doctor.email || 'Contact through appointment desk'}</p>{doctor.availableHours && <div className="hours"><Icon name="clock" size={15} /> {doctor.availableHours}</div>}</div>
              <button className="doctor-book-btn" onClick={() => onNavigate?.('book')}>Book with doctor <Icon name="arrow" size={16} /></button>
            </article>
          ))}
        </div>
      )}
      {specializations.length > 0 && <p className="page-footnote">Specialties currently listed: {specializations.join(' · ')}</p>}
    </section>
  );
}
