package com.example.Elearning.controller;

import com.example.Elearning.model.Review;
import com.example.Elearning.repository.EnrollmentRepository;
import com.example.Elearning.repository.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final EnrollmentRepository enrollmentRepository;

    public ReviewController(
            ReviewRepository reviewRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @PostMapping("/add")
    public Review addReview(@RequestBody Review review) {

        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rating must be between 1 and 5"
            );
        }

        // Students can only review courses they're actually enrolled in.
        // Uses the authenticated user's email from the JWT, not whatever the
        // client sent in the request body, so this can't be spoofed.
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        boolean isStudent = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));

        if (isStudent) {
            boolean enrolled = enrollmentRepository
                    .existsByUserEmailAndCourseId(email, review.getCourseId());

            if (!enrolled) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You can only review courses you're enrolled in"
                );
            }
        }

        return reviewRepository.save(review);
    }

    @GetMapping("/course/{courseId}")
    public List<Review> getReviewsByCourse(@PathVariable Long courseId) {
        return reviewRepository.findByCourseId(courseId);
    }
}