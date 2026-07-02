package com.example.Elearning.repository;

import com.example.Elearning.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByCourseIdOrderByCreatedAtAsc(Long courseId);

    long countByCourseIdAndSenderEmailNot(Long courseId, String senderEmail);

    long countByCourseIdAndSenderEmailNotAndCreatedAtAfter(
            Long courseId,
            String senderEmail,
            LocalDateTime createdAt
    );
}