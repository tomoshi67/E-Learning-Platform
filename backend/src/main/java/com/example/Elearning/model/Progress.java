package com.example.Elearning.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    private Long lectureId;

    private boolean completed;

    private LocalDateTime completedAt;

    public Long getId() {
        return id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Long getLectureId() {
        return lectureId;
    }

    public void setLectureId(Long lectureId) {
        this.lectureId = lectureId;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}