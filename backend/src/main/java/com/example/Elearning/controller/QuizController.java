package com.example.Elearning.controller;

import com.example.Elearning.model.Quiz;
import com.example.Elearning.model.QuizQuestion;
import com.example.Elearning.repository.QuizRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.example.Elearning.model.Notification;
import com.example.Elearning.repository.NotificationRepository;
import java.time.LocalDateTime;
import com.example.Elearning.model.Enrollment;
import com.example.Elearning.repository.EnrollmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/quizzes")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizController {

    private final NotificationRepository notificationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuizRepository quizRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final JsonMapper objectMapper = JsonMapper.builder().build();

    public QuizController(
            QuizRepository quizRepository,
            NotificationRepository notificationRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.quizRepository = quizRepository;
        this.notificationRepository = notificationRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @PostMapping("/add")
    public Quiz addQuiz(@RequestBody Quiz quiz) {
        Quiz savedQuiz = quizRepository.save(quiz);

        List<Enrollment> enrollments =
                enrollmentRepository.findByCourseId(quiz.getCourseId());

        for (Enrollment enrollment : enrollments) {
            Notification notification = new Notification();
            notification.setCourseId(quiz.getCourseId());
            notification.setUserEmail(enrollment.getUserEmail());
            notification.setType("QUIZ");
            notification.setMessage("New quiz added: " + quiz.getTitle());
            notification.setCreatedAt(LocalDateTime.now());
            notification.setSeen(false);

            notificationRepository.save(notification);
        }

        return savedQuiz;
    }

    @GetMapping("/course/{courseId}")
    public List<Quiz> getQuizzesByCourse(@PathVariable Long courseId) {
        verifyStudentEnrollment(courseId);
        return quizRepository.findByCourseId(courseId);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteQuiz(@PathVariable Long id) {
        quizRepository.deleteById(id);
        return "Quiz deleted successfully";
    }

    // ---------- New: AI quiz generation from uploaded image/PDF ----------
    // Returns extracted questions WITHOUT saving them (quizId is left null).
    // Instructor reviews them in the UI, then:
    //   1. calls /quizzes/add to create the Quiz and get its id
    //   2. sets that id on each question and calls /quiz-questions/add-bulk
    @PostMapping("/generate-ai")
    public List<QuizQuestion> generateQuizFromFile(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        String mimeType = file.getContentType();
        if (mimeType == null) {
            mimeType = "application/octet-stream";
        }

        String base64Data = Base64.getEncoder().encodeToString(file.getBytes());

        String prompt =
                "You are given an image or PDF containing exam/quiz questions. " +
                        "Extract every distinct question you can find. " +
                        "If a question already has multiple-choice options in the source, use them exactly as written. " +
                        "If a question does not have options (e.g. it's a short-answer or descriptive question), " +
                        "generate 4 plausible options (A-D) based on the question's subject matter, " +
                        "with exactly one being correct. " +
                        "For correctAnswer, respond with only the letter: A, B, C, or D. " +
                        "Return ONLY the structured data, no extra commentary.";

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt),
                                Map.of("inline_data", Map.of(
                                        "mime_type", mimeType,
                                        "data", base64Data
                                ))
                        ))
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "responseSchema", Map.of(
                                "type", "ARRAY",
                                "items", Map.of(
                                        "type", "OBJECT",
                                        "properties", Map.of(
                                                "question", Map.of("type", "STRING"),
                                                "optionA", Map.of("type", "STRING"),
                                                "optionB", Map.of("type", "STRING"),
                                                "optionC", Map.of("type", "STRING"),
                                                "optionD", Map.of("type", "STRING"),
                                                "correctAnswer", Map.of("type", "STRING")
                                        ),
                                        "required", List.of(
                                                "question", "optionA", "optionB",
                                                "optionC", "optionD", "correctAnswer"
                                        )
                                )
                        )
                )
        );

        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + geminiModel + ":generateContent?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        String rawResponse;
        try {
            rawResponse = restTemplate.postForObject(url, request, String.class);
        } catch (Exception e) {
            throw new IOException("Gemini API call failed: " + e.getMessage(), e);
        }

        JsonNode root = objectMapper.readTree(rawResponse);
        String jsonText = root
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text")
                .asText();

        List<QuizQuestion> questions = new ArrayList<>();
        JsonNode arrayNode = objectMapper.readTree(jsonText);

        for (JsonNode node : arrayNode) {
            QuizQuestion q = new QuizQuestion();
            q.setQuestion(node.path("question").asText());
            q.setOptionA(node.path("optionA").asText());
            q.setOptionB(node.path("optionB").asText());
            q.setOptionC(node.path("optionC").asText());
            q.setOptionD(node.path("optionD").asText());
            q.setCorrectAnswer(node.path("correctAnswer").asText());
            questions.add(q);
        }

        return questions;
    }

    // Students (ROLE_USER) can only view quizzes for a course they're actually
    // enrolled in. Instructors/admins are unrestricted here.
    private void verifyStudentEnrollment(Long courseId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        boolean isStudent = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));

        if (!isStudent) {
            return;
        }

        String email = auth.getName();
        boolean enrolled = enrollmentRepository.existsByUserEmailAndCourseId(email, courseId);

        if (!enrolled) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not enrolled in this course"
            );
        }
    }
}