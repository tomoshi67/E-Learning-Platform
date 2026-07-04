package com.example.Elearning.controller;

import com.example.Elearning.model.Progress;
import com.example.Elearning.repository.ProgressRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

import java.util.List;

@RestController
@RequestMapping("/progress")
@CrossOrigin(origins = "http://localhost:5173")
public class ProgressController {

    private final ProgressRepository progressRepository;

    public ProgressController(ProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    @PostMapping("/update")
    public Progress updateProgress(@RequestBody Progress progressData) {

        Progress progress = progressRepository
                .findByUserEmailAndLectureId(
                        progressData.getUserEmail(),
                        progressData.getLectureId()
                )
                .orElse(new Progress());

        progress.setUserEmail(progressData.getUserEmail());
        progress.setLectureId(progressData.getLectureId());
        progress.setCompleted(progressData.isCompleted());

        if (progressData.isCompleted()) {
            progress.setCompletedAt(LocalDateTime.now());
        } else {
            progress.setCompletedAt(null);
        }

        return progressRepository.save(progress);
    }

    @GetMapping("/user/{email}")
    public List<Progress> getUserProgress(@PathVariable String email) {
        return progressRepository.findByUserEmail(email);
    }
}