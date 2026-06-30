package com.example.Elearning.controller;

import com.example.Elearning.model.Lecture;
import com.example.Elearning.repository.LectureRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.Elearning.model.Notification;
import com.example.Elearning.repository.NotificationRepository;
import java.time.LocalDateTime;
import com.example.Elearning.model.Enrollment;
import com.example.Elearning.repository.EnrollmentRepository;

import java.util.List;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/lectures")
@CrossOrigin(origins = "*")
public class LectureController {


    private final EnrollmentRepository enrollmentRepository;
    private final LectureRepository lectureRepository;
    private final NotificationRepository notificationRepository;
    public LectureController(
            LectureRepository lectureRepository,
            NotificationRepository notificationRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.lectureRepository = lectureRepository;
        this.notificationRepository = notificationRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @PostMapping("/upload/{courseId}")
    public Lecture uploadLecture(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam("type") String type,
            @RequestParam("lectureOrder") Integer lectureOrder,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        String uploadDir = System.getProperty("user.dir") + "/uploads/";

        File folder = new File(uploadDir);
        if (!folder.exists()) {
            folder.mkdirs();
        }

        String filePath = uploadDir + file.getOriginalFilename();

        file.transferTo(new File(filePath));

        Lecture lecture = new Lecture();
        lecture.setTitle(title);
        lecture.setType(type);
        lecture.setFileName(file.getOriginalFilename());
        lecture.setFilePath(filePath);
        lecture.setCourseId(courseId);
        lecture.setLectureOrder(lectureOrder);

        Lecture savedLecture = lectureRepository.save(lecture);

        List<Enrollment> enrollments =
                enrollmentRepository.findByCourseId(courseId);

        for (Enrollment enrollment : enrollments) {
            Notification notification = new Notification();
            notification.setCourseId(courseId);
            notification.setUserEmail(enrollment.getUserEmail());
            notification.setType("LECTURE");
            notification.setMessage("New lecture added: " + title);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setSeen(false);

            notificationRepository.save(notification);
        }

        return savedLecture;
    }

    @GetMapping("/course/{courseId}")
    public List<Lecture> getLecturesByCourse(@PathVariable Long courseId) {
        return lectureRepository.findByCourseIdOrderByLectureOrderAsc(courseId);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteLecture(@PathVariable Long id) {
        lectureRepository.deleteById(id);
        return "Lecture deleted successfully";
    }
    @PutMapping("/update-order/{id}")
    public Lecture updateLectureOrder(
            @PathVariable Long id,
            @RequestParam("lectureOrder") Integer lectureOrder
    ) {
        Lecture lecture = lectureRepository.findById(id).orElseThrow();

        lecture.setLectureOrder(lectureOrder);

        return lectureRepository.save(lecture);
    }
}
