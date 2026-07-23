package com.example.Elearning.controller;

import com.example.Elearning.model.Course;
import com.example.Elearning.model.Enrollment;
import com.example.Elearning.repository.CourseRepository;
import com.example.Elearning.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model}")
    private String geminiModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final JsonMapper objectMapper = JsonMapper.builder().build();

    public CourseController(
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @PostMapping("/add")
    public Course addCourse(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    @GetMapping("/all")
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @GetMapping("/instructor/{email}")
    public List<Course> getInstructorCourses(
            @PathVariable String email) {

        return courseRepository.findByInstructorEmail(email);
    }

    @PutMapping("/update/{id}")
    public Course updateCourse(@PathVariable Long id,
                               @RequestBody Course updatedCourse) {

        Course course = courseRepository.findById(id).orElse(null);

        if (course == null) {
            return null;
        }

        course.setTitle(updatedCourse.getTitle());
        course.setDescription(updatedCourse.getDescription());
        course.setCategory(updatedCourse.getCategory());
        course.setInstructorEmail(updatedCourse.getInstructorEmail());

        return courseRepository.save(course);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteCourse(@PathVariable Long id) {

        if (!courseRepository.existsById(id)) {
            return "Course not found";
        }

        courseRepository.deleteById(id);

        return "Course deleted successfully";
    }

    @GetMapping("/recommendations/{email}")
    public List<Map<String, Object>> getRecommendations(@PathVariable String email) throws IOException {

        List<Enrollment> enrollments = enrollmentRepository.findByUserEmail(email);
        List<Long> enrolledIds = enrollments.stream()
                .map(Enrollment::getCourseId)
                .toList();

        List<Course> allCourses = courseRepository.findAll();

        List<Course> enrolledCourses = allCourses.stream()
                .filter(c -> enrolledIds.contains(c.getId()))
                .toList();

        List<Course> availableCourses = allCourses.stream()
                .filter(c -> !enrolledIds.contains(c.getId()))
                .toList();

        if (enrolledCourses.isEmpty() || availableCourses.isEmpty()) {
            return List.of();
        }

        StringBuilder enrolledText = new StringBuilder();
        for (Course c : enrolledCourses) {
            enrolledText.append("- ").append(c.getTitle())
                    .append(" (category: ").append(c.getCategory()).append(") - ")
                    .append(c.getDescription() == null ? "" : c.getDescription())
                    .append("\n");
        }

        StringBuilder availableText = new StringBuilder();
        for (Course c : availableCourses) {
            availableText.append("id ").append(c.getId()).append(": ").append(c.getTitle())
                    .append(" (category: ").append(c.getCategory()).append(") - ")
                    .append(c.getDescription() == null ? "" : c.getDescription())
                    .append("\n");
        }

        String prompt =
                "A student is currently enrolled in these courses:\n" + enrolledText +
                        "\nHere is the full catalog of other courses they have NOT enrolled in yet:\n" + availableText +
                        "\nBased on the student's enrolled courses, recommend up to 4 courses from the " +
                        "available list above that best match their interests and would make sense as a " +
                        "next step in their learning path. For each recommendation, give the exact numeric " +
                        "id from the available list and a short one-sentence reason tailored to what they're " +
                        "already learning. Only recommend courses that genuinely fit - recommend fewer than " +
                        "4 if that's all that make sense, and none at all if nothing fits well.";

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "responseSchema", Map.of(
                                "type", "ARRAY",
                                "items", Map.of(
                                        "type", "OBJECT",
                                        "properties", Map.of(
                                                "courseId", Map.of("type", "INTEGER"),
                                                "reason", Map.of("type", "STRING")
                                        ),
                                        "required", List.of("courseId", "reason")
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

        JsonNode arrayNode = objectMapper.readTree(jsonText);

        List<Map<String, Object>> recommendations = new ArrayList<>();

        for (JsonNode node : arrayNode) {
            long courseId = node.path("courseId").asLong();
            String reason = node.path("reason").asText();

            Course matchedCourse = availableCourses.stream()
                    .filter(c -> c.getId() == courseId)
                    .findFirst()
                    .orElse(null);

            if (matchedCourse != null) {
                recommendations.add(Map.of(
                        "course", matchedCourse,
                        "reason", reason
                ));
            }
        }

        return recommendations;
    }
}