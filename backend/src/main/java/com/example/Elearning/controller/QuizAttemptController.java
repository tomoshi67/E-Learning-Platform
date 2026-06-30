package com.example.Elearning.controller;

import com.example.Elearning.model.QuizAttempt;
import com.example.Elearning.repository.QuizAttemptRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/quiz-attempts")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizAttemptController {

    private final QuizAttemptRepository quizAttemptRepository;

    public QuizAttemptController(QuizAttemptRepository quizAttemptRepository) {
        this.quizAttemptRepository = quizAttemptRepository;
    }

    @PostMapping("/save")
    public QuizAttempt saveAttempt(@RequestBody QuizAttempt attemptData) {

        QuizAttempt attempt = quizAttemptRepository
                .findByUserEmailAndQuizId(
                        attemptData.getUserEmail(),
                        attemptData.getQuizId()
                )
                .orElse(new QuizAttempt());

        attempt.setUserEmail(attemptData.getUserEmail());
        attempt.setQuizId(attemptData.getQuizId());
        attempt.setScore(attemptData.getScore());
        attempt.setTotalQuestions(attemptData.getTotalQuestions());
        attempt.setCompleted(true);
        attempt.setAttemptedAt(LocalDateTime.now());

        return quizAttemptRepository.save(attempt);
    }

    @GetMapping("/user/{email}")
    public List<QuizAttempt> getUserAttempts(@PathVariable String email) {
        return quizAttemptRepository.findByUserEmail(email);
    }
}