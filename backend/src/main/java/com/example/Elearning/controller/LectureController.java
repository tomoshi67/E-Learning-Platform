package com.example.Elearning.controller;

import com.example.Elearning.model.Enrollment;
import com.example.Elearning.model.Lecture;
import com.example.Elearning.model.Notification;
import com.example.Elearning.repository.EnrollmentRepository;
import com.example.Elearning.repository.LectureRepository;
import com.example.Elearning.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.cloudinary.utils.ObjectUtils;
import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.Base64;
import java.util.Map;
import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.net.URL;
import java.io.InputStream;

@RestController
@RequestMapping("/lectures")
@CrossOrigin(origins = "*")
public class LectureController {

    private final EnrollmentRepository enrollmentRepository;
    private final LectureRepository lectureRepository;
    private final NotificationRepository notificationRepository;
    private final Cloudinary cloudinary;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final JsonMapper objectMapper = JsonMapper.builder().build();

    public LectureController(
            LectureRepository lectureRepository,
            NotificationRepository notificationRepository,
            EnrollmentRepository enrollmentRepository,
            Cloudinary cloudinary
    ) {

        this.lectureRepository = lectureRepository;
        this.notificationRepository = notificationRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.cloudinary = cloudinary;
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

        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", "auto"
                )
        );

        String fileUrl = uploadResult.get("secure_url").toString();


        System.out.println("Uploaded to Cloudinary:");
        System.out.println(fileUrl);

        Lecture lecture = new Lecture();
        lecture.setTitle(title);
        lecture.setType(type);
        lecture.setFileName(originalFileName);
        lecture.setFilePath(fileUrl);
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

    @GetMapping("/summarize/{id}")
    public Map<String, String> summarizeLecture(@PathVariable Long id) throws IOException {

        Lecture lecture = lectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lecture not found"));

        String mimeType = detectSummarizableMimeType(lecture.getFileName());

        if (mimeType == null) {
            throw new RuntimeException(
                    "AI summary isn't available for this file type yet. " +
                            "It currently supports PDF and plain text (.txt) notes only - " +
                            "Word/PowerPoint files aren't readable by the AI directly."
            );
        }

        System.out.println("FILE PATH = " + lecture.getFilePath());

        URL fileUrl = new URL(lecture.getFilePath());

        try (InputStream inputStream = fileUrl.openStream()) {

            byte[] fileBytes = inputStream.readAllBytes();
            String base64Data = Base64.getEncoder().encodeToString(fileBytes);

            String prompt =
                    "Summarize the following study material into clear, concise revision notes. " +
                            "Organize it under short headings for each major topic, with bullet points " +
                            "underneath covering the key facts, definitions, and concepts a student would " +
                            "need to remember for an exam. Keep it focused and skip any commentary about " +
                            "the document itself - just the summary content.";

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt),
                                    Map.of("inline_data", Map.of(
                                            "mime_type", mimeType,
                                            "data", base64Data
                                    ))
                            ))
                    )
            );

            String geminiUrl =
                    "https://generativelanguage.googleapis.com/v1beta/models/"
                            + geminiModel
                            + ":generateContent?key="
                            + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(requestBody, headers);

            String rawResponse;

            try {
                rawResponse = restTemplate.postForObject(
                        geminiUrl,
                        request,
                        String.class
                );
            } catch (Exception e) {
                throw new IOException("Gemini API call failed: " + e.getMessage(), e);
            }

            JsonNode root = objectMapper.readTree(rawResponse);

            String summaryText = root
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text")
                    .asText();

            return Map.of(
                    "title", lecture.getTitle(),
                    "summary", summaryText
            );
        }

    }

    private String detectSummarizableMimeType(String fileName) {
        if (fileName == null) {
            return null;
        }

        String lower = fileName.toLowerCase();

        if (lower.endsWith(".pdf")) {
            return "application/pdf";
        }

        if (lower.endsWith(".txt")) {
            return "text/plain";
        }

        return null;
    }
}