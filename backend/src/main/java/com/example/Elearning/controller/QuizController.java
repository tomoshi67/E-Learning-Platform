package com.example.Elearning.controller;

import com.example.Elearning.model.Quiz;
import com.example.Elearning.repository.QuizRepository;
import org.springframework.web.bind.annotation.*;
import com.example.Elearning.model.Notification;
import com.example.Elearning.repository.NotificationRepository;
import java.time.LocalDateTime;
import com.example.Elearning.model.Enrollment;
import com.example.Elearning.repository.EnrollmentRepository;

import java.util.List;

import java.util.List;

@RestController
@RequestMapping("/quizzes")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizController {

    private final NotificationRepository notificationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuizRepository quizRepository;

    public QuizController(
            QuizRepository quizRepository,
            NotificationRepository notificationRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.quizRepository = quizRepository;
        this.notificationRepository = notificationRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @PostMapping("/add")
    public Quiz addQuiz(@RequestBody Quiz quiz) {
        Quiz savedQuiz = quizRepository.save(quiz);

        List<Enrollment> enrollments =
                enrollmentRepository.findByCourseId(quiz.getCourseId());

        for (Enrollment enrollment : enrollments) {
            Notification notification = new Notification();
            notification.setCourseId(quiz.getCourseId());
            notification.setUserEmail(enrollment.getUserEmail());
            notification.setType("QUIZ");
            notification.setMessage("New quiz added: " + quiz.getTitle());
            notification.setCreatedAt(LocalDateTime.now());
            notification.setSeen(false);

            notificationRepository.save(notification);
        }

        return savedQuiz;
    }

    @GetMapping("/course/{courseId}")
    public List<Quiz> getQuizzesByCourse(@PathVariable Long courseId) {
        return quizRepository.findByCourseId(courseId);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteQuiz(@PathVariable Long id) {
        quizRepository.deleteById(id);
        return "Quiz deleted successfully";
    }
}