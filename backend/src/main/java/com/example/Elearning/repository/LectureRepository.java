package com.example.Elearning.repository;

import com.example.Elearning.model.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LectureRepository extends JpaRepository<Lecture, Long> {

    List<Lecture> findByCourseId(Long courseId);
    List<Lecture> findByCourseIdOrderByLectureOrderAsc(Long courseId);
}