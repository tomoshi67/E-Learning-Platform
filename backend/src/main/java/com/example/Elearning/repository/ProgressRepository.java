package com.example.Elearning.repository;

import com.example.Elearning.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgressRepository extends JpaRepository<Progress, Long> {

    List<Progress> findByUserEmail(String userEmail);

    Optional<Progress> findByUserEmailAndLectureId(String userEmail, Long lectureId);
}