package com.example.Elearning.controller;

import com.example.Elearning.model.*;
import com.example.Elearning.repository.*;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatSeenRepository chatSeenRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(
            ChatMessageRepository chatMessageRepository,
            ChatSeenRepository chatSeenRepository,
            EnrollmentRepository enrollmentRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatSeenRepository = chatSeenRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }


    @PostMapping("/send")
    public ChatMessage sendMessage(@RequestBody ChatMessage messageData) {
        ChatMessage message = buildAndSaveMessage(messageData);
        return message;
    }

    @GetMapping("/course/{courseId}")
    public List<ChatMessage> getCourseMessages(@PathVariable Long courseId) {
        return chatMessageRepository.findByCourseIdOrderByCreatedAtAsc(courseId);
    }

    @PutMapping("/seen/{courseId}/{email}")
    public String markChatSeen(
            @PathVariable Long courseId,
            @PathVariable String email
    ) {
        ChatSeen seen = chatSeenRepository
                .findByUserEmailAndCourseId(email, courseId)
                .orElse(new ChatSeen());

        seen.setUserEmail(email);
        seen.setCourseId(courseId);
        seen.setLastSeenAt(LocalDateTime.now());

        chatSeenRepository.save(seen);

        return "Chat marked as seen";
    }

    @GetMapping("/has-unread/{courseId}/{email}")
    public boolean hasUnreadForCourse(
            @PathVariable Long courseId,
            @PathVariable String email
    ) {
        Optional<ChatSeen> seen =
                chatSeenRepository.findByUserEmailAndCourseId(email, courseId);

        if (seen.isEmpty()) {
            return chatMessageRepository.countByCourseIdAndSenderEmailNot(courseId, email) > 0;
        }

        return chatMessageRepository
                .countByCourseIdAndSenderEmailNotAndCreatedAtAfter(
                        courseId,
                        email,
                        seen.get().getLastSeenAt()
                ) > 0;
    }

    @GetMapping("/has-unread/{email}")
    public boolean hasAnyUnread(@PathVariable String email) {

        List<Long> courseIds = new ArrayList<>();

        List<Enrollment> enrollments =
                enrollmentRepository.findByUserEmail(email);

        for (Enrollment enrollment : enrollments) {
            courseIds.add(enrollment.getCourseId());
        }

        List<Course> instructorCourses =
                courseRepository.findByInstructorEmail(email);

        for (Course course : instructorCourses) {
            courseIds.add(course.getId());
        }

        for (Long courseId : courseIds) {
            Optional<ChatSeen> seen =
                    chatSeenRepository.findByUserEmailAndCourseId(email, courseId);

            if (seen.isEmpty()) {
                if (chatMessageRepository.countByCourseIdAndSenderEmailNot(courseId, email) > 0) {
                    return true;
                }
            } else {
                if (chatMessageRepository.countByCourseIdAndSenderEmailNotAndCreatedAtAfter(
                        courseId,
                        email,
                        seen.get().getLastSeenAt()
                ) > 0) {
                    return true;
                }
            }
        }

        return false;
    }


    @MessageMapping("/chat.send/{courseId}")
    public void sendRealtimeMessage(@DestinationVariable Long courseId, ChatMessage messageData) {
        messageData.setCourseId(courseId);
        ChatMessage saved = buildAndSaveMessage(messageData);

        messagingTemplate.convertAndSend("/topic/course/" + courseId, saved);
    }

    private ChatMessage buildAndSaveMessage(ChatMessage messageData) {
        ChatMessage message = new ChatMessage();

        message.setCourseId(messageData.getCourseId());
        message.setSenderEmail(messageData.getSenderEmail());
        message.setSenderRole(messageData.getSenderRole());
        message.setMessage(messageData.getMessage());
        message.setCreatedAt(LocalDateTime.now());

        User user = userRepository.findByEmail(messageData.getSenderEmail());

        if (user != null) {
            message.setSenderName(user.getUsername());
        } else {
            message.setSenderName(messageData.getSenderEmail());
        }

        return chatMessageRepository.save(message);
    }
}