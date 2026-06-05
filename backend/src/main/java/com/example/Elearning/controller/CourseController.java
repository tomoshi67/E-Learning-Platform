package com.example.Elearning.controller;

import com.example.Elearning.model.Course;
import com.example.Elearning.repository.CourseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private final CourseRepository courseRepository;

    public CourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @PostMapping("/add")
    public Course addCourse(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    @GetMapping("/all")
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @GetMapping("/instructor/{email}")
    public List<Course> getInstructorCourses(
            @PathVariable String email) {

        return courseRepository.findByInstructorEmail(email);
    }

    @PutMapping("/update/{id}")
    public Course updateCourse(@PathVariable Long id,
                               @RequestBody Course updatedCourse) {

        Course course = courseRepository.findById(id).orElse(null);

        if (course == null) {
            return null;
        }

        course.setTitle(updatedCourse.getTitle());
        course.setDescription(updatedCourse.getDescription());
        course.setCategory(updatedCourse.getCategory());
        course.setInstructorEmail(updatedCourse.getInstructorEmail());

        return courseRepository.save(course);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteCourse(@PathVariable Long id) {

        if (!courseRepository.existsById(id)) {
            return "Course not found";
        }

        courseRepository.deleteById(id);

        return "Course deleted successfully";
    }
}