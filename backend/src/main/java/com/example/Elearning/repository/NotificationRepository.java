package com.example.Elearning.repository;

import com.example.Elearning.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    boolean existsByUserEmailAndSeenFalse(String userEmail);
}