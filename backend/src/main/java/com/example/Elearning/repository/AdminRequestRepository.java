package com.example.Elearning.repository;

import com.example.Elearning.model.AdminRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdminRequestRepository extends JpaRepository<AdminRequest, Long> {

    List<AdminRequest> findByStatus(String status);

    Optional<AdminRequest> findByEmail(String email);
}