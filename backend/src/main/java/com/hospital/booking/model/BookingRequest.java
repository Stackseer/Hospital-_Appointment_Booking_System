package com.hospital.booking.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Payload used by POST /api/appointments.
 * Accepts either an existing patientId, or a full new-patient object to create on the fly.
 */
public class BookingRequest {

    private Long patientId;

    @Valid
    private Patient newPatient;

    @NotNull(message = "doctorId is required")
    private Long doctorId;

    @NotNull(message = "Appointment date is required")
    private LocalDate appointmentDate;

    @NotNull(message = "Time slot is required")
    private LocalTime timeSlot;

    private String reason;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Patient getNewPatient() { return newPatient; }
    public void setNewPatient(Patient newPatient) { this.newPatient = newPatient; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }

    public LocalTime getTimeSlot() { return timeSlot; }
    public void setTimeSlot(LocalTime timeSlot) { this.timeSlot = timeSlot; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
