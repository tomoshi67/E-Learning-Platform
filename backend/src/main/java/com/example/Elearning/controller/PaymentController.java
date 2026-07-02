package com.example.Elearning.controller;

import com.example.Elearning.model.Enrollment;
import com.example.Elearning.model.Payment;
import com.example.Elearning.repository.EnrollmentRepository;
import com.example.Elearning.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    public PaymentController(
            PaymentRepository paymentRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @PostMapping("/create-checkout-session")
    public String createCheckoutSession(@RequestBody Payment paymentData) throws Exception {

        if (paymentRepository.existsByUserEmailAndCourseIdAndStatus(
                paymentData.getUserEmail(),
                paymentData.getCourseId(),
                "SUCCESS"
        )) {
            return "ALREADY_PAID";
        }

        Stripe.apiKey = stripeSecretKey;

        Long amountInPaise = paymentData.getAmount() * 100;

        SessionCreateParams params =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .setSuccessUrl(
                                "http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}"
                        )
                        .setCancelUrl("http://localhost:5173/payment-cancel")
                        .addLineItem(
                                SessionCreateParams.LineItem.builder()
                                        .setQuantity(1L)
                                        .setPriceData(
                                                SessionCreateParams.LineItem.PriceData.builder()
                                                        .setCurrency("inr")
                                                        .setUnitAmount(amountInPaise)
                                                        .setProductData(
                                                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                        .setName("Course Enrollment")
                                                                        .build()
                                                        )
                                                        .build()
                                        )
                                        .build()
                        )
                        .putMetadata("userEmail", paymentData.getUserEmail())
                        .putMetadata("courseId", String.valueOf(paymentData.getCourseId()))
                        .putMetadata("amount", String.valueOf(paymentData.getAmount()))
                        .build();

        Session session = Session.create(params);

        Payment payment = new Payment();
        payment.setUserEmail(paymentData.getUserEmail());
        payment.setCourseId(paymentData.getCourseId());
        payment.setAmount(paymentData.getAmount());
        payment.setCurrency("INR");
        payment.setStatus("PENDING");
        payment.setStripeSessionId(session.getId());

        paymentRepository.save(payment);

        return session.getUrl();
    }

    @PostMapping("/confirm")
    public String confirmPayment(@RequestParam String sessionId) throws Exception {

        Stripe.apiKey = stripeSecretKey;

        Session session = Session.retrieve(sessionId);

        if (!"paid".equals(session.getPaymentStatus())) {
            return "Payment not completed";
        }

        Optional<Payment> optionalPayment =
                paymentRepository.findByStripeSessionId(sessionId);

        if (optionalPayment.isEmpty()) {
            return "Payment record not found";
        }

        Payment payment = optionalPayment.get();
        payment.setStatus("SUCCESS");
        payment.setPaymentDate(LocalDateTime.now());

        paymentRepository.save(payment);

        if (!enrollmentRepository.existsByUserEmailAndCourseId(
                payment.getUserEmail(),
                payment.getCourseId()
        )) {
            Enrollment enrollment = new Enrollment();
            enrollment.setUserEmail(payment.getUserEmail());
            enrollment.setCourseId(payment.getCourseId());

            enrollmentRepository.save(enrollment);
        }

        return "Payment successful and course enrolled";
    }
}