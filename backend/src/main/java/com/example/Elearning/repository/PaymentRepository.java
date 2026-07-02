package com.example.Elearning.repository;

import com.example.Elearning.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByStripeSessionId(String stripeSessionId);

    boolean existsByUserEmailAndCourseIdAndStatus(
            String userEmail,
            Long courseId,
            String status
    );
}