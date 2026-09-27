package com.hospital.booking.service;

import com.hospital.booking.exception.DoubleBookingException;
import com.hospital.booking.exception.ResourceNotFoundException;
import com.hospital.booking.model.Appointment;
import com.hospital.booking.model.AppointmentStatus;
import com.hospital.booking.model.Doctor;
import com.hospital.booking.model.Patient;
import com.hospital.booking.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;
    private final PatientService patientService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                               DoctorService doctorService,
                               PatientService patientService) {
        this.appointmentRepository = appointmentRepository;
        this.doctorService = doctorService;
        this.patientService = patientService;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id " + id));
    }

    public List<Appointment> getAppointmentsForDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAppointmentsForPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsForDoctorOnDate(Long doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
    }

    /**
     * Books a new appointment. Rejects the request if:
     *  - the referenced doctor or patient does not exist, or
     *  - the doctor already has a scheduled appointment at that exact date + time slot.
     */
    @Transactional
    public Appointment bookAppointment(Long doctorId, Long patientId, Appointment request) {
        Doctor doctor = doctorService.getDoctorById(doctorId);
        Patient patient = patientService.getPatientById(patientId);

        boolean slotTaken = appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlot(
                doctorId, request.getAppointmentDate(), request.getTimeSlot());

        if (slotTaken) {
            throw new DoubleBookingException(
                    "Dr. " + doctor.getName() + " already has an appointment booked at "
                            + request.getTimeSlot() + " on " + request.getAppointmentDate());
        }

        Appointment appointment = new Appointment(
                patient, doctor, request.getAppointmentDate(), request.getTimeSlot(), request.getReason());
        appointment.setStatus(AppointmentStatus.SCHEDULED);

        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment rescheduleAppointment(Long id, LocalDate newDate, java.time.LocalTime newSlot) {
        Appointment appointment = getAppointmentById(id);

        boolean slotTaken = appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlot(
                appointment.getDoctor().getId(), newDate, newSlot);
        if (slotTaken) {
            throw new DoubleBookingException("That slot is already booked for this doctor.");
        }

        appointment.setAppointmentDate(newDate);
        appointment.setTimeSlot(newSlot);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = getAppointmentById(id);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment cancelAppointment(Long id) {
        return updateStatus(id, AppointmentStatus.CANCELLED);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);
        appointmentRepository.delete(appointment);
    }
}
