package com.example.Elearning.repository;

import com.example.Elearning.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByInstructorEmail(String instructorEmail);

}