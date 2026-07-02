package com.example.Elearning.repository;

import com.example.Elearning.model.ChatSeen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatSeenRepository extends JpaRepository<ChatSeen, Long> {

    Optional<ChatSeen> findByUserEmailAndCourseId(String userEmail, Long courseId);
}