package com.example.Elearning.repository;

import com.example.Elearning.model.DoubtMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoubtMessageRepository extends JpaRepository<DoubtMessage, Long> {

    List<DoubtMessage> findByCourseIdAndUserEmailOrderByCreatedAtAsc(Long courseId, String userEmail);
}