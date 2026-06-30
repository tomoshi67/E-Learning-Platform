package com.example.Elearning.repository;

import com.example.Elearning.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserEmail(String userEmail);

    Optional<QuizAttempt> findByUserEmailAndQuizId(String userEmail, Long quizId);
}