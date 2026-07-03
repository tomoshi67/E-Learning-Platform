package com.example.Elearning.controller;

import com.example.Elearning.model.*;
import com.example.Elearning.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.Elearning.Role;
import java.util.List;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepository;
    private final AdminRequestRepository adminRequestRepository;
    private final CourseRepository courseRepository;
    private final LectureRepository lectureRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(
            UserRepository userRepository,
            AdminRequestRepository adminRequestRepository,
            CourseRepository courseRepository,
            LectureRepository lectureRepository,
            QuizRepository quizRepository,
            QuizQuestionRepository quizQuestionRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.adminRequestRepository = adminRequestRepository;
        this.courseRepository = courseRepository;
        this.lectureRepository = lectureRepository;
        this.quizRepository = quizRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/users/delete/{id}")
    public String deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return "User deleted successfully";
    }

    @GetMapping("/admin-requests")
    public List<AdminRequest> getPendingAdminRequests() {
        return adminRequestRepository.findByStatus("PENDING");
    }

    @PostMapping("/admin-requests/approve/{id}")
    public String approveAdminRequest(@PathVariable Long id) {
        AdminRequest request = adminRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ADMIN);

        userRepository.save(user);

        request.setStatus("APPROVED");
        adminRequestRepository.save(request);

        return "Admin request approved";
    }

    @PostMapping("/admin-requests/reject/{id}")
    public String rejectAdminRequest(@PathVariable Long id) {
        AdminRequest request = adminRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus("REJECTED");
        adminRequestRepository.save(request);

        return "Admin request rejected";
    }

    @GetMapping("/instructors")
    public List<User> getInstructors() {
        return userRepository.findByRole(Role.INSTRUCTOR);
    }

    @GetMapping("/courses/instructor/{email}")
    public List<Course> getCoursesByInstructor(@PathVariable String email) {
        return courseRepository.findByInstructorEmail(email);
    }

    @GetMapping("/courses")
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @PutMapping("/courses/update/{id}")
    public Course updateCourse(@PathVariable Long id, @RequestBody Course courseData) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        course.setTitle(courseData.getTitle());
        course.setDescription(courseData.getDescription());
        course.setCategory(courseData.getCategory());
        course.setPrice(courseData.getPrice());

        return courseRepository.save(course);
    }

    @DeleteMapping("/courses/delete/{id}")
    public String deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
        return "Course deleted successfully";
    }

    @DeleteMapping("/lectures/delete/{id}")
    public String deleteLecture(@PathVariable Long id) {
        lectureRepository.deleteById(id);
        return "Lecture deleted successfully";
    }

    @DeleteMapping("/quizzes/delete/{id}")
    public String deleteQuiz(@PathVariable Long id) {
        quizRepository.deleteById(id);
        return "Quiz deleted successfully";
    }

    @DeleteMapping("/quiz-questions/delete/{id}")
    public String deleteQuizQuestion(@PathVariable Long id) {
        quizQuestionRepository.deleteById(id);
        return "Quiz question deleted successfully";
    }
}