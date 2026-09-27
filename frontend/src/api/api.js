const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // response had no JSON body; fall back to the generic message
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

// --- Doctors ---
export const getDoctors = (specialization) =>
  request(`/doctors${specialization ? `?specialization=${encodeURIComponent(specialization)}` : ''}`);

export const getDoctor = (id) => request(`/doctors/${id}`);

// --- Patients ---
export const getPatients = () => request('/patients');

// --- Appointments ---
export const getAppointments = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/appointments${query ? `?${query}` : ''}`);
};

export const getAppointmentsForDoctorOnDate = (doctorId, date) =>
  request(`/appointments?doctorId=${doctorId}&date=${date}`);

export const bookAppointment = (payload) =>
  request('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const cancelAppointment = (id) =>
  request(`/appointments/${id}/cancel`, { method: 'PATCH' });

export const updateAppointmentStatus = (id, status) =>
  request(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const rescheduleAppointment = (id, appointmentDate, timeSlot) =>
  request(`/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({ appointmentDate, timeSlot }),
  });

export const deleteAppointment = (id) =>
  request(`/appointments/${id}`, { method: 'DELETE' });
