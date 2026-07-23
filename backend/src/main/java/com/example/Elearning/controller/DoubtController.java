package com.example.Elearning.controller;

import com.example.Elearning.model.Course;
import com.example.Elearning.model.DoubtMessage;
import com.example.Elearning.model.Lecture;
import com.example.Elearning.repository.CourseRepository;
import com.example.Elearning.repository.DoubtMessageRepository;
import com.example.Elearning.repository.LectureRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/doubts")
@CrossOrigin(origins = "http://localhost:5173")
public class DoubtController {

    private final DoubtMessageRepository doubtMessageRepository;
    private final CourseRepository courseRepository;
    private final LectureRepository lectureRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final JsonMapper objectMapper = JsonMapper.builder().build();

    public DoubtController(
            DoubtMessageRepository doubtMessageRepository,
            CourseRepository courseRepository,
            LectureRepository lectureRepository
    ) {
        this.doubtMessageRepository = doubtMessageRepository;
        this.courseRepository = courseRepository;
        this.lectureRepository = lectureRepository;
    }

    @GetMapping("/course/{courseId}/user/{email}")
    public List<DoubtMessage> getHistory(
            @PathVariable Long courseId,
            @PathVariable String email
    ) {
        return doubtMessageRepository.findByCourseIdAndUserEmailOrderByCreatedAtAsc(courseId, email);
    }

    @PostMapping("/ask")
    public List<DoubtMessage> askDoubt(@RequestBody Map<String, Object> body) throws IOException {

        Long courseId = Long.valueOf(String.valueOf(body.get("courseId")));
        String userEmail = String.valueOf(body.get("userEmail"));
        String question = String.valueOf(body.get("question"));

        // 1. save the student's question first
        DoubtMessage studentMessage = new DoubtMessage();
        studentMessage.setCourseId(courseId);
        studentMessage.setUserEmail(userEmail);
        studentMessage.setSender("STUDENT");
        studentMessage.setMessage(question);
        studentMessage.setCreatedAt(LocalDateTime.now());
        doubtMessageRepository.save(studentMessage);

        // 2. build course context for grounding
        Course course = courseRepository.findById(courseId).orElse(null);
        List<Lecture> lectures = lectureRepository.findByCourseIdOrderByLectureOrderAsc(courseId);

        StringBuilder lectureList = new StringBuilder();
        for (Lecture lecture : lectures) {
            lectureList.append("- ").append(lecture.getTitle()).append("\n");
        }

        String systemPrompt =
                "You are a helpful teaching assistant for the course \"" +
                        (course != null ? course.getTitle() : "this course") + "\". " +
                        "Course description: " + (course != null && course.getDescription() != null ? course.getDescription() : "N/A") + "\n" +
                        "Lectures in this course:\n" + lectureList +
                        "\nSome of the actual lecture material (PDFs/notes) is attached below for you to " +
                        "reference directly when answering. Use it to give specific, accurate answers " +
                        "grounded in the real course content rather than guessing. " +
                        "\nAnswer the student's questions clearly and helpfully, staying focused on this " +
                        "course's subject matter. If a question is unrelated to the course topic, politely " +
                        "redirect the student back to course-related questions rather than answering it fully. " +
                        "Keep answers concise and student-friendly.";

        // 2b. download the actual readable lecture files (PDF/txt only) so the AI can
        // reference real content, not just titles. Re-attached on every question since
        // each API call is stateless - the model has no memory of files from earlier calls.
        List<Map<String, Object>> materialParts = new ArrayList<>();
        materialParts.add(Map.of("text", "Course material attached below:"));

        for (Lecture lecture : lectures) {
            String mimeType = detectReadableMimeType(lecture.getFileName());

            if (mimeType == null) {
                continue;
            }

            try {
                byte[] fileBytes = restTemplate.getForObject(lecture.getFilePath(), byte[].class);
                String base64Data = Base64.getEncoder().encodeToString(fileBytes);

                materialParts.add(Map.of(
                        "inline_data", Map.of(
                                "mime_type", mimeType,
                                "data", base64Data
                        )
                ));
            } catch (Exception e) {
                // if one file fails to download, skip it rather than failing the whole request
                System.out.println("Skipping lecture file (couldn't download): " + lecture.getFileName());
            }
        }

        // 3. build full conversation history (including the question just saved) for multi-turn context
        List<DoubtMessage> history = doubtMessageRepository
                .findByCourseIdAndUserEmailOrderByCreatedAtAsc(courseId, userEmail);

        List<Map<String, Object>> conversationTurns = history.stream()
                .map(msg -> Map.<String, Object>of(
                        "role", "STUDENT".equals(msg.getSender()) ? "user" : "model",
                        "parts", List.of(Map.of("text", msg.getMessage()))
                ))
                .toList();

        List<Map<String, Object>> contents = new ArrayList<>();

        // only attach material if we actually found readable files - otherwise skip
        // this block entirely and just use the plain conversation history
        if (materialParts.size() > 1) {
            contents.add(Map.of("role", "user", "parts", materialParts));
            contents.add(Map.of("role", "model", "parts", List.of(
                    Map.of("text", "Understood, I've reviewed the course material and I'm ready to help.")
            )));
        }

        contents.addAll(conversationTurns);

        Map<String, Object> requestBody = Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))
                ),
                "contents", contents
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
        String answerText = root
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text")
                .asText();

        // 4. save the AI's answer
        DoubtMessage aiMessage = new DoubtMessage();
        aiMessage.setCourseId(courseId);
        aiMessage.setUserEmail(userEmail);
        aiMessage.setSender("AI");
        aiMessage.setMessage(answerText);
        aiMessage.setCreatedAt(LocalDateTime.now());
        doubtMessageRepository.save(aiMessage);

        return List.of(studentMessage, aiMessage);
    }

    private String detectReadableMimeType(String fileName) {
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