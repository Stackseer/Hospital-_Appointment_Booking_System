package com.hospital.booking.config;

import com.hospital.booking.model.Doctor;
import com.hospital.booking.model.Patient;
import com.hospital.booking.repository.DoctorRepository;
import com.hospital.booking.repository.PatientRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeDatabase(
            DoctorRepository doctorRepository,
            PatientRepository patientRepository) {

        return args -> {

            // Add doctors only if there are no doctors yet
            if (doctorRepository.count() == 0) {

                doctorRepository.save(new Doctor(
                        "Dr. Ananya Rao",
                        "Cardiology",
                        "ananya.rao@hospital.com",
                        "09:00-17:00"
                ));

                doctorRepository.save(new Doctor(
                        "Dr. Vikram Sen",
                        "Orthopedics",
                        "vikram.sen@hospital.com",
                        "10:00-18:00"
                ));

                doctorRepository.save(new Doctor(
                        "Dr. Meera Iyer",
                        "Dermatology",
                        "meera.iyer@hospital.com",
                        "09:00-14:00"
                ));

                doctorRepository.save(new Doctor(
                        "Dr. Rohan Kapoor",
                        "Pediatrics",
                        "rohan.kapoor@hospital.com",
                        "08:00-16:00"
                ));

                doctorRepository.save(new Doctor(
                        "Dr. Leela Nair",
                        "General Medicine",
                        "leela.nair@hospital.com",
                        "09:00-17:00"
                ));
            }

            // Add patients only if there are no patients yet
            if (patientRepository.count() == 0) {

                patientRepository.save(new Patient(
                        "Aarav Sharma",
                        "aarav.sharma@example.com",
                        "9876543210"
                ));

                patientRepository.save(new Patient(
                        "Diya Patel",
                        "diya.patel@example.com",
                        "9123456780"
                ));
            }
        };
    }
}