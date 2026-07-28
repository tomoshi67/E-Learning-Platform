package com.example.Elearning.controller;

import com.example.Elearning.model.Quiz;
import com.example.Elearning.model.QuizQuestion;
import com.example.Elearning.repository.EnrollmentRepository;
import com.example.Elearning.repository.QuizQuestionRepository;
import com.example.Elearning.repository.QuizRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/quiz-questions")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizQuestionController {

    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizRepository quizRepository;
    private final EnrollmentRepository enrollmentRepository;

    public QuizQuestionController(
            QuizQuestionRepository quizQuestionRepository,
            QuizRepository quizRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.quizQuestionRepository = quizQuestionRepository;
        this.quizRepository = quizRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @PostMapping("/add")
    public QuizQuestion addQuestion(@RequestBody QuizQuestion question) {
        return quizQuestionRepository.save(question);
    }

    // New: save many questions at once - used after the instructor reviews
    // AI-generated questions from /quizzes/generate-ai
    @PostMapping("/add-bulk")
    public List<QuizQuestion> addQuestionsBulk(@RequestBody List<QuizQuestion> questions) {
        return quizQuestionRepository.saveAll(questions);
    }

    @GetMapping("/quiz/{quizId}")
    public List<QuizQuestion> getQuestionsByQuiz(@PathVariable Long quizId) {
        Quiz quiz = quizRepository.findById(quizId).orElse(null);

        if (quiz != null) {
            verifyStudentEnrollment(quiz.getCourseId());
        }

        return quizQuestionRepository.findByQuizId(quizId);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteQuestion(@PathVariable Long id) {
        quizQuestionRepository.deleteById(id);
        return "Question deleted successfully";
    }

    // Students (ROLE_USER) can only view questions for quizzes belonging to a
    // course they're actually enrolled in. Instructors/admins are unrestricted here.
    private void verifyStudentEnrollment(Long courseId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        boolean isStudent = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));

        if (!isStudent) {
            return;
        }

        String email = auth.getName();
        boolean enrolled = enrollmentRepository.existsByUserEmailAndCourseId(email, courseId);

        if (!enrolled) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not enrolled in this course"
            );
        }
    }
}