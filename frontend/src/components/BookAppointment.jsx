import React, { useEffect, useMemo, useState } from 'react';
import { getDoctors, getAppointmentsForDoctorOnDate, bookAppointment } from '../api/api';
import { Icon } from '../App';

const ALL_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 30;
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const mm = String(totalMinutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
});

function todayISO() { return new Date().toISOString().slice(0, 10); }
function prettyDate(value) { return value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select date'; }
function prettyTime(value) { if (!value) return 'Select time'; const [h, m] = value.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }

export default function BookAppointment({ onBooked }) {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [takenSlots, setTakenSlots] = useState([]);
  const [slot, setSlot] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { getDoctors().then(setDoctors).catch((err) => setError(err.message)); }, []);

  useEffect(() => {
    if (!doctorId || !date) { setTakenSlots([]); return; }
    setSlotsLoading(true); setSlot('');
    getAppointmentsForDoctorOnDate(doctorId, date)
      .then((appointments) => setTakenSlots((appointments || []).filter((a) => a.status === 'SCHEDULED').map((a) => a.timeSlot.slice(0, 5))))
      .catch((err) => setError(err.message))
      .finally(() => setSlotsLoading(false));
  }, [doctorId, date]);

  const availableSlots = useMemo(() => ALL_SLOTS.filter((s) => !takenSlots.includes(s)), [takenSlots]);
  const selectedDoctor = doctors.find((d) => String(d.id) === String(doctorId));
  const canStep2 = Boolean(doctorId && date);
  const canStep3 = Boolean(canStep2 && slot);
  const canSubmit = Boolean(canStep3 && name.trim() && email.trim() && !submitting);

  const goNext = () => { setError(''); if (step === 1 && canStep2) setStep(2); else if (step === 2 && canStep3) setStep(3); };
  const goBack = () => { setError(''); setStep((current) => Math.max(1, current - 1)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true); setError('');
    try {
      const appointment = await bookAppointment({ doctorId: Number(doctorId), newPatient: { name: name.trim(), email: email.trim(), phone: phone.trim() }, appointmentDate: date, timeSlot: `${slot}:00`, reason: reason.trim() });
      onBooked?.(appointment);
    } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  };

  return (
    <section className="booking-page page-enter">
      <div className="page-header-row booking-header"><div><span className="eyebrow">NEW APPOINTMENT</span><h1>Book a visit</h1><p>Pick a doctor, choose a convenient time, and confirm your details.</p></div></div>

      <div className="booking-layout">
        <div className="booking-main">
          <div className="stepper" aria-label="Booking progress">
            {[['1', 'Doctor'], ['2', 'Date & time'], ['3', 'Your details']].map(([number, label], index) => { const current = index + 1; return <div className={`step ${step >= current ? 'step--active' : ''} ${step > current ? 'step--done' : ''}`} key={number}><span className="step-number">{step > current ? <Icon name="check" size={15} /> : number}</span><span>{label}</span>{current < 3 && <span className="step-line" />}</div>; })}
          </div>

          <form className="booking-card" onSubmit={handleSubmit}>
            {step === 1 && <div className="booking-step">
              <div className="step-title"><div><span className="eyebrow">STEP 1 OF 3</span><h2>Who would you like to see?</h2><p>Select a doctor from the care team.</p></div></div>
              <div className="doctor-select-grid">
                {doctors.map((doctor) => <button type="button" className={`doctor-select ${String(doctorId) === String(doctor.id) ? 'doctor-select--selected' : ''}`} key={doctor.id} onClick={() => setDoctorId(String(doctor.id))}><span className="doctor-select-avatar">{doctor.name?.split(' ').map((x) => x[0]).slice(0, 2).join('')}</span><span><strong>{doctor.name}</strong><small>{doctor.specialization}</small></span>{String(doctorId) === String(doctor.id) && <span className="selected-check"><Icon name="check" size={14} /></span>}</button>)}
              </div>
              {doctors.length === 0 && <p className="muted-text">No doctors are available right now.</p>}
              <div className="step-footer"><span>{selectedDoctor ? `${selectedDoctor.name} selected` : 'Choose a doctor to continue'}</span><button type="button" className="btn btn--primary" disabled={!canStep2} onClick={goNext}>Continue <Icon name="arrow" size={17} /></button></div>
            </div>}

            {step === 2 && <div className="booking-step">
              <div className="step-title"><div><span className="eyebrow">STEP 2 OF 3</span><h2>Choose your time</h2><p>Appointments are available in 30-minute slots.</p></div></div>
              <div className="selected-doctor-banner"><span className="doctor-select-avatar">{selectedDoctor?.name?.split(' ').map((x) => x[0]).slice(0, 2).join('')}</span><div><strong>{selectedDoctor?.name}</strong><small>{selectedDoctor?.specialization}</small></div><button type="button" className="text-btn" onClick={() => setStep(1)}>Change</button></div>
              <label className="field"><span className="field-label">Appointment date</span><input className="input" type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} required /></label>
              <div className="field"><span className="field-label">Available times</span>{slotsLoading ? <div className="slot-loading"><div className="spinner spinner--small" /> Checking availability…</div> : availableSlots.length ? <div className="slot-grid slot-grid--modern">{availableSlots.map((s) => <button type="button" key={s} className={`slot-btn ${slot === s ? 'slot-btn--selected' : ''}`} onClick={() => setSlot(s)}>{prettyTime(s)}</button>)}</div> : <div className="empty-inline">No open slots for this date. Try another day.</div>}</div>
              <div className="step-footer"><button type="button" className="btn btn--secondary" onClick={goBack}>Back</button><button type="button" className="btn btn--primary" disabled={!canStep3} onClick={goNext}>Continue <Icon name="arrow" size={17} /></button></div>
            </div>}

            {step === 3 && <div className="booking-step">
              <div className="step-title"><div><span className="eyebrow">STEP 3 OF 3</span><h2>Tell us about the patient</h2><p>These details are used to create the appointment.</p></div></div>
              <div className="booking-summary"><div><span>Doctor</span><strong>{selectedDoctor?.name}</strong></div><div><span>Date</span><strong>{prettyDate(date)}</strong></div><div><span>Time</span><strong>{prettyTime(slot)}</strong></div></div>
              <div className="field-grid"><label className="field"><span className="field-label">Patient name *</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required /></label><label className="field"><span className="field-label">Email *</span><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label><label className="field"><span className="field-label">Phone</span><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" /></label><label className="field"><span className="field-label">Reason for visit</span><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional" /></label></div>
              {error && <div className="alert alert--error"><Icon name="x" size={17} /> {error}</div>}
              <div className="step-footer"><button type="button" className="btn btn--secondary" onClick={goBack}>Back</button><button type="submit" className="btn btn--primary" disabled={!canSubmit}>{submitting ? <><span className="button-spinner" /> Booking…</> : <><Icon name="check" size={17} /> Confirm appointment</>}</button></div>
            </div>}
            {step !== 3 && error && <div className="alert alert--error booking-error"><Icon name="x" size={17} /> {error}</div>}
          </form>
        </div>

        <aside className="booking-side">
          <div className="booking-side-card"><span className="eyebrow">YOUR SELECTION</span><h3>Appointment summary</h3><div className="summary-row"><span>Doctor</span><strong>{selectedDoctor?.name || 'Not selected'}</strong></div><div className="summary-row"><span>Date</span><strong>{date ? prettyDate(date) : 'Not selected'}</strong></div><div className="summary-row"><span>Time</span><strong>{slot ? prettyTime(slot) : 'Not selected'}</strong></div><div className="summary-divider" /><div className="summary-help"><span className="summary-help-icon"><Icon name="shield" size={16} /></span><p>Your booking is checked against existing appointments to prevent double-booking.</p></div></div>
          <div className="booking-side-note"><Icon name="clock" size={17} /><div><strong>Clinic hours</strong><span>Appointments are offered from 9:00 AM to 5:00 PM.</span></div></div>
        </aside>
      </div>
    </section>
  );
}
