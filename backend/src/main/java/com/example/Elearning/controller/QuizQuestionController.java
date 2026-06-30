package com.example.Elearning.controller;

import com.example.Elearning.model.QuizQuestion;
import com.example.Elearning.repository.QuizQuestionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quiz-questions")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizQuestionController {

    private final QuizQuestionRepository quizQuestionRepository;

    public QuizQuestionController(QuizQuestionRepository quizQuestionRepository) {
        this.quizQuestionRepository = quizQuestionRepository;
    }

    @PostMapping("/add")
    public QuizQuestion addQuestion(@RequestBody QuizQuestion question) {
        return quizQuestionRepository.save(question);
    }

    @GetMapping("/quiz/{quizId}")
    public List<QuizQuestion> getQuestionsByQuiz(@PathVariable Long quizId) {
        return quizQuestionRepository.findByQuizId(quizId);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteQuestion(@PathVariable Long id) {
        quizQuestionRepository.deleteById(id);
        return "Question deleted successfully";
    }
}