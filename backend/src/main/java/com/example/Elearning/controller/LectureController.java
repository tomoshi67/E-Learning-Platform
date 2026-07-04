package com.example.Elearning.controller;

import com.example.Elearning.model.Enrollment;
import com.example.Elearning.model.Lecture;
import com.example.Elearning.model.Notification;
import com.example.Elearning.repository.EnrollmentRepository;
import com.example.Elearning.repository.LectureRepository;
import com.example.Elearning.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
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

        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || originalFileName.isBlank()) {
            throw new RuntimeException("File name is missing");
        }

        validateFileType(type, originalFileName);

        String uploadDir = System.getProperty("user.dir") + "/uploads/";

        File folder = new File(uploadDir);
        if (!folder.exists()) {
            folder.mkdirs();
        }



        String finalFileName = getUniqueFileName(uploadDir, originalFileName);
        String filePath = uploadDir + finalFileName;

        System.out.println("UPLOAD DIR = " + uploadDir);
        System.out.println("FINAL FILE NAME = " + finalFileName);
        System.out.println("FILE PATH = " + filePath);

        file.transferTo(new File(filePath));

        Lecture lecture = new Lecture();
        lecture.setTitle(title);
        lecture.setType(type);
        lecture.setFileName(finalFileName);
        lecture.setFilePath(filePath);
        lecture.setCourseId(courseId);
        lecture.setLectureOrder(lectureOrder);

        Lecture savedLecture = lectureRepository.save(lecture);

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);

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

    private void validateFileType(String type, String fileName) {
        String lowerName = fileName.toLowerCase();

        if (type.equalsIgnoreCase("VIDEO")) {
            if (
                    !lowerName.endsWith(".mp4") &&
                            !lowerName.endsWith(".mov") &&
                            !lowerName.endsWith(".mkv") &&
                            !lowerName.endsWith(".webm")
            ) {
                throw new RuntimeException("Selected type is VIDEO, so upload only video files");
            }
        }

        if (type.equalsIgnoreCase("PDF")) {
            if (!lowerName.endsWith(".pdf")) {
                throw new RuntimeException("Selected type is PDF, so upload only PDF files");
            }
        }

        if (type.equalsIgnoreCase("IMAGE")) {
            if (
                    !lowerName.endsWith(".jpg") &&
                            !lowerName.endsWith(".jpeg") &&
                            !lowerName.endsWith(".png") &&
                            !lowerName.endsWith(".webp")
            ) {
                throw new RuntimeException("Selected type is IMAGE, so upload only image files");
            }
        }

        if (type.equalsIgnoreCase("NOTES")) {
            if (
                    !lowerName.endsWith(".txt") &&
                            !lowerName.endsWith(".doc") &&
                            !lowerName.endsWith(".docx") &&
                            !lowerName.endsWith(".ppt") &&
                            !lowerName.endsWith(".pptx")
            ) {
                throw new RuntimeException("Selected type is NOTES, so upload only notes/document files");
            }
        }
    }

    private String getUniqueFileName(String uploadDir, String originalFileName) {
        File originalFile = new File(uploadDir + originalFileName);

        if (!originalFile.exists()) {
            return originalFileName;
        }

        String name = originalFileName;
        String extension = "";

        int dotIndex = originalFileName.lastIndexOf(".");
        if (dotIndex != -1) {
            name = originalFileName.substring(0, dotIndex);
            extension = originalFileName.substring(dotIndex);
        }

        int count = 1;

        while (true) {
            String newFileName = name + count + extension;
            File newFile = new File(uploadDir + newFileName);

            if (!newFile.exists()) {
                return newFileName;
            }

            count++;
        }
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