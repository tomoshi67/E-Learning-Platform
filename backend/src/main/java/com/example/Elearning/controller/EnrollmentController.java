package com.example.Elearning.controller;

import com.example.Elearning.model.Enrollment;
import com.example.Elearning.repository.EnrollmentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enrollments")
@CrossOrigin(origins = "http://localhost:5173")
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;

    public EnrollmentController(EnrollmentRepository enrollmentRepository) {
        this.enrollmentRepository = enrollmentRepository;
    }

    @PostMapping("/enroll")
    public String enrollCourse(@RequestBody Enrollment enrollment) {

        boolean alreadyEnrolled = enrollmentRepository
                .existsByUserEmailAndCourseId(
                        enrollment.getUserEmail(),
                        enrollment.getCourseId()
                );

        if (alreadyEnrolled) {
            return "Already enrolled in this course";
        }

        enrollmentRepository.save(enrollment);

        return "Enrolled successfully";
    }

    @GetMapping("/user/{email}")
    public List<Enrollment> getUserEnrollments(@PathVariable String email) {
        return enrollmentRepository.findByUserEmail(email);
    }

    @GetMapping("/course/{courseId}")
    public List<Enrollment> getCourseEnrollments(@PathVariable Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }
}