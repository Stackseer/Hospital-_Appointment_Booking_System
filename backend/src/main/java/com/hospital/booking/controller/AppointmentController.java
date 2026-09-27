package com.hospital.booking.controller;

import com.hospital.booking.model.Appointment;
import com.hospital.booking.model.AppointmentStatus;
import com.hospital.booking.model.BookingRequest;
import com.hospital.booking.model.Patient;
import com.hospital.booking.service.AppointmentService;
import com.hospital.booking.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final PatientService patientService;

    public AppointmentController(AppointmentService appointmentService, PatientService patientService) {
        this.appointmentService = appointmentService;
        this.patientService = patientService;
    }

    @GetMapping
    public List<Appointment> getAppointments(@RequestParam(required = false) Long doctorId,
                                              @RequestParam(required = false) Long patientId,
                                              @RequestParam(required = false)
                                              @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE)
                                              LocalDate date) {
        if (doctorId != null && date != null) {
            return appointmentService.getAppointmentsForDoctorOnDate(doctorId, date);
        }
        if (doctorId != null) {
            return appointmentService.getAppointmentsForDoctor(doctorId);
        }
        if (patientId != null) {
            return appointmentService.getAppointmentsForPatient(patientId);
        }
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/{id}")
    public Appointment getAppointment(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id);
    }

    /**
     * Books an appointment. Accepts either an existing patientId or a newPatient object
     * (which is created, or matched by email if it already exists).
     * Returns 409 Conflict if the doctor is already booked for that date + time slot.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment bookAppointment(@Valid @RequestBody BookingRequest request) {
        Long patientId = request.getPatientId();

        if (patientId == null) {
            if (request.getNewPatient() == null) {
                throw new IllegalArgumentException("Provide either patientId or newPatient");
            }
            Patient patient = patientService.findOrCreatePatient(request.getNewPatient());
            patientId = patient.getId();
        }

        Appointment appointment = new Appointment();
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setReason(request.getReason());

        return appointmentService.bookAppointment(request.getDoctorId(), patientId, appointment);
    }

    @PatchMapping("/{id}/reschedule")
    public Appointment reschedule(@PathVariable Long id, @RequestBody Map<String, String> body) {
        LocalDate newDate = LocalDate.parse(body.get("appointmentDate"));
        LocalTime newSlot = LocalTime.parse(body.get("timeSlot"));
        return appointmentService.rescheduleAppointment(id, newDate, newSlot);
    }

    @PatchMapping("/{id}/status")
    public Appointment updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        AppointmentStatus status = AppointmentStatus.valueOf(body.get("status").toUpperCase());
        return appointmentService.updateStatus(id, status);
    }

    @PatchMapping("/{id}/cancel")
    public Appointment cancel(@PathVariable Long id) {
        return appointmentService.cancelAppointment(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}
