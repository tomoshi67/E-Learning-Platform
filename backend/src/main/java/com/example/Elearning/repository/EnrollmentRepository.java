package com.example.Elearning.repository;

import com.example.Elearning.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByUserEmail(String userEmail);

    boolean existsByUserEmailAndCourseId(String userEmail, Long courseId);
}