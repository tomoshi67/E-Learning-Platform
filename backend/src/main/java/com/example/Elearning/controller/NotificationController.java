package com.example.Elearning.controller;

import com.example.Elearning.model.Notification;
import com.example.Elearning.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/user/{email}")
    public List<Notification> getUserNotifications(@PathVariable String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    @GetMapping("/has-unread/{email}")
    public boolean hasUnreadNotifications(@PathVariable String email) {
        return notificationRepository.existsByUserEmailAndSeenFalse(email);
    }

    @PutMapping("/mark-all-read/{email}")
    public String markAllRead(@PathVariable String email) {
        List<Notification> notifications =
                notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);

        for (Notification notification : notifications) {
            notification.setSeen(true);
        }

        notificationRepository.saveAll(notifications);

        return "Notifications marked as read";
    }
}