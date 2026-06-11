package com.example.Elearning.controller;

import com.example.Elearning.model.Review;
import com.example.Elearning.repository.ReviewRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @PostMapping("/add")
    public Review addReview(@RequestBody Review review) {
        return reviewRepository.save(review);
    }

    @GetMapping("/course/{courseId}")
    public List<Review> getReviewsByCourse(@PathVariable Long courseId) {
        return reviewRepository.findByCourseId(courseId);
    }
}